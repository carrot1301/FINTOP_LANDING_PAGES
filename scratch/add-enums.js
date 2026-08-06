const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

async function main() {
  const client = new Client({ connectionString: "postgresql://postgres:123@localhost:5432/fintop" });
  await client.connect();

  console.log("Adding new enum values to PERMISSION_MODULE and PERMISSION_ACTION...");

  // Add new PERMISSION_MODULE values
  const newModules = ['PLAN', 'STOCK_DATA', 'HANDBOOK', 'SALES'];
  for (const mod of newModules) {
    await client.query(`ALTER TYPE "PERMISSION_MODULE" ADD VALUE IF NOT EXISTS '${mod}'`);
    console.log(`  ✅ PERMISSION_MODULE += ${mod}`);
  }

  // Add new PERMISSION_ACTION values
  const newActions = ['MANAGE', 'LABEL_PRO'];
  for (const act of newActions) {
    await client.query(`ALTER TYPE "PERMISSION_ACTION" ADD VALUE IF NOT EXISTS '${act}'`);
    console.log(`  ✅ PERMISSION_ACTION += ${act}`);
  }

  await client.end();
  console.log("✅ DONE — Enum values added.");
}
main().catch(err => { console.error("ERROR:", err); process.exit(1); });
