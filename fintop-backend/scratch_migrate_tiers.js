require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // 1. Show current state before migration
    console.log('=== BEFORE MIGRATION ===');
    const before = await client.query(`
      SELECT "tierLevel", "legacyTier", COUNT(*) as count 
      FROM users 
      WHERE "deletedAt" IS NULL 
      GROUP BY "tierLevel", "legacyTier" 
      ORDER BY "tierLevel", "legacyTier"
    `);
    console.table(before.rows);

    // 2. Update accounts with legacyTier VIP1, VIP2, VIP3, or any VIPx → tierLevel = GOLD (= VIP)
    const vipLegacy = await client.query(`
      UPDATE users 
      SET "tierLevel" = 'GOLD' 
      WHERE "deletedAt" IS NULL 
        AND "legacyTier" ILIKE 'VIP%'
        AND "tierLevel" != 'GOLD'
    `);
    console.log(`\n✅ Updated ${vipLegacy.rowCount} accounts with legacyTier VIPx → tierLevel = GOLD (VIP)`);

    // 3. Update accounts with tierLevel SILVER → tierLevel = GOLD (= VIP) 
    //    User said: silver = vip
    const silverToVip = await client.query(`
      UPDATE users 
      SET "tierLevel" = 'GOLD' 
      WHERE "deletedAt" IS NULL 
        AND "tierLevel" = 'SILVER'
    `);
    console.log(`✅ Updated ${silverToVip.rowCount} accounts with tierLevel SILVER → tierLevel = GOLD (VIP)`);

    // 4. Update accounts with legacyTier KIM_CUONG → tierLevel = DIAMOND (should already be, but just in case)
    const kimCuong = await client.query(`
      UPDATE users 
      SET "tierLevel" = 'DIAMOND' 
      WHERE "deletedAt" IS NULL 
        AND "legacyTier" = 'KIM_CUONG'
        AND "tierLevel" != 'DIAMOND'
    `);
    console.log(`✅ Updated ${kimCuong.rowCount} accounts with legacyTier KIM_CUONG → tierLevel = DIAMOND`);

    // 5. Show state after migration
    console.log('\n=== AFTER MIGRATION ===');
    const after = await client.query(`
      SELECT "tierLevel", "legacyTier", COUNT(*) as count 
      FROM users 
      WHERE "deletedAt" IS NULL 
      GROUP BY "tierLevel", "legacyTier" 
      ORDER BY "tierLevel", "legacyTier"
    `);
    console.table(after.rows);

    // 6. Summary
    const summary = await client.query(`
      SELECT "tierLevel", COUNT(*) as count 
      FROM users 
      WHERE "deletedAt" IS NULL 
      GROUP BY "tierLevel" 
      ORDER BY "tierLevel"
    `);
    console.log('\n=== TIER LEVEL SUMMARY ===');
    console.table(summary.rows);

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
