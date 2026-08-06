const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
const bcrypt = require(path.join(backendDir, 'node_modules/bcrypt'));

dotenv.config({ path: path.join(backendDir, '.env') });

const localUri = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/fintop";
const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function checkUser(dbUri, label) {
  console.log(`\n======================================================`);
  console.log(`=== CHECKING CEO USER (fintop.ba@gmail.com) IN: ${label} ===`);
  console.log(`======================================================`);
  const client = new Client({ connectionString: dbUri });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT u.id, u.email, u."fullName", u.status, u."passwordHash", string_agg(r.code::text, ', ') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur."userId"
      LEFT JOIN roles r ON ur."roleId" = r.id
      WHERE u.email = 'fintop.ba@gmail.com' AND u."deletedAt" IS NULL
      GROUP BY u.id
    `);

    if (res.rows.length === 0) {
      console.log("❌ User fintop.ba@gmail.com not found!");
    } else {
      const user = res.rows[0];
      console.log("User details:", {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roles: user.roles
      });

      const passCheck = await bcrypt.compare('FinTop@2026', user.passwordHash);
      console.log("Password 'FinTop@2026' matches:", passCheck);

      if (!passCheck || user.status !== 'ACTIVE') {
        const newHash = await bcrypt.hash('FinTop@2026', 10);
        await client.query(`UPDATE users SET status = 'ACTIVE', "passwordHash" = $1 WHERE id = $2`, [newHash, user.id]);
        console.log(`✅ Fixed: Reset status to ACTIVE and password to 'FinTop@2026' for ${user.email}`);
      }
    }
  } catch (err) {
    console.error(`Error in ${label}:`, err.message);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  await checkUser(localUri, "LOCAL POSTGRES");
  await checkUser(stagingUri, "REMOTE STAGING (Supabase)");
}

main();
