const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const localUri = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/fintop";
const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

// Executive management emails to assign SUPER_ADMIN role
const EXEC_EMAILS = [
  'fintop.bashare@gmail.com',
  'fintop.ba@gmail.com',
  'withna0610@gmail.com',
  'khanhlinhtran10150@gmail.com',
  'doantri12343@gmail.com',
  'tuannv7105@gmail.com',
  'tuanmv7105@gmail.com',
];

async function promoteAccounts(dbUri, label) {
  console.log(`\n======================================================`);
  console.log(`=== ASSIGNING SUPER_ADMIN ROLE IN: ${label} ===`);
  console.log(`======================================================`);
  const client = new Client({ connectionString: dbUri, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();

    // Get SUPER_ADMIN role ID
    const roleRes = await client.query(`SELECT id FROM roles WHERE code = 'SUPER_ADMIN' AND "deletedAt" IS NULL`);
    if (roleRes.rows.length === 0) {
      console.log(`❌ SUPER_ADMIN role not found in DB`);
      return;
    }
    const superAdminRoleId = roleRes.rows[0].id;

    for (const email of EXEC_EMAILS) {
      const userRes = await client.query(`SELECT id, "fullName" FROM users WHERE email = $1 AND "deletedAt" IS NULL`, [email]);
      if (userRes.rows.length === 0) {
        console.log(`⚠️ User not found: ${email}`);
        continue;
      }
      const userId = userRes.rows[0].id;
      const userName = userRes.rows[0].fullName;

      // Assign SUPER_ADMIN role
      await client.query(`
        INSERT INTO user_roles ("userId", "roleId", "assignedById")
        VALUES ($1, $2, $1)
        ON CONFLICT ("userId", "roleId") DO NOTHING
      `, [userId, superAdminRoleId]);

      console.log(`✅ Cấp quyền SUPER_ADMIN cho: [ID ${userId}] ${userName} (${email})`);
    }

  } catch (err) {
    console.error(`Error promoting accounts in ${label}:`, err.message);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  await promoteAccounts(localUri, "LOCAL POSTGRES");
  await promoteAccounts(stagingUri, "REMOTE STAGING (Supabase)");
}

main();
