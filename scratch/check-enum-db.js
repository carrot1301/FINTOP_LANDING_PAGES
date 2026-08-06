const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

const localUri = "postgresql://postgres:123@localhost:5432/fintop";

async function checkEnum() {
  const client = new Client({ connectionString: localUri });
  await client.connect();

  const res = await client.query(`
    SELECT enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'ROLE_CODE'
  `);
  console.log("PostgreSQL ROLE_CODE enum values on localhost:", res.rows.map(r => r.enumlabel));

  // Ensure 'DEVELOPER' is present in PostgreSQL enum
  await client.query(`ALTER TYPE "ROLE_CODE" ADD VALUE IF NOT EXISTS 'DEVELOPER'`);
  console.log("✅ Ran ALTER TYPE 'ROLE_CODE' ADD VALUE IF NOT EXISTS 'DEVELOPER'");

  await client.end();
}

checkEnum();
