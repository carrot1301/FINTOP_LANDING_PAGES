const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const bcrypt = require(path.join(backendDir, 'node_modules/bcrypt'));

const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function verify() {
  const client = new Client({ connectionString: stagingUri });
  await client.connect();
  const res = await client.query('SELECT email, "passwordHash" FROM users WHERE "deletedAt" IS NULL');
  
  let matchCount = 0;
  for (const user of res.rows) {
    const isMatch = await bcrypt.compare('FinTop@2026', user.passwordHash);
    if (isMatch) matchCount++;
  }
  
  console.log(`Verified ${matchCount} / ${res.rows.length} accounts match FinTop@2026 on Remote Staging.`);
  await client.end();
}

verify();
