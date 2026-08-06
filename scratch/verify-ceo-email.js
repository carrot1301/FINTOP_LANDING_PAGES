const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const localUri = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/fintop";
const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function verifyEmail(dbUri, label) {
  console.log(`Setting emailVerifiedAt = NOW() for fintop.ba@gmail.com in ${label}...`);
  const client = new Client({ connectionString: dbUri });
  try {
    await client.connect();
    await client.query(`UPDATE users SET "emailVerifiedAt" = NOW(), status = 'ACTIVE' WHERE email = 'fintop.ba@gmail.com'`);
    console.log(`✅ Fixed emailVerifiedAt for fintop.ba@gmail.com in ${label}`);
  } catch (err) {
    console.error(`Error in ${label}:`, err.message);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  await verifyEmail(localUri, "LOCAL POSTGRES");
  await verifyEmail(stagingUri, "REMOTE STAGING (Supabase)");
}

main();
