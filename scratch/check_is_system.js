const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function check() {
  const res = await pool.query('SELECT id, code, name, "isSystem" FROM roles ORDER BY id');
  console.log('Current DB Roles isSystem status:');
  console.table(res.rows);
  await pool.end();
}

check().catch(console.error);
