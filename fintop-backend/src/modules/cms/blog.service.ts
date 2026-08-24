import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
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
          status: BLOG_STATUS.DRAFT,
        }
      });

      await tx.contentRevision.create({
        data: {
          blogId: blog.id,
          editorId: authorId,
          action: REVISION_ACTION.CREATED,
          snapshotData: { title: blog.title, excerpt: blog.excerpt, content: blog.content } as Prisma.JsonObject,
          reason: 'Initial Draft'
        }
      });

      await this.auditService.log({
        userId: authorId,
        source: AUDIT_SOURCE.SYSTEM,
        action: 'ARTICLE_CREATED',
        tableName: 'blogs',
        recordId: blog.id.toString(),
      });

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
      return {
        id: b.id,
        title: this.sanitizePlainText(b.title),
        slug: b.slug,
        excerpt: cleanExcerpt ? cleanExcerpt + (cleanExcerpt.length >= 160 ? '...' : '') : 'Không có mô tả ngắn.',
        content: locked ? '' : this.cleanArticleContent(b.content),
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

    return {
      id: b.id,
      title: this.sanitizePlainText(b.title),
      slug: b.slug,
      excerpt: this.sanitizePlainText(b.excerpt),
      content: locked ? 'Nội dung V.I.P - Vui lòng nâng cấp tài khoản để đọc bài viết chiến lược này.' : this.cleanArticleContent(b.content),
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
      { slug: 'thi-truong', name: 'Thị trường' },
      { slug: 'pro-research', name: 'PRO Research' },
      { slug: 'doanh-nghiep', name: 'Doanh nghiệp' },
      { slug: 'ncpt-nganh', name: 'NCPT Ngành' },
      { slug: 'pro-data', name: 'PRO Data' },
      { slug: 'dinh-luong', name: 'Định lượng' },
    ];

    try {
      for (const cat of defaultCategories) {
        await this.prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
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

