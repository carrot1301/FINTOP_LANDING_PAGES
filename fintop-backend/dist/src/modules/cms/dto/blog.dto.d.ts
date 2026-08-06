import { CONTENT_VISIBILITY, SUBSCRIPTION_TIER, BLOG_STATUS } from '@prisma/client';
export declare class CreateBlogDto {
    categoryId: number;
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    visibility?: CONTENT_VISIBILITY;
    minTierAccess?: SUBSCRIPTION_TIER;
}
export declare class UpdateBlogStatusDto {
    status: BLOG_STATUS;
}
export declare class UpdateBlogDto {
    categoryId?: number;
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    visibility?: CONTENT_VISIBILITY;
    minTierAccess?: SUBSCRIPTION_TIER;
}
