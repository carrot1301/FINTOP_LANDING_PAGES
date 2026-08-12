const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const s = await p.stock.findUnique({
    where: { symbol: 'FPT' },
    select: {
      id: true,
      symbol: true,
      rsi_mfi: true,
      delta_rsi: true,
      trading_price_range: true,
      resistance_range: true,
      support_range: true,
      act: true,
    },
  });
  console.log(JSON.stringify(s, null, 2));
  await p.$disconnect();
}

main();
