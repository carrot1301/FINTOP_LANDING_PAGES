import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../../common/audit/audit.service';
import { BLOG_STATUS } from '@prisma/client';
export declare class BlogService implements OnModuleInit {
    private readonly prisma;
    private readonly redisService;
    private readonly auditService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService, auditService: AuditService);
    onModuleInit(): Promise<void>;
    createArticle(authorId: number, dto: any): Promise<{
        status: import("@prisma/client").$Enums.BLOG_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        content: string;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        publishedAt: Date | null;
        authorId: number;
        slug: string;
        excerpt: string | null;
        views: number;
        visibility: import("@prisma/client").$Enums.CONTENT_VISIBILITY;
        categoryId: number;
    }>;
    updateArticleStatus(blogId: number, editorId: number, status: BLOG_STATUS): Promise<{
        status: import("@prisma/client").$Enums.BLOG_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        content: string;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        publishedAt: Date | null;
        authorId: number;
        slug: string;
        excerpt: string | null;
        views: number;
        visibility: import("@prisma/client").$Enums.CONTENT_VISIBILITY;
        categoryId: number;
    }>;
    getArticle(slug: string): Promise<any>;
    private cleanArticleContent;
    extractFirstImage(content?: string, defaultImage?: string): string;
    buildArticleRedirectUrl(slug: string): Promise<string>;
    generateShareOgHtml(slug: string): Promise<string>;
    private sanitizePlainText;
    listArticles(userFeatures?: string[], page?: number, limit?: number, categorySlug?: string): Promise<{
        data: {
            id: number;
            title: string;
            slug: string;
            excerpt: string;
            content: string;
            thumbnailUrl: string;
            visibility: import("@prisma/client").$Enums.CONTENT_VISIBILITY;
            minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            publishedAt: Date | null;
            locked: boolean;
            category: {
                name: string;
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
            };
            tags: string[];
            views: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getArticleForUser(slug: string, userFeatures?: string[]): Promise<{
        id: any;
        title: string;
        slug: any;
        excerpt: string;
        content: string;
        thumbnailUrl: string;
        visibility: any;
        minTierAccess: any;
        publishedAt: any;
        locked: boolean;
        category: any;
        tags: any;
        views: any;
    }>;
    private isTierAllowed;
    updateArticle(blogId: number, editorId: number, dto: any): Promise<{
        status: import("@prisma/client").$Enums.BLOG_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        content: string;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        publishedAt: Date | null;
        authorId: number;
        slug: string;
        excerpt: string | null;
        views: number;
        visibility: import("@prisma/client").$Enums.CONTENT_VISIBILITY;
        categoryId: number;
    }>;
    deleteArticle(blogId: number, editorId: number): Promise<{
        message: string;
    }>;
    getAllCategories(): Promise<{
        name: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
    }[]>;
}
