import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../../common/audit/audit.service';
import { BLOG_STATUS, REVISION_ACTION, AUDIT_SOURCE, CONTENT_VISIBILITY, SUBSCRIPTION_TIER, Prisma } from '@prisma/client';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

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

    if (!blog || blog.status !== BLOG_STATUS.PUBLISHED) {
      throw new NotFoundException('Article not found');
    }

    await this.redisService.getClient().set(cacheKey, JSON.stringify(blog), 'EX', 3600);
    return blog;
  }

  async listArticles(userTier?: SUBSCRIPTION_TIER, page = 1, limit = 10, categorySlug?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: BLOG_STATUS.PUBLISHED,
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
      const locked = b.visibility === CONTENT_VISIBILITY.PREMIUM && !this.isTierAllowed(userTier, b.minTierAccess);
      return {
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: locked ? '' : b.content,
        visibility: b.visibility,
        minTierAccess: b.minTierAccess,
        publishedAt: b.publishedAt,
        locked,
        category: b.category,
        tags: b.tags.map(t => t.tag.name),
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

  async getArticleForUser(slug: string, userTier?: SUBSCRIPTION_TIER) {
    const b = await this.getArticle(slug);
    const locked = b.visibility === CONTENT_VISIBILITY.PREMIUM && !this.isTierAllowed(userTier, b.minTierAccess);

    return {
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: locked ? 'Nội dung V.I.P - Vui lòng nâng cấp tài khoản để đọc bài viết chiến lược này.' : b.content,
      visibility: b.visibility,
      minTierAccess: b.minTierAccess,
      publishedAt: b.publishedAt,
      locked,
      category: b.category,
      tags: b.tags.map((t: any) => t.tag.name),
    };
  }

  private isTierAllowed(userTier?: SUBSCRIPTION_TIER, minTier?: SUBSCRIPTION_TIER): boolean {
    if (!userTier) return false;
    const tierHierarchy = {
      STANDARD: 1,
      SILVER: 2,
      GOLD: 3,
      DIAMOND: 4,
    };
    return (tierHierarchy[userTier] || 0) >= (tierHierarchy[minTier || 'STANDARD'] || 0);
  }
}
