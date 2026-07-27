const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:123@localhost:5432/fintop"
});

async function main() {
  await client.connect();
  
  const res = await client.query(`
    SELECT u.id, u.email, u."fullName", r.code as role_code 
    FROM users u 
    JOIN user_roles ur ON u.id = ur."userId" 
    JOIN roles r ON ur."roleId" = r.id
  `);
  
  console.log("\n--- USERS WITH ROLES ---");
  for (const row of res.rows) {
    console.log(`- [${row.id}] ${row.email} | ${row.fullName} | Role: ${row.role_code}`);
  }
}

main()
  .catch(console.error)
  .finally(() => client.end());
