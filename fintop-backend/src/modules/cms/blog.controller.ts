import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
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
  async getShareOgMeta(@Query('slug') slug: string, @Res() res: any) {
    const html = await this.blogService.generateShareOgHtml(slug);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  @Get('share/:slug')
  @ApiOperation({ summary: 'Generate dynamic Open Graph HTML by slug param' })
  async getShareOgMetaByParam(@Param('slug') slug: string, @Res() res: any) {
    const html = await this.blogService.generateShareOgHtml(slug);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
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

