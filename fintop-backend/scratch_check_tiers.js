require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // Check table name first
    const tables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename ILIKE '%user%'`);
    console.log('User tables:', tables.rows.map(r => r.tablename));

    // Get the correct table name
    const tableName = tables.rows.find(r => r.tablename.toLowerCase() === 'user' || r.tablename === 'users')?.tablename || 'users';
    console.log('Using table:', tableName);

    // Get columns
    const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name ILIKE '%tier%' OR column_name ILIKE '%legacy%'`);
    console.log('Tier-related columns:', cols.rows.map(r => r.column_name));

    // Query distinct legacyTier
    try {
      const legacyResult = await client.query(`SELECT DISTINCT "legacyTier" FROM "${tableName}" WHERE "legacyTier" IS NOT NULL AND "deletedAt" IS NULL ORDER BY "legacyTier"`);
      console.log('\nDistinct legacyTier values:');
      legacyResult.rows.forEach(r => console.log(' -', JSON.stringify(r.legacyTier)));
    } catch (e) {
      console.log('legacyTier column not found, trying lowercase...');
      const legacyResult = await client.query(`SELECT DISTINCT "legacytier" FROM "${tableName}" WHERE "legacytier" IS NOT NULL ORDER BY "legacytier"`);
      console.log('\nDistinct legacytier values:');
      legacyResult.rows.forEach(r => console.log(' -', JSON.stringify(r.legacytier)));
    }

    // Query distinct tierLevel
    try {
      const tierResult = await client.query(`SELECT DISTINCT "tierLevel" FROM "${tableName}" WHERE "deletedAt" IS NULL ORDER BY "tierLevel"`);
      console.log('\nDistinct tierLevel values:');
      tierResult.rows.forEach(r => console.log(' -', JSON.stringify(r.tierLevel)));
    } catch (e) {
      console.log('tierLevel query error:', e.message);
    }
  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
