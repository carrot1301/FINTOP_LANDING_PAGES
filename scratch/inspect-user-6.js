const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM users WHERE id = 6 OR email = \'tuannv7105@gmail.com\'');
    console.log(res.rows[0]);
  } catch (error) {
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
