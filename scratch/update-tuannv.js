const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // 1. Update tuannv7105@gmail.com (ID 6) staffCode to BW9B
    await client.query(`UPDATE users SET "staffCode" = 'BW9B' WHERE id = 6`);
    console.log('Successfully updated tuannv7105@gmail.com (ID 6) staffCode to BW9B');
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
