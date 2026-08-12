const path = require('path');
const backendNodeModules = 'c:/Users/Admin/FINTOP_LANDING_PAGES/fintop-backend/node_modules';
require(path.join(backendNodeModules, 'dotenv')).config({ path: 'c:/Users/Admin/FINTOP_LANDING_PAGES/fintop-backend/.env' });
const { Pool } = require(path.join(backendNodeModules, 'pg'));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('=== Checking Categories in DB ===');
  const cats = await pool.query('SELECT id, slug, name FROM categories ORDER BY id ASC');
  console.table(cats.rows);

  console.log('\n=== Checking Blogs in DB for pro-data & dinh-luong ===');
  const blogs = await pool.query(`
    SELECT b.id, b.slug, b.title, c.slug as category_slug, c.name as category_name
    FROM blogs b
    JOIN categories c ON b."categoryId" = c.id
    WHERE c.slug IN ('pro-data', 'dinh-luong')
  `);
  console.table(blogs.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
