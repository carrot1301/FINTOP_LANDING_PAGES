import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, RECORD_STATUS } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Copy Trade and Stock analysis data seeding...');

  // 1. Seed / Update Stocks with analyst fields
  const SEED_STOCKS = [
    { order: 1, symbol: 'VEA', exchange: 'UPCOM', industry: 'Bán buôn, bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu nến đi ngang tăng nhẹ.', act: 'RẤT TÍCH CỰC', rsi_mfi: 'TĂNG MẠNH', trading_price_range: '34 - 34.5', resistance_range: '38 - 42', support_range: '33', top_status: 1 },
    { order: 2, symbol: 'DST', exchange: 'HNX', industry: 'Bán buôn, bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu nến suy giảm chạm hỗ trợ MA200.', act: 'TÍCH CỰC', rsi_mfi: 'TĂNG', trading_price_range: '9.3 - 9.5', resistance_range: '9.9 - 10.2 - 10.7', support_range: '21', top_status: 1 },
    { order: 3, symbol: 'DGW', exchange: 'HOSE', industry: 'Bán buôn, bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu nến đi ngang trên hỗ trợ MA50.', act: 'KHẢ QUAN', rsi_mfi: 'TĂNG DẦN', trading_price_range: '45.5 - 46.5', resistance_range: '48 - 50 - 52', support_range: '18', top_status: 1 },
    { order: 4, symbol: 'MWG', exchange: 'HOSE', industry: 'Bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu nến suy giảm.', act: 'TRUNG LẬP', rsi_mfi: 'GIẢM DẦN', trading_price_range: '85 - 86', resistance_range: '—', support_range: '—', top_status: 1 },
    { order: 5, symbol: 'PNJ', exchange: 'HOSE', industry: 'Bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu hình 2 đỉnh, nếu suy giảm.', act: 'KO TÍCH CỰC', rsi_mfi: 'GIẢM', trading_price_range: '114 - 117', resistance_range: '—', support_range: '—', top_status: 1 },
    { order: 6, symbol: 'FRT', exchange: 'HOSE', industry: 'Bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu suy giảm.', act: 'TIÊU CỰC', rsi_mfi: '—', trading_price_range: '158 - 160', resistance_range: '—', support_range: '—', top_status: 1 },
    { order: 7, symbol: 'MSN', exchange: 'HOSE', industry: 'Bán lẻ', analyst: 'Đình Hải', identify_trend: 'Kênh xu hướng giảm.', act: 'TRUNG LẬP', rsi_mfi: '—', trading_price_range: '75 - 76', resistance_range: '—', support_range: '—', top_status: 1 },
    { order: 8, symbol: 'PLX', exchange: 'HOSE', industry: 'Bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu nến giảm ngắn, chạm hỗ trợ MA5.', act: 'TRUNG LẬP', rsi_mfi: '—', trading_price_range: '64 - 65.5', resistance_range: '—', support_range: '—', top_status: 1 },
    { order: 9, symbol: 'PET', exchange: 'HOSE', industry: 'Bán lẻ', analyst: 'Đình Hải', identify_trend: 'Mẫu nến đi ngang tích lũy, kênh xu hướng tăng.', act: 'TRUNG LẬP', rsi_mfi: '—', trading_price_range: '39 - 40', resistance_range: '—', support_range: '—', top_status: 1 },
    { order: 10, symbol: 'BVH', exchange: 'HOSE', industry: 'Bảo hiểm', analyst: 'Đình Hải', identify_trend: 'Mẫu nến giảm, thủng hỗ trợ MA20.', act: 'TRUNG LẬP', rsi_mfi: '—', trading_price_range: '75.5 - 76.5', resistance_range: '—', support_range: '—', top_status: 1 },
    { order: 11, symbol: 'BIC', exchange: 'HOSE', industry: 'Bảo hiểm', analyst: 'Đình Hải', identify_trend: 'Mẫu nến đi ngang.', act: 'TRUNG LẬP', rsi_mfi: '—', trading_price_range: '23 - 24.5', resistance_range: '—', support_range: '—', top_status: 1 },
  ];

  for (const s of SEED_STOCKS) {
    // Check if exchange exists
    let exchange = await prisma.stockExchange.findFirst({
      where: { code: s.exchange as any },
    });
    if (!exchange) {
      exchange = await prisma.stockExchange.create({
        data: { code: s.exchange as any, name: s.exchange, status: RECORD_STATUS.ACTIVE },
      });
    }

    // Check if industry exists
    let industry = await prisma.industry.findFirst({
      where: { name: s.industry },
    });
    if (!industry) {
      // Find sector
      let sector = await prisma.sector.findFirst({ where: { code: 'DEFAULT' } });
      if (!sector) {
        sector = await prisma.sector.create({
          data: { code: 'DEFAULT', name: 'Đa ngành', status: RECORD_STATUS.ACTIVE },
        });
      }
      industry = await prisma.industry.create({
        data: {
          name: s.industry,
          code: s.industry.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 50),
          sectorId: sector.id,
          status: RECORD_STATUS.ACTIVE,
        },
      });
    }

    // Upsert Stock with analyst details
    await prisma.stock.upsert({
      where: { symbol: s.symbol },
      update: {
        order: s.order,
        analyst: s.analyst,
        identify_trend: s.identify_trend,
        act: s.act,
        rsi_mfi: s.rsi_mfi,
        trading_price_range: s.trading_price_range,
        resistance_range: s.resistance_range,
        support_range: s.support_range,
        top_status: s.top_status,
        exchangeId: exchange.id,
        industryId: industry.id,
        deletedAt: null,
      },
      create: {
        symbol: s.symbol,
        companyName: s.symbol,
        exchangeId: exchange.id,
        industryId: industry.id,
        order: s.order,
        analyst: s.analyst,
        identify_trend: s.identify_trend,
        act: s.act,
        rsi_mfi: s.rsi_mfi,
        trading_price_range: s.trading_price_range,
        resistance_range: s.resistance_range,
        support_range: s.support_range,
        top_status: s.top_status,
      },
    });
    console.log(`   ✅ Seeded Stock ${s.symbol}`);
  }

  // 2. Clear Copy Trade tables first for clean seed
  await prisma.copyTradeOrder.deleteMany();
  await prisma.copyTradeCopier.deleteMany();
  await prisma.copyTradeMaster.deleteMany();

  // 3. Seed Copy Trade Masters
  const m1 = await prisma.copyTradeMaster.create({
    data: {
      name: 'Nguyễn Hoàng Nam',
      strategy: 'Quant Trend-Following',
      aum: 6800000000,
      followers: 2,
      profit: 18.4,
      winRate: 78,
      status: RECORD_STATUS.ACTIVE,
    },
  });

  const m2 = await prisma.copyTradeMaster.create({
    data: {
      name: 'Trần Việt Bách',
      strategy: 'Sóng ngành VIP',
      aum: 4500000000,
      followers: 1,
      profit: 12.2,
      winRate: 72,
      status: RECORD_STATUS.ACTIVE,
    },
  });

  const m3 = await prisma.copyTradeMaster.create({
    data: {
      name: 'Lê Minh Trang',
      strategy: 'Giá trị & Tăng trưởng',
      aum: 4100000000,
      followers: 1,
      profit: 8.7,
      winRate: 71,
      status: RECORD_STATUS.ACTIVE,
    },
  });

  console.log('   ✅ Seeded Copy Trade Masters');

  // 4. Seed Copiers
  await prisma.copyTradeCopier.createMany({
    data: [
      { name: 'Phạm Minh Hoàng', masterId: m1.id, capital: 250000000, multiplier: 1.0, profit: 45200000, status: RECORD_STATUS.ACTIVE },
      { name: 'Trần Thị Thanh', masterId: m2.id, capital: 500000000, multiplier: 2.0, profit: 61000000, status: RECORD_STATUS.ACTIVE },
      { name: 'Vũ Đức An', masterId: m1.id, capital: 150000000, multiplier: 0.5, profit: -5400000, status: RECORD_STATUS.INACTIVE },
      { name: 'Nguyễn Bích Ngọc', masterId: m3.id, capital: 300000000, multiplier: 1.0, profit: 26100000, status: RECORD_STATUS.ACTIVE },
    ],
  });

  console.log('   ✅ Seeded Copiers');

  // 5. Seed Copy Trade Orders
  await prisma.copyTradeOrder.createMany({
    data: [
      { masterId: m1.id, symbol: 'FPT', action: 'MUA', price: 132400, quantity: 10000, accounts: 42, status: 'SUCCESS', successRate: 100, time: new Date('2026-06-09T09:15:00Z') },
      { masterId: m2.id, symbol: 'HPG', action: 'MUA', price: 29150, quantity: 50000, accounts: 38, status: 'SUCCESS', successRate: 100, time: new Date('2026-06-09T09:20:00Z') },
      { masterId: m1.id, symbol: 'VCB', action: 'BÁN', price: 91200, quantity: 15000, accounts: 42, status: 'SUCCESS', successRate: 100, time: new Date('2026-06-08T14:10:00Z') },
      { masterId: m1.id, symbol: 'SSI', action: 'MUA', price: 35400, quantity: 20000, accounts: 42, status: 'SUCCESS', successRate: 100, time: new Date('2026-06-08T11:05:00Z') },
    ],
  });

  console.log('   ✅ Seeded Copy Trade Orders');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
