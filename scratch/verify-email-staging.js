const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function verifyStaging() {
  const client = new Client({ connectionString: stagingUri });
  await client.connect();
  await client.query(`UPDATE users SET "emailVerifiedAt" = NOW(), status = 'ACTIVE' WHERE email IN ('fintop.ba@gmail.com', 'fintop.bashare@gmail.com')`);
  console.log("Updated emailVerifiedAt on Staging Supabase");
  await client.end();
}

verifyStaging();
