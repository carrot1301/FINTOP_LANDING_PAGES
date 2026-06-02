import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { BlogService } from '../src/modules/cms/blog.service';
import { RedisService } from '../src/common/redis/redis.service';
import { BLOG_STATUS, CONTENT_VISIBILITY, SUBSCRIPTION_TIER, REVISION_ACTION } from '@prisma/client';

async function runCmsValidation() {
  console.log('🔍 Bắt đầu kiểm thử CMS & Content Governance Runtime Validation...');

  let app!: INestApplication;
  let prisma!: PrismaService;
  let redisService!: RedisService;

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    const blogService = app.get(BlogService);
    redisService = app.get(RedisService);

    // Cleanup
    await prisma.contentRevision.deleteMany({});
    await prisma.featuredContent.deleteMany({});
    await prisma.blogTag.deleteMany({});
    await prisma.blog.deleteMany({});
    await prisma.category.deleteMany({});
    
    // Setup Editor
    const testEmail = 'editor@fintop.vn';
    let user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: testEmail,
          fullName: 'Test Editor',
          passwordHash: 'dummy',
        }
      });
    }

    console.log('\n⚡ Test #1: Category & Content Creation (DRAFT)');
    const category = await prisma.category.create({
      data: { slug: 'market-news', name: 'Market News' }
    });

    const article = await blogService.createArticle(user.id, {
      categoryId: category.id,
      slug: 'fpt-earnings-q3-2026',
      title: 'FPT Q3 2026 Earnings Explode',
      excerpt: 'A huge quarter for FPT...',
      content: '<p>Full details inside.</p>',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
    });
    
    if (article.status !== BLOG_STATUS.DRAFT) throw new Error('Article not created as DRAFT');
    console.log('  [PASS] Premium Article drafted successfully.');

    console.log('\n⚡ Test #2: Content Revision Tracking');
    const revisions = await prisma.contentRevision.findMany({ where: { blogId: article.id } });
    if (revisions.length !== 1 || revisions[0].action !== REVISION_ACTION.CREATED) {
      throw new Error('Revision log not securely tracked');
    }
    console.log('  [PASS] Initial Draft securely recorded into ContentRevision ledger.');

    console.log('\n⚡ Test #3: Editorial Workflow (DRAFT -> PUBLISHED)');
    await blogService.updateArticleStatus(article.id, user.id, BLOG_STATUS.PENDING_REVIEW);
    const publishedArticle = await blogService.updateArticleStatus(article.id, user.id, BLOG_STATUS.PUBLISHED);
    
    if (publishedArticle.status !== BLOG_STATUS.PUBLISHED) throw new Error('Workflow stuck');
    if (!publishedArticle.publishedAt) throw new Error('publishedAt not stamped');
    console.log('  [PASS] Editorial transitions enforced and publishedAt time stamped.');

    console.log('\n⚡ Test #4: VIP Content Cache & Retrieval');
    const fetchedArticle = await blogService.getArticle('fpt-earnings-q3-2026');
    if (fetchedArticle.visibility !== CONTENT_VISIBILITY.PREMIUM) {
      throw new Error('Content metadata stripped incorrectly');
    }

    const cachedStr = await redisService!.getClient().get('blogs:detail:fpt-earnings-q3-2026');
    if (!cachedStr) throw new Error('Cache miss on fetched article');
    console.log('  [PASS] Article retrieved securely, Premium constraints maintained, and cached in Redis.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA CMS GOVERNANCE ĐỀU THÀNH CÔNG (100% PASS)!');

  } catch (error) {
    console.error('\n❌ KIỂM THỬ CMS THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runCmsValidation();
