/**
 * ============================================================
 * wave2-qa-seed.ts — Dev-only QA Test Data Seeder
 * ============================================================
 * PURPOSE:
 *   Seeds minimal test data for QA items A28, A34, A36, A41.
 *   - 4 VipSignals with different statuses (PUBLISHED, REACHED_TARGET, CUT_LOSS, CLOSED)
 *   - 2 ReportFiles (1 public STANDARD, 1 premium GOLD)
 *   - 2 Notifications (unread) for admin user
 *
 * SAFETY:
 *   - Hard-blocks if NODE_ENV=production
 *   - Uses upsert where possible
 *   - Does NOT delete existing data
 *   - Does NOT alter Prisma schema
 *   - Idempotent: safe to run multiple times
 * ============================================================
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  SIGNAL_STATUS,
  SIGNAL_DIRECTION,
  SIGNAL_SOURCE,
  SUBSCRIPTION_TIER,
  BLOG_STATUS,
  REPORT_TYPE,
  NOTIFICATION_STATUS,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_CHANNEL,
  AUDIT_SOURCE,
  Prisma,
} from '@prisma/client';

// ─────────────────────────────────────────────────────────
// PRODUCTION GUARD — Hard block
// ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('❌ BLOCKED: wave2-qa-seed.ts cannot run in production.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 [Wave 2 QA Seed] Starting dev-only QA data seeder...');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);

  // ─────────────────────────────────────────────────────
  // 1. Find prerequisite data
  // ─────────────────────────────────────────────────────
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@fintop.vn' },
  });
  if (!adminUser) {
    console.error('❌ Admin user admin@fintop.vn not found. Run wave1.seeder.ts first.');
    process.exit(1);
  }
  console.log(`✅ Found admin user: id=${adminUser.id}, email=${adminUser.email}`);

  // Find a stock to attach signals to (FPT or any existing stock)
  let stock = await prisma.stock.findFirst({
    where: { symbol: 'FPT' },
  });
  if (!stock) {
    // Try any existing stock
    stock = await prisma.stock.findFirst();
  }
  if (!stock) {
    console.error('❌ No stocks found in database. Please seed market data first.');
    process.exit(1);
  }
  console.log(`✅ Using stock: id=${stock.id}, symbol=${stock.symbol}`);

  // Find a second stock for variety
  let stock2 = await prisma.stock.findFirst({
    where: { symbol: { not: stock.symbol } },
  });
  if (!stock2) stock2 = stock; // fallback to same stock

  // ─────────────────────────────────────────────────────
  // 2. Seed VipSignals (A28)
  // ─────────────────────────────────────────────────────
  console.log('\n📡 [A28] Seeding VipSignals with various statuses...');

  const signalDefs = [
    {
      stockId: stock.id,
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.PUBLISHED,
      minTierAccess: SUBSCRIPTION_TIER.STANDARD,
      entryPrice: 130.5,
      cutLossPrice: 122.0,
      targetPrice: 145.0,
      notes: '[QA] Tín hiệu ENTRY đang theo dõi — Mã FPT có xu hướng tăng trung hạn. Hỗ trợ mạnh tại 122.',
    },
    {
      stockId: stock.id,
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.REACHED_TARGET,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      entryPrice: 118.0,
      cutLossPrice: 110.0,
      targetPrice: 135.0,
      notes: '[QA] Đã đạt mục tiêu TP1 = 135. Chốt lời thành công +14.4%.',
    },
    {
      stockId: stock2.id,
      direction: SIGNAL_DIRECTION.SELL,
      status: SIGNAL_STATUS.CUT_LOSS,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      entryPrice: 85.0,
      cutLossPrice: 79.0,
      targetPrice: 95.0,
      notes: '[QA] Cắt lỗ tại SL = 79. Thị trường giảm mạnh do tin xấu ngành.',
    },
    {
      stockId: stock2.id,
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.CLOSED,
      minTierAccess: SUBSCRIPTION_TIER.DIAMOND,
      entryPrice: 42.5,
      cutLossPrice: 38.0,
      targetPrice: 50.0,
      notes: '[QA] Đã đóng vị thế. Kết thúc theo dõi.',
    },
  ];

  const createdSignals: any[] = [];
  for (const def of signalDefs) {
    // Check if a QA signal with same status already exists for this stock
    const existing = await prisma.vipSignal.findFirst({
      where: {
        stockId: def.stockId,
        status: def.status,
        notes: { startsWith: '[QA]' },
      },
    });

    if (existing) {
      console.log(`   ⏩ Signal already exists: id=${existing.id}, status=${def.status}, stock=${def.stockId}`);
      createdSignals.push(existing);
      continue;
    }

    const signal = await prisma.vipSignal.create({
      data: {
        stockId: def.stockId,
        authorId: adminUser.id,
        source: SIGNAL_SOURCE.EXPERT,
        direction: def.direction,
        status: def.status,
        minTierAccess: def.minTierAccess,
        entryPrice: new Prisma.Decimal(def.entryPrice),
        cutLossPrice: new Prisma.Decimal(def.cutLossPrice),
        targetPrice: new Prisma.Decimal(def.targetPrice),
        notes: def.notes,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000), // random in last 7 days
        closedAt: (def.status !== SIGNAL_STATUS.PUBLISHED) ? new Date() : null,
      },
    });

    // Create signal target
    await prisma.signalTarget.create({
      data: {
        signalId: signal.id,
        price: new Prisma.Decimal(def.targetPrice),
        targetIndex: 1,
        isHit: def.status === SIGNAL_STATUS.REACHED_TARGET,
        hitAt: def.status === SIGNAL_STATUS.REACHED_TARGET ? new Date() : null,
      },
    });

    // Create execution log
    await prisma.signalExecutionLog.create({
      data: {
        signalId: signal.id,
        fromStatus: SIGNAL_STATUS.DRAFT,
        toStatus: def.status,
        reason: `[QA Seed] Seeded as ${def.status}`,
      },
    });

    console.log(`   ✅ Created signal: id=${signal.id}, status=${def.status}, tier=${def.minTierAccess}, stock=${def.stockId}`);
    createdSignals.push(signal);
  }

  // ─────────────────────────────────────────────────────
  // 3. Seed ReportFiles (A34)
  // ─────────────────────────────────────────────────────
  console.log('\n📄 [A34] Seeding ReportFiles...');

  const reportDefs = [
    {
      title: '[QA] Báo cáo Tổng quan Thị trường Q2/2026',
      reportType: REPORT_TYPE.MARKET_SUMMARY,
      minTierAccess: SUBSCRIPTION_TIER.STANDARD,
      fileUrl: '/assets/reports/qa-market-summary-q2-2026.pdf',
      fileSize: 245760, // ~240KB placeholder
    },
    {
      title: '[QA] Phân tích Vĩ mô & Chiến lược Danh mục VIP',
      reportType: REPORT_TYPE.MACRO_ANALYSIS,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      fileUrl: '/assets/reports/qa-macro-analysis-vip-2026.pdf',
      fileSize: 512000, // ~500KB placeholder
    },
  ];

  const createdReports: any[] = [];
  for (const def of reportDefs) {
    const existing = await prisma.reportFile.findFirst({
      where: { title: def.title },
    });

    if (existing) {
      console.log(`   ⏩ Report already exists: id=${existing.id}, title="${def.title}"`);
      createdReports.push(existing);
      continue;
    }

    const report = await prisma.reportFile.create({
      data: {
        uploaderId: adminUser.id,
        title: def.title,
        reportType: def.reportType,
        fileUrl: def.fileUrl,
        fileSize: def.fileSize,
        status: BLOG_STATUS.PUBLISHED,
        minTierAccess: def.minTierAccess,
        publishedAt: new Date(),
      },
    });

    console.log(`   ✅ Created report: id=${report.id}, title="${report.title}", tier=${def.minTierAccess}`);
    createdReports.push(report);
  }

  // ─────────────────────────────────────────────────────
  // 4. Seed Notifications (A36)
  // ─────────────────────────────────────────────────────
  console.log('\n🔔 [A36] Seeding Notifications...');

  const notifDefs = [
    {
      title: '[QA] Tín hiệu mới: FPT BUY Entry 130.5',
      content: 'Chuyên gia VPS vừa phát tín hiệu BUY cho mã FPT, giá khuyến nghị 130.5. Xem chi tiết tại mục Tín hiệu Chuyên gia.',
      priority: NOTIFICATION_PRIORITY.HIGH,
    },
    {
      title: '[QA] Báo cáo Thị trường Q2/2026 đã sẵn sàng',
      content: 'Báo cáo Tổng quan Thị trường Q2/2026 đã được xuất bản. Tải xuống tại mục Báo cáo Chiến lược.',
      priority: NOTIFICATION_PRIORITY.NORMAL,
    },
  ];

  const createdNotifications: any[] = [];
  for (const def of notifDefs) {
    // Check if notification with same title exists for admin
    const existing = await prisma.notification.findFirst({
      where: {
        userId: adminUser.id,
        title: def.title,
        status: NOTIFICATION_STATUS.UNREAD,
      },
    });

    if (existing) {
      console.log(`   ⏩ Notification already exists: id=${existing.id}, title="${def.title}"`);
      createdNotifications.push(existing);
      continue;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: adminUser.id,
        title: def.title,
        content: def.content,
        priority: def.priority,
        status: NOTIFICATION_STATUS.UNREAD,
      },
    });

    // Create delivery log
    await prisma.notificationDeliveryLog.create({
      data: {
        notificationId: notification.id,
        channel: NOTIFICATION_CHANNEL.SYSTEM,
        isSuccess: true,
      },
    });

    console.log(`   ✅ Created notification: id=${notification.id}, title="${notification.title}"`);
    createdNotifications.push(notification);
  }

  // ─────────────────────────────────────────────────────
  // 5. Audit log for seed execution
  // ─────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'QA_SEED_WAVE2',
      tableName: 'system',
      recordId: '0',
      newValues: {
        note: 'Wave 2 QA seed executed',
        signalsCreated: createdSignals.map(s => s.id),
        reportsCreated: createdReports.map(r => r.id),
        notificationsCreated: createdNotifications.map(n => n.id.toString()),
      },
      ipAddress: '127.0.0.1',
      userAgent: 'CLI QA Seeder',
    },
  });

  // ─────────────────────────────────────────────────────
  // 6. Summary
  // ─────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Wave 2 QA Seed Complete!');
  console.log('═'.repeat(60));
  console.log(`  Signals:       ${createdSignals.length} (IDs: ${createdSignals.map(s => s.id).join(', ')})`);
  console.log(`  Reports:       ${createdReports.length} (IDs: ${createdReports.map(r => r.id).join(', ')})`);
  console.log(`  Notifications: ${createdNotifications.length} (IDs: ${createdNotifications.map(n => n.id.toString()).join(', ')})`);
  console.log(`  Admin user:    ${adminUser.email} (id=${adminUser.id})`);
  console.log(`  Stocks used:   ${stock.symbol} (id=${stock.id})` + (stock2.id !== stock.id ? `, ${stock2.symbol} (id=${stock2.id})` : ''));
  console.log('═'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ QA Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
