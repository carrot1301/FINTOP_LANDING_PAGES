const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT u.id, u.email, u.phone, u."fullName", u."teamId", u."departmentId",
           t.code as team_code, t.name as team_name,
           d.code as dept_code, d.name as dept_name
    FROM users u
    LEFT JOIN teams t ON u."teamId" = t.id
    LEFT JOIN departments d ON u."departmentId" = d.id
  `);

  console.log('--- ALL USERS IN DB ---');
  for (const r of res.rows) {
    console.log(r);
  }
}

main()
  .catch(console.error)
  .finally(() => client.end());
