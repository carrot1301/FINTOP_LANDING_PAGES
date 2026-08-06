const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

async function main() {
  const client = new Client({ connectionString: "postgresql://postgres:123@localhost:5432/fintop" });
  await client.connect();

  // Check PERMISSION_MODULE enum values
  const res = await client.query(`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'PERMISSION_MODULE'
    ORDER BY e.enumsortorder
  `);
  console.log("Current PERMISSION_MODULE enum values:");
  res.rows.forEach(r => console.log(`  - ${r.enumlabel}`));

  // Check PERMISSION_ACTION enum values
  const res2 = await client.query(`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'PERMISSION_ACTION'
    ORDER BY e.enumsortorder
  `);
  console.log("\nCurrent PERMISSION_ACTION enum values:");
  res2.rows.forEach(r => console.log(`  - ${r.enumlabel}`));

  await client.end();
}
main();
