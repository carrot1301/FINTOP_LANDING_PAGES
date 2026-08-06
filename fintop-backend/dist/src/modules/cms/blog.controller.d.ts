import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogStatusDto, UpdateBlogDto } from './dto/blog.dto';
export declare class BlogController {
    private readonly blogService;
    constructor(blogService: BlogService);
    listArticles(page?: string, limit?: string, category?: string, user?: any): Promise<{
        data: {
            id: number;
            title: string;
            slug: string;
            excerpt: string | null;
            content: string;
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
    getCategories(): Promise<{
        name: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
    }[]>;
    getArticle(slug: string, user?: any): Promise<{
        id: any;
        title: any;
        slug: any;
        excerpt: any;
        content: any;
        visibility: any;
        minTierAccess: any;
        publishedAt: any;
        locked: boolean;
        category: any;
        tags: any;
        views: any;
    }>;
    createDraft(user: any, dto: CreateBlogDto): Promise<{
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
    uploadFile(file: any): Promise<{
        url: string;
    }>;
    updateStatus(id: string, dto: UpdateBlogStatusDto, user: any): Promise<{
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
    updateBlog(id: string, dto: UpdateBlogDto, user: any): Promise<{
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
    deleteBlog(id: string, user: any): Promise<{
        message: string;
    }>;
}
