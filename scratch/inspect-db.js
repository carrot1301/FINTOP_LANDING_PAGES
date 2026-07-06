const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== Departments ===');
    const depts = await client.query('SELECT * FROM departments');
    console.log(depts.rows);

    console.log('\n=== Teams ===');
    const teams = await client.query('SELECT * FROM teams');
    console.log(teams.rows);

    console.log('\n=== Roles ===');
    const roles = await client.query('SELECT * FROM roles');
    console.log(roles.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
