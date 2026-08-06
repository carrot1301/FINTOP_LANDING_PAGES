const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const localUri = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/fintop";
const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function inspectRoleType(dbUri, label) {
  console.log(`\n======================================================`);
  console.log(`=== CHECKING ROLE TABLE IN: ${label} ===`);
  console.log(`======================================================`);
  const client = new Client({ connectionString: dbUri });
  try {
    await client.connect();

    // Check code column data_type in roles table
    const colRes = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'roles' AND column_name = 'code'
    `);
    console.log("Column definition for roles.code:", colRes.rows[0]);

    const rolesRes = await client.query(`SELECT id, code, name FROM roles ORDER BY id ASC`);
    console.table(rolesRes.rows);

  } catch (err) {
    console.error(`Error inspecting ${label}:`, err.message);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  await inspectRoleType(localUri, "LOCAL POSTGRES");
  await inspectRoleType(stagingUri, "REMOTE STAGING (Supabase)");
}

main();
