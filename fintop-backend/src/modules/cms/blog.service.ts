import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../../common/audit/audit.service';
import { BLOG_STATUS, REVISION_ACTION, AUDIT_SOURCE, CONTENT_VISIBILITY, SUBSCRIPTION_TIER, Prisma } from '@prisma/client';
import { isFeatureAllowed } from '../../common/utils/subscription-helper';

@Injectable()
export class BlogService implements OnModuleInit {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit() {
    try {
      const resetFlagKey = 'system:views_reset_zero_v3';
      const isReset = await this.redisService.getClient().get(resetFlagKey);
      if (!isReset) {
        const updateResult = await this.prisma.blog.updateMany({
          data: { views: 0 }
        });
        this.logger.log(`Successfully reset article views to 0 for ${updateResult.count} articles.`);
        await this.redisService.getClient().set(resetFlagKey, 'true');

        const keys = await this.redisService.getClient().keys('blogs:*');
        if (keys && keys.length > 0) {
          await this.redisService.getClient().del(...keys);
        }
      }
    } catch (err) {
      this.logger.warn(`Automated article views reset error: ${err.message}`);
    }
  }

  async createArticle(authorId: number, dto: any) {
    const targetStatus = dto.status || BLOG_STATUS.PUBLISHED;
    return this.prisma.$transaction(async (tx) => {
      const blog = await tx.blog.create({
        data: {
          authorId,
          categoryId: dto.categoryId,
          slug: dto.slug,
          title: dto.title,
          excerpt: dto.excerpt,
          content: dto.content,
          visibility: dto.visibility || CONTENT_VISIBILITY.PUBLIC,
          minTierAccess: dto.minTierAccess || SUBSCRIPTION_TIER.STANDARD,
          status: targetStatus,
          publishedAt: targetStatus === BLOG_STATUS.PUBLISHED ? new Date() : null,
        }
      });

      await tx.contentRevision.create({
        data: {
          blogId: blog.id,
          editorId: authorId,
          action: REVISION_ACTION.CREATED,
          snapshotData: { title: blog.title, excerpt: blog.excerpt, content: blog.content, status: targetStatus } as Prisma.JsonObject,
          reason: 'Initial Article Creation'
        }
      });

      await this.auditService.log({
        userId: authorId,
        source: AUDIT_SOURCE.SYSTEM,
        action: 'ARTICLE_CREATED',
        tableName: 'blogs',
        recordId: blog.id.toString(),
      });

      try {
        await this.redisService.getClient().del('blogs:list');
      } catch (err) {
        this.logger.warn(`Redis cache clear warning: ${err.message}`);
      }

      return blog;
    });
  }

  async updateArticleStatus(blogId: number, editorId: number, status: BLOG_STATUS) {
    return this.prisma.$transaction(async (tx) => {
      const blog = await tx.blog.findUnique({ where: { id: blogId } });
      if (!blog) throw new NotFoundException('Blog not found');
      if (blog.status === status) return blog;

      const updated = await tx.blog.update({
        where: { id: blogId },
        data: {
          status,
          publishedAt: status === BLOG_STATUS.PUBLISHED ? new Date() : null,
        }
      });

      await tx.contentRevision.create({
        data: {
          blogId,
          editorId,
          action: REVISION_ACTION.STATUS_CHANGED,
          snapshotData: { status } as Prisma.JsonObject,
          reason: `Status changed to ${status}`
        }
      });

      await this.auditService.log({
        userId: editorId,
        source: AUDIT_SOURCE.SYSTEM,
        action: `ARTICLE_${status}`,
        tableName: 'blogs',
        recordId: blogId.toString(),
      });

      await this.redisService.getClient().del('blogs:list');
      await this.redisService.getClient().del(`blogs:detail:${blog.slug}`);
      if (updated.visibility === CONTENT_VISIBILITY.PREMIUM) {
        await this.redisService.getClient().del('reports:vip');
      }

      return updated;
    });
  }

  async getArticle(slug: string) {
    const cacheKey = `blogs:detail:${slug}`;
    const cached = await this.redisService.getClient().get(cacheKey);
    if (cached) return JSON.parse(cached);

    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: { category: true, tags: { include: { tag: true } } }
    });

    if (!blog || blog.status !== BLOG_STATUS.PUBLISHED || blog.deletedAt !== null) {
      throw new NotFoundException('Article not found');
    }

    await this.redisService.getClient().set(cacheKey, JSON.stringify(blog), 'EX', 3600);
    return blog;
  }

  private cleanArticleContent(html?: string): string {
    if (!html) return '';
    return html
      .replace(/font-family\s*:\s*&quot;[^&]*&quot;[^\s;`'">]*;?/gi, '')
      .replace(/font-family\s*:\s*[^;`'">\\]+;?/gi, '')
      .replace(/<font[^>]*>/gi, '<span>')
      .replace(/<\/font>/gi, '</span>');
  }

  extractFirstImage(content?: string, defaultImage = 'https://fintopdata.vn/assets/images/fintop-og-banner.png'): string {
    if (!content) return defaultImage;
    try {
      const decoded = content
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let imgMatch;
      let fallbackWebpUrl: string | null = null;

      while ((imgMatch = imgRegex.exec(decoded)) !== null) {
        if (imgMatch[1]) {
          let src = imgMatch[1].trim();
          if (src.startsWith('data:')) continue; // Skip base64 strings
          
          let fullUrl = src;
          if (src.startsWith('//')) fullUrl = 'https:' + src;
          else if (src.startsWith('/')) fullUrl = 'https://fintopdata.vn' + src;
          else if (src.startsWith('http://') || src.startsWith('https://')) fullUrl = src;
          else {
            src = src.replace(/^\.\//, '');
            if (src.startsWith('uploads/')) fullUrl = 'https://fintopdata.vn/' + src;
          }

          // Force JPG format for Zalo/FB link preview compatibility
          if (fullUrl.toLowerCase().endsWith('.webp')) {
            fullUrl = fullUrl.replace(/\.webp$/i, '.jpg');
          }

          return fullUrl;
        }
      }

      const urlMatch = decoded.match(/(https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp|gif|svg))/i);
      if (urlMatch && urlMatch[1]) {
        let matchUrl = urlMatch[1].trim();
        if (matchUrl.toLowerCase().endsWith('.webp')) {
          matchUrl = matchUrl.replace(/\.webp$/i, '.jpg');
        }
        return matchUrl;
      }
    } catch (err) {
      this.logger.warn(`extractFirstImage error: ${err.message}`);
    }
    return defaultImage;
  }
  async buildArticleRedirectUrl(slug: string): Promise<string> {
    let targetUrl = `https://fintopdata.vn/nghien-cuu/thi-truong/index.html?slug=${encodeURIComponent(slug || '')}`;

    if (slug) {
      try {
        const article = await this.prisma.blog.findUnique({
          where: { slug },
          include: { category: true }
        });

        if (article?.category?.slug) {
          const catSlug = article.category.slug.toLowerCase();
          if (catSlug.includes('nganh') || catSlug.includes('ncpt')) {
            targetUrl = `https://fintopdata.vn/nghien-cuu/nhom-nganh/index.html?slug=${encodeURIComponent(slug)}`;
          } else if (catSlug.includes('chuyen-sau') || catSlug.includes('pro-research') || catSlug.includes('research')) {
            targetUrl = `https://fintopdata.vn/nghien-cuu/chuyen-sau/index.html?slug=${encodeURIComponent(slug)}`;
          } else if (catSlug.includes('doanh-nghiep')) {
            targetUrl = `https://fintopdata.vn/nghien-cuu/doanh-nghiep/index.html?slug=${encodeURIComponent(slug)}`;
          } else if (catSlug.includes('pro-data')) {
            targetUrl = `https://fintopdata.vn/stock-data/pro-data/index.html?slug=${encodeURIComponent(slug)}`;
          } else if (catSlug.includes('dinh-luong')) {
            targetUrl = `https://fintopdata.vn/stock-data/dinh-luong/index.html?slug=${encodeURIComponent(slug)}`;
          }
        }
      } catch (err) {
        this.logger.warn(`Failed to resolve article category for redirect: ${err.message}`);
      }
    }

    return targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'direct=1';
  }

  async generateShareOgHtml(slug: string): Promise<string> {
    let title = 'Bài viết nghiên cứu | FinTop DATA';
    let description = 'Dữ liệu phân tích và nghiên cứu chiến lược đầu tư cổ phiếu tại FinTop DATA.';
    let imageUrl = 'https://fintopdata.vn/assets/images/fintop-og-banner.png';
    let targetUrl = await this.buildArticleRedirectUrl(slug);

    if (slug) {
      try {
        const article = await this.prisma.blog.findUnique({
          where: { slug },
          include: { category: true }
        });

        if (article) {
          title = this.sanitizePlainText(article.title) || title;
          const rawExcerpt = article.excerpt || article.content || '';
          description = this.sanitizePlainText(rawExcerpt).substring(0, 200) || description;
          imageUrl = this.extractFirstImage(article.content, imageUrl);
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch article for OG HTML generation: ${err.message}`);
      }
    }

    const shareUrl = `https://fintopdata.vn/b/${encodeURIComponent(slug || '')}`;
    const redirectUrl = targetUrl;
    const esc = (str: string) => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let imageType = 'image/jpeg';
    if (imageUrl.toLowerCase().endsWith('.png')) imageType = 'image/png';
    else if (imageUrl.toLowerCase().endsWith('.webp')) imageType = 'image/webp';
    else if (imageUrl.toLowerCase().endsWith('.gif')) imageType = 'image/gif';

    let imageWidth = 1200;
    let imageHeight = 630;

    const localFile = this.resolveLocalImageFile(imageUrl);
    if (localFile) {
      try {
        const fd = fs.openSync(localFile, 'r');
        const buf = Buffer.alloc(65536);
        const bytesRead = fs.readSync(fd, buf, 0, 65536, 0);
        fs.closeSync(fd);
        const dim = this.getImageDimensions(buf.subarray(0, bytesRead));
        if (dim && dim.width >= 200 && dim.height >= 200) {
          imageWidth = dim.width;
          imageHeight = dim.height;
          imageType = dim.type;
        }
      } catch (err) {
        this.logger.debug(`Could not inspect image dimensions for ${localFile}: ${err.message}`);
      }
    }

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)} | FinTop DATA</title>
    <meta name="description" content="${esc(description)}">

    <!-- Open Graph / Facebook / Zalo / Telegram / iMessage -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="FinTop DATA">
    <meta property="og:locale" content="vi_VN">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:image" content="${esc(imageUrl)}">
    <meta property="og:image:secure_url" content="${esc(imageUrl)}">
    <meta property="og:image:type" content="${imageType}">
    <meta property="og:image:width" content="${imageWidth}">
    <meta property="og:image:height" content="${imageHeight}">
    <meta property="og:image:alt" content="${esc(title)}">
    <meta property="og:url" content="${esc(shareUrl)}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(imageUrl)}">
    <meta name="twitter:image:width" content="${imageWidth}">
    <meta name="twitter:image:height" content="${imageHeight}">

    <link rel="canonical" href="${esc(shareUrl)}">
</head>
<body>
    <div style="padding: 2rem; font-family: sans-serif; text-align: center;">
        <h2>${esc(title)}</h2>
        <p>${esc(description)}</p>
        <p><a href="${esc(redirectUrl)}">Xem bài viết trên FinTop DATA</a></p>
    </div>
</body>
</html>`;
  }

  private resolveLocalImageFile(imageUrl: string): string | null {
    if (!imageUrl) return null;
    try {
      const urlObj = new URL(imageUrl);
      const pathname = urlObj.pathname;
      const cleanPath = pathname.replace(/^\/+/, '');

      const candidates = [
        path.join(process.cwd(), '..', 'fintop_frontend', cleanPath),
        path.join(process.cwd(), '..', cleanPath),
        path.join(process.cwd(), 'fintop_frontend', cleanPath),
        path.join(process.cwd(), cleanPath),
        `/var/www/fintop/fintop_frontend/${cleanPath}`,
        `/var/www/fintop/${cleanPath}`,
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    } catch {
      // not a valid URL
    }
    return null;
  }

  private getImageDimensions(buffer: Buffer): { width: number; height: number; type: string } | null {
    if (!buffer || buffer.length < 24) return null;

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height, type: 'image/png' };
    }

    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height, type: 'image/gif' };
    }

    // WebP
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      const vp8 = buffer.toString('ascii', 12, 16);
      if (vp8 === 'VP8 ') {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height, type: 'image/webp' };
      } else if (vp8 === 'VP8L') {
        const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width, height, type: 'image/webp' };
      } else if (vp8 === 'VP8X') {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return { width, height, type: 'image/webp' };
      }
    }

    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xFF) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        if (
          (marker >= 0xC0 && marker <= 0xC3) ||
          (marker >= 0xC5 && marker <= 0xC7) ||
          (marker >= 0xC9 && marker <= 0xCB) ||
          (marker >= 0xCD && marker <= 0xCF)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height, type: 'image/jpeg' };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    return null;
  }

  private sanitizePlainText(str?: string): string {
    if (!str) return '';
    return str
      .replace(/<[^>]*>/g, ' ')
      .replace(/&aacute;/gi, 'á')
      .replace(/&agrave;/gi, 'à')
      .replace(/&acirc;/gi, 'â')
      .replace(/&atilde;/gi, 'ã')
      .replace(/&eacute;/gi, 'é')
      .replace(/&egrave;/gi, 'è')
      .replace(/&ecirc;/gi, 'ê')
      .replace(/&iacute;/gi, 'í')
      .replace(/&ì/gi, 'ì')
      .replace(/&oacute;/gi, 'ó')
      .replace(/&ograve;/gi, 'ò')
      .replace(/&ocirc;/gi, 'ô')
      .replace(/&otilde;/gi, 'õ')
      .replace(/&uacute;/gi, 'ú')
      .replace(/&ugrave;/gi, 'ù')
      .replace(/&yacute;/gi, 'ý')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  async listArticles(userFeatures?: string[], page = 1, limit = 10, categorySlug?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: BLOG_STATUS.PUBLISHED,
      deletedAt: null,
    };

    if (categorySlug && categorySlug !== 'all') {
      whereClause.category = {
        slug: categorySlug,
      };
    }

    const total = await this.prisma.blog.count({
      where: whereClause,
    });

    const articles = await this.prisma.blog.findMany({
      where: whereClause,
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    const mapped = articles.map(b => {
      const locked = b.visibility === CONTENT_VISIBILITY.PREMIUM && !this.isTierAllowed(userFeatures, b.minTierAccess);
      const rawExcerpt = b.excerpt || b.content || '';
      const cleanExcerpt = this.sanitizePlainText(rawExcerpt).substring(0, 160);
      // Always extract thumbnail from full content BEFORE applying lock masking
      const thumbnailUrl = this.extractFirstImage(b.content, '');
      return {
        id: b.id,
        title: this.sanitizePlainText(b.title),
        slug: b.slug,
        excerpt: cleanExcerpt ? cleanExcerpt + (cleanExcerpt.length >= 160 ? '...' : '') : 'Không có mô tả ngắn.',
        content: locked ? '' : this.cleanArticleContent(b.content),
        thumbnailUrl,
        visibility: b.visibility,
        minTierAccess: b.minTierAccess,
        publishedAt: b.publishedAt,
        locked,
        category: b.category,
        tags: b.tags.map(t => t.tag.name),
        views: b.views || 0,
      };
    });

    return {
      data: mapped,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async getArticleForUser(slug: string, userFeatures?: string[]) {
    try {
      // Increment views count directly in the database when article is accessed
      await this.prisma.blog.update({
        where: { slug },
        data: { views: { increment: 1 } }
      });
      // Clear cache to keep it in sync
      await this.redisService.getClient().del(`blogs:detail:${slug}`);
    } catch (err) {
      this.logger.warn(`Could not increment article views: ${err.message}`);
    }

    const b = await this.getArticle(slug);
    const locked = b.visibility === CONTENT_VISIBILITY.PREMIUM && !this.isTierAllowed(userFeatures, b.minTierAccess);
    // Always extract thumbnail from full content BEFORE applying lock masking
    const thumbnailUrl = this.extractFirstImage(b.content, '');

    return {
      id: b.id,
      title: this.sanitizePlainText(b.title),
      slug: b.slug,
      excerpt: this.sanitizePlainText(b.excerpt),
      content: locked ? 'Nội dung V.I.P - Vui lòng nâng cấp tài khoản để đọc bài viết chiến lược này.' : this.cleanArticleContent(b.content),
      thumbnailUrl,
      visibility: b.visibility,
      minTierAccess: b.minTierAccess,
      publishedAt: b.publishedAt,
      locked,
      category: b.category,
      tags: b.tags.map((t: any) => t.tag.name),
      views: b.views || 0,
    };
  }

  private isTierAllowed(userFeatures?: string[], minTier?: SUBSCRIPTION_TIER): boolean {
    return isFeatureAllowed(userFeatures, minTier || 'STANDARD');
  }

  async updateArticle(blogId: number, editorId: number, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      const blog = await tx.blog.findUnique({ where: { id: blogId } });
      if (!blog) throw new NotFoundException('Blog not found');

      const updated = await tx.blog.update({
        where: { id: blogId },
        data: {
          categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
          slug: dto.slug !== undefined ? dto.slug : undefined,
          title: dto.title !== undefined ? dto.title : undefined,
          excerpt: dto.excerpt !== undefined ? dto.excerpt : undefined,
          content: dto.content !== undefined ? dto.content : undefined,
          visibility: dto.visibility !== undefined ? dto.visibility : undefined,
          minTierAccess: dto.minTierAccess !== undefined ? dto.minTierAccess : undefined,
          status: dto.status !== undefined ? dto.status : undefined,
          publishedAt: dto.status === BLOG_STATUS.PUBLISHED ? new Date() : undefined,
        }
      });

      await tx.contentRevision.create({
        data: {
          blogId,
          editorId,
          action: REVISION_ACTION.UPDATED,
          snapshotData: { title: updated.title, excerpt: updated.excerpt, content: updated.content } as Prisma.JsonObject,
          reason: 'Article Updated'
        }
      });

      await this.auditService.log({
        userId: editorId,
        source: AUDIT_SOURCE.SYSTEM,
        action: 'ARTICLE_UPDATED',
        tableName: 'blogs',
        recordId: blogId.toString(),
      });

      try {
        await this.redisService.getClient().del('blogs:list');
        await this.redisService.getClient().del(`blogs:detail:${blog.slug}`);
        if (blog.slug !== updated.slug) {
          await this.redisService.getClient().del(`blogs:detail:${updated.slug}`);
        }
      } catch (err) {
        this.logger.warn(`Redis cache clearing failed: ${err.message}`);
      }

      return updated;
    });
  }

  async deleteArticle(blogId: number, editorId: number) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');

    await this.prisma.blog.update({
      where: { id: blogId },
      data: { deletedAt: new Date() }
    });

    await this.auditService.log({
      userId: editorId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'ARTICLE_DELETED',
      tableName: 'blogs',
      recordId: blogId.toString(),
    });

    try {
      await this.redisService.getClient().del('blogs:list');
      await this.redisService.getClient().del(`blogs:detail:${blog.slug}`);
    } catch (err) {
      this.logger.warn(`Redis cache clearing failed: ${err.message}`);
    }

    return { message: 'Blog deleted successfully' };
  }

  async getAllCategories() {
    const defaultCategories = [
      { slug: 'thi-truong', name: 'Kinh tế thị trường' },
      { slug: 'pro-research', name: 'Nghiên cứu chuyên sâu' },
      { slug: 'doanh-nghiep', name: 'Nghiên cứu Doanh nghiệp' },
      { slug: 'ncpt-nganh', name: 'Nghiên cứu nhóm Ngành' },
      { slug: 'data-thi-truong', name: 'Thị trường (Dữ liệu)' },
      { slug: 'pro-data', name: 'PRO Data' },
      { slug: 'dinh-luong', name: 'Định lượng' },
    ];

    try {
      for (const cat of defaultCategories) {
        await this.prisma.category.upsert({
          where: { slug: cat.slug },
          update: { name: cat.name },
          create: { slug: cat.slug, name: cat.name },
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to auto-upsert default categories: ${err.message}`);
    }

    return this.prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
  }
}
