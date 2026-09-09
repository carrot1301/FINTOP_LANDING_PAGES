import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, Res, Req } from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BLOG_STATUS } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateBlogDto, UpdateBlogStatusDto, UpdateBlogDto } from './dto/blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('CMS')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List published articles' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  async listArticles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @CurrentUser() user?: any,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    const features = user?.planFeatures;
    return this.blogService.listArticles(features, p, l, category);
  }

  @Get('categories/all')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories() {
    return this.blogService.getAllCategories();
  }

  @Get('share-og')
  @ApiOperation({ summary: 'Generate dynamic Open Graph HTML for social media sharing' })
  async getShareOgMeta(@Query('slug') slug: string, @Req() req: any, @Res() res: any) {
    if (this.handleSpecialSeoFiles(slug, res)) return;
    if (this.isCrawlerBot(req)) {
      const html = await this.blogService.generateShareOgHtml(slug);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }
    const redirectUrl = await this.blogService.buildArticleRedirectUrl(slug);
    return res.redirect(302, redirectUrl);
  }

  @Get('share/:slug')
  @ApiOperation({ summary: 'Generate dynamic Open Graph HTML by slug param' })
  async getShareOgMetaByParam(@Param('slug') slug: string, @Req() req: any, @Res() res: any) {
    if (this.handleSpecialSeoFiles(slug, res)) return;
    if (this.isCrawlerBot(req)) {
      const html = await this.blogService.generateShareOgHtml(slug);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }
    const redirectUrl = await this.blogService.buildArticleRedirectUrl(slug);
    return res.redirect(302, redirectUrl);
  }

  private handleSpecialSeoFiles(slug: string, res: any): boolean {
    if (!slug) return false;
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Sitemap XML
    if (cleanSlug.includes('sitemap.xml')) {
      const pathsToTry = [
        path.join(process.cwd(), '..', 'sitemap.xml'),
        path.join(process.cwd(), 'sitemap.xml'),
        path.join(process.cwd(), '..', 'fintop_frontend', 'sitemap.xml'),
        path.join(process.cwd(), 'fintop_frontend', 'sitemap.xml'),
        '/var/www/fintop/sitemap.xml',
        '/var/www/fintop/fintop_frontend/sitemap.xml',
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.send(fs.readFileSync(p, 'utf-8'));
          return true;
        }
      }
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://fintopdata.vn/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>https://fintopdata.vn/fintop-data/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/fintop-data/bo-loc/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/fintop-ai/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/stock-data/thi-truong/</loc><lastmod>2026-09-09</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/chuyen-sau/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/thi-truong/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/doanh-nghiep/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>https://fintopdata.vn/nghien-cuu/nhom-nganh/</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>https://fintopdata.vn/huong-dan/</loc><lastmod>2026-09-09</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
</urlset>`);
      return true;
    }

    // 2. Robots TXT
    if (cleanSlug.includes('robots.txt')) {
      const pathsToTry = [
        path.join(process.cwd(), '..', 'robots.txt'),
        path.join(process.cwd(), 'robots.txt'),
        path.join(process.cwd(), '..', 'fintop_frontend', 'robots.txt'),
        path.join(process.cwd(), 'fintop_frontend', 'robots.txt'),
        '/var/www/fintop/robots.txt',
        '/var/www/fintop/fintop_frontend/robots.txt',
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.send(fs.readFileSync(p, 'utf-8'));
          return true;
        }
      }
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send("User-agent: *\nAllow: /\nSitemap: https://fintopdata.vn/sitemap.xml\n");
      return true;
    }

    // 3. Google Verification HTML files
    if (cleanSlug.includes('google') && cleanSlug.endsWith('.html')) {
      const pathsToTry = [
        path.join(process.cwd(), '..', cleanSlug),
        path.join(process.cwd(), cleanSlug),
        path.join(process.cwd(), '..', 'fintop_frontend', cleanSlug),
        path.join(process.cwd(), 'fintop_frontend', cleanSlug),
        `/var/www/fintop/${cleanSlug}`,
        `/var/www/fintop/fintop_frontend/${cleanSlug}`,
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(fs.readFileSync(p, 'utf-8'));
          return true;
        }
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`google-site-verification: ${cleanSlug}`);
      return true;
    }

    return false;
  }

  private isCrawlerBot(req: any): boolean {
    const ua = (req.headers?.['user-agent'] || '').toLowerCase();
    if (!ua) return true; // Default to bot if no User-Agent header present

    // Real human in-app browsers (Zalo, Facebook, Telegram, etc. mobile webviews)
    const inAppBrowsers = ['zalomobile', 'zalopc', 'zaloweb', 'fban', 'fb_iab', 'fbios', 'fb4a'];
    if (inAppBrowsers.some(browser => ua.includes(browser))) {
      return false;
    }

    const botPatterns = [
      'facebookexternalhit', 'facebot', 'facebookcatalog',
      'zalobot', 'zalo-crawler',
      'telegrambot',
      'twitterbot',
      'linkedinbot',
      'whatsapp',
      'viber',
      'line/', 'line-poker',
      'kakaotalk',
      'slackbot',
      'discordbot',
      'googlebot', 'bingbot', 'yandexbot', 'baiduspider',
      'applebot',
      'pinterestbot',
      'redditbot',
      'embedly',
      'quora',
      'outbrain',
      'vkshare',
      'skypebot',
      'bot', 'crawler', 'spider', 'preview', 'fetch', 'curl', 'wget', 'httpclient', 'axios', 'python-requests'
    ];
    return botPatterns.some(pattern => ua.includes(pattern));
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a published article by slug' })
  async getArticle(@Param('slug') slug: string, @CurrentUser() user?: any) {
    const features = user?.planFeatures;
    return this.blogService.getArticleForUser(slug, features);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('BLOG:CREATE')
  @ApiOperation({ summary: 'Create a new draft article' })
  @ApiBody({ type: CreateBlogDto })
  async createDraft(@CurrentUser() user: any, @Body() dto: CreateBlogDto) {
    return this.blogService.createArticle(user.id, dto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('upload', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), '..', 'fintop_frontend', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `img-${uniqueSuffix}${ext}`);
      }
    })
  }))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return { url: `/uploads/${file.filename}` };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('BLOG:UPDATE')
  @ApiOperation({ summary: 'Update article publication status' })
  @ApiBody({ type: UpdateBlogStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBlogStatusDto,
    @CurrentUser() user: any
  ) {
    return this.blogService.updateArticleStatus(parseInt(id, 10), user.id, dto.status);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('BLOG:UPDATE')
  @ApiOperation({ summary: 'Update a blog article' })
  @ApiBody({ type: UpdateBlogDto })
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: any,
  ) {
    return this.blogService.updateArticle(parseInt(id, 10), user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('BLOG:DELETE')
  @ApiOperation({ summary: 'Delete (soft) a blog article' })
  async deleteBlog(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.blogService.deleteArticle(parseInt(id, 10), user.id);
  }
}

