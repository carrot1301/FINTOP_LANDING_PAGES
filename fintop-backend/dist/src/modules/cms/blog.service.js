"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const audit_service_1 = require("../../common/audit/audit.service");
const client_1 = require("@prisma/client");
const subscription_helper_1 = require("../../common/utils/subscription-helper");
let BlogService = BlogService_1 = class BlogService {
    prisma;
    redisService;
    auditService;
    logger = new common_1.Logger(BlogService_1.name);
    constructor(prisma, redisService, auditService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.auditService = auditService;
    }
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
        }
        catch (err) {
            this.logger.warn(`Automated article views reset error: ${err.message}`);
        }
    }
    async createArticle(authorId, dto) {
        const targetStatus = dto.status || client_1.BLOG_STATUS.PUBLISHED;
        return this.prisma.$transaction(async (tx) => {
            const blog = await tx.blog.create({
                data: {
                    authorId,
                    categoryId: dto.categoryId,
                    slug: dto.slug,
                    title: dto.title,
                    excerpt: dto.excerpt,
                    content: dto.content,
                    visibility: dto.visibility || client_1.CONTENT_VISIBILITY.PUBLIC,
                    minTierAccess: dto.minTierAccess || client_1.SUBSCRIPTION_TIER.STANDARD,
                    status: targetStatus,
                    publishedAt: targetStatus === client_1.BLOG_STATUS.PUBLISHED ? new Date() : null,
                }
            });
            await tx.contentRevision.create({
                data: {
                    blogId: blog.id,
                    editorId: authorId,
                    action: client_1.REVISION_ACTION.CREATED,
                    snapshotData: { title: blog.title, excerpt: blog.excerpt, content: blog.content, status: targetStatus },
                    reason: 'Initial Article Creation'
                }
            });
            await this.auditService.log({
                userId: authorId,
                source: client_1.AUDIT_SOURCE.SYSTEM,
                action: 'ARTICLE_CREATED',
                tableName: 'blogs',
                recordId: blog.id.toString(),
            });
            try {
                await this.redisService.getClient().del('blogs:list');
            }
            catch (err) {
                this.logger.warn(`Redis cache clear warning: ${err.message}`);
            }
            return blog;
        });
    }
    async updateArticleStatus(blogId, editorId, status) {
        return this.prisma.$transaction(async (tx) => {
            const blog = await tx.blog.findUnique({ where: { id: blogId } });
            if (!blog)
                throw new common_1.NotFoundException('Blog not found');
            if (blog.status === status)
                return blog;
            const updated = await tx.blog.update({
                where: { id: blogId },
                data: {
                    status,
                    publishedAt: status === client_1.BLOG_STATUS.PUBLISHED ? new Date() : null,
                }
            });
            await tx.contentRevision.create({
                data: {
                    blogId,
                    editorId,
                    action: client_1.REVISION_ACTION.STATUS_CHANGED,
                    snapshotData: { status },
                    reason: `Status changed to ${status}`
                }
            });
            await this.auditService.log({
                userId: editorId,
                source: client_1.AUDIT_SOURCE.SYSTEM,
                action: `ARTICLE_${status}`,
                tableName: 'blogs',
                recordId: blogId.toString(),
            });
            await this.redisService.getClient().del('blogs:list');
            await this.redisService.getClient().del(`blogs:detail:${blog.slug}`);
            if (updated.visibility === client_1.CONTENT_VISIBILITY.PREMIUM) {
                await this.redisService.getClient().del('reports:vip');
            }
            return updated;
        });
    }
    async getArticle(slug) {
        const cacheKey = `blogs:detail:${slug}`;
        const cached = await this.redisService.getClient().get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const blog = await this.prisma.blog.findUnique({
            where: { slug },
            include: { category: true, tags: { include: { tag: true } } }
        });
        if (!blog || blog.status !== client_1.BLOG_STATUS.PUBLISHED || blog.deletedAt !== null) {
            throw new common_1.NotFoundException('Article not found');
        }
        await this.redisService.getClient().set(cacheKey, JSON.stringify(blog), 'EX', 3600);
        return blog;
    }
    cleanArticleContent(html) {
        if (!html)
            return '';
        return html
            .replace(/font-family\s*:\s*&quot;[^&]*&quot;[^\s;`'">]*;?/gi, '')
            .replace(/font-family\s*:\s*[^;`'">\\]+;?/gi, '')
            .replace(/<font[^>]*>/gi, '<span>')
            .replace(/<\/font>/gi, '</span>');
    }
    extractFirstImage(content, defaultImage = 'https://fintopdata.vn/assets/images/fintop-og-banner.png') {
        if (!content)
            return defaultImage;
        try {
            const decoded = content
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
            let imgMatch;
            let fallbackWebpUrl = null;
            while ((imgMatch = imgRegex.exec(decoded)) !== null) {
                if (imgMatch[1]) {
                    let src = imgMatch[1].trim();
                    if (src.startsWith('data:'))
                        continue;
                    let fullUrl = src;
                    if (src.startsWith('//'))
                        fullUrl = 'https:' + src;
                    else if (src.startsWith('/'))
                        fullUrl = 'https://fintopdata.vn' + src;
                    else if (src.startsWith('http://') || src.startsWith('https://'))
                        fullUrl = src;
                    else {
                        src = src.replace(/^\.\//, '');
                        if (src.startsWith('uploads/'))
                            fullUrl = 'https://fintopdata.vn/' + src;
                    }
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
        }
        catch (err) {
            this.logger.warn(`extractFirstImage error: ${err.message}`);
        }
        return defaultImage;
    }
    async buildArticleRedirectUrl(slug) {
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
                    }
                    else if (catSlug.includes('chuyen-sau') || catSlug.includes('pro-research') || catSlug.includes('research')) {
                        targetUrl = `https://fintopdata.vn/nghien-cuu/chuyen-sau/index.html?slug=${encodeURIComponent(slug)}`;
                    }
                    else if (catSlug.includes('doanh-nghiep')) {
                        targetUrl = `https://fintopdata.vn/nghien-cuu/doanh-nghiep/index.html?slug=${encodeURIComponent(slug)}`;
                    }
                    else if (catSlug.includes('pro-data')) {
                        targetUrl = `https://fintopdata.vn/stock-data/pro-data/index.html?slug=${encodeURIComponent(slug)}`;
                    }
                    else if (catSlug.includes('dinh-luong')) {
                        targetUrl = `https://fintopdata.vn/stock-data/dinh-luong/index.html?slug=${encodeURIComponent(slug)}`;
                    }
                }
            }
            catch (err) {
                this.logger.warn(`Failed to resolve article category for redirect: ${err.message}`);
            }
        }
        return targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'direct=1';
    }
    async generateShareOgHtml(slug) {
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
            }
            catch (err) {
                this.logger.warn(`Failed to fetch article for OG HTML generation: ${err.message}`);
            }
        }
        const redirectUrl = targetUrl;
        const esc = (str) => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    <meta property="og:url" content="${esc(redirectUrl)}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(imageUrl)}">

    <meta http-equiv="refresh" content="0;url=${esc(redirectUrl)}">
    <link rel="canonical" href="${esc(redirectUrl)}">
    <script>
        window.location.replace("${esc(redirectUrl)}");
    </script>
</head>
<body>
    <div style="padding: 2rem; font-family: sans-serif; text-align: center;">
        <h2>${esc(title)}</h2>
        <p>${esc(description)}</p>
        <p>Đang chuyển hướng tới <a href="${esc(redirectUrl)}">FinTop DATA</a>...</p>
    </div>
</body>
</html>`;
    }
    sanitizePlainText(str) {
        if (!str)
            return '';
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
    async listArticles(userFeatures, page = 1, limit = 10, categorySlug) {
        const skip = (page - 1) * limit;
        const whereClause = {
            status: client_1.BLOG_STATUS.PUBLISHED,
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
            const locked = b.visibility === client_1.CONTENT_VISIBILITY.PREMIUM && !this.isTierAllowed(userFeatures, b.minTierAccess);
            const rawExcerpt = b.excerpt || b.content || '';
            const cleanExcerpt = this.sanitizePlainText(rawExcerpt).substring(0, 160);
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
    async getArticleForUser(slug, userFeatures) {
        try {
            await this.prisma.blog.update({
                where: { slug },
                data: { views: { increment: 1 } }
            });
            await this.redisService.getClient().del(`blogs:detail:${slug}`);
        }
        catch (err) {
            this.logger.warn(`Could not increment article views: ${err.message}`);
        }
        const b = await this.getArticle(slug);
        const locked = b.visibility === client_1.CONTENT_VISIBILITY.PREMIUM && !this.isTierAllowed(userFeatures, b.minTierAccess);
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
            tags: b.tags.map((t) => t.tag.name),
            views: b.views || 0,
        };
    }
    isTierAllowed(userFeatures, minTier) {
        return (0, subscription_helper_1.isFeatureAllowed)(userFeatures, minTier || 'STANDARD');
    }
    async updateArticle(blogId, editorId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const blog = await tx.blog.findUnique({ where: { id: blogId } });
            if (!blog)
                throw new common_1.NotFoundException('Blog not found');
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
                    publishedAt: dto.status === client_1.BLOG_STATUS.PUBLISHED ? new Date() : undefined,
                }
            });
            await tx.contentRevision.create({
                data: {
                    blogId,
                    editorId,
                    action: client_1.REVISION_ACTION.UPDATED,
                    snapshotData: { title: updated.title, excerpt: updated.excerpt, content: updated.content },
                    reason: 'Article Updated'
                }
            });
            await this.auditService.log({
                userId: editorId,
                source: client_1.AUDIT_SOURCE.SYSTEM,
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
            }
            catch (err) {
                this.logger.warn(`Redis cache clearing failed: ${err.message}`);
            }
            return updated;
        });
    }
    async deleteArticle(blogId, editorId) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog)
            throw new common_1.NotFoundException('Blog not found');
        await this.prisma.blog.update({
            where: { id: blogId },
            data: { deletedAt: new Date() }
        });
        await this.auditService.log({
            userId: editorId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'ARTICLE_DELETED',
            tableName: 'blogs',
            recordId: blogId.toString(),
        });
        try {
            await this.redisService.getClient().del('blogs:list');
            await this.redisService.getClient().del(`blogs:detail:${blog.slug}`);
        }
        catch (err) {
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
        }
        catch (err) {
            this.logger.warn(`Failed to auto-upsert default categories: ${err.message}`);
        }
        return this.prisma.category.findMany({
            orderBy: { id: 'asc' },
        });
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = BlogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        audit_service_1.AuditService])
], BlogService);
//# sourceMappingURL=blog.service.js.map