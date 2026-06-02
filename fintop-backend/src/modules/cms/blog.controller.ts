import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BLOG_STATUS } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateBlogDto, UpdateBlogStatusDto } from './dto/blog.dto';

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
    const tier = user?.tierLevel;
    return this.blogService.listArticles(tier, p, l, category);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a published article by slug' })
  async getArticle(@Param('slug') slug: string, @CurrentUser() user?: any) {
    const tier = user?.tierLevel;
    return this.blogService.getArticleForUser(slug, tier);
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
}
