const { Pool } = require('pg');

async function updatePrices() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:123@localhost:5432/fintop',
  });

  try {
    console.log('🔄 Updating PRO package prices in database...');
    await pool.query(`UPDATE subscription_plans SET price = 2500000 WHERE name = 'PRO1';`);
    await pool.query(`UPDATE subscription_plans SET price = 4500000 WHERE name = 'PRO2';`);
    await pool.query(`UPDATE subscription_plans SET price = 6800000 WHERE name = 'PRO3';`);

    const res = await pool.query(`SELECT id, name, price, "durationDays", status FROM subscription_plans ORDER BY id ASC;`);
    console.log('✅ Current subscription plans in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('❌ Error updating DB:', err.message);
  } finally {
    await pool.end();
  }
}

updatePrices();
