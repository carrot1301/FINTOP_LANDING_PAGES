const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
const bcrypt = require(path.join(backendDir, 'node_modules/bcrypt'));

dotenv.config({ path: path.join(backendDir, '.env') });

const localUri = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/fintop";
const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

// All known passwords from seeders, import scripts, and common defaults
const KNOWN_PASSWORDS = [
  'FinTop@2026',        // wave1.seeder.ts (Super Admin), seed-role-permissions.ts (mock staff), import-old-data.ts
  'Fintop@2026',        // import-data-v2.js (scratch script variant - lowercase 't')
  'TestUser@2026',      // wave1.seeder.ts (test user account)
  'fintop2026',         // common simplified variant
  'fintop@2026',        // lowercase variant
  '123456',             // common default
  'password',           // common default
  'Fintop@123',         // possible dev variant
  'admin',              // possible dev variant
  'Admin@2026',         // possible dev variant
];

async function identifyPasswords(dbUri, label) {
  console.log(`\n================================================================`);
  console.log(`=== IDENTIFYING ALL PASSWORDS: ${label} ===`);
  console.log(`================================================================`);
  const client = new Client({ connectionString: dbUri, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();

    const usersRes = await client.query(`
      SELECT 
        u.id, u.email, u."fullName", u."staffCode", u."passwordHash",
        string_agg(r.code::text, ', ') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur."userId"
      LEFT JOIN roles r ON ur."roleId" = r.id
      WHERE u."deletedAt" IS NULL
      GROUP BY u.id, u.email, u."fullName", u."staffCode", u."passwordHash"
      ORDER BY u.id ASC
    `);

    console.log(`Total active accounts: ${usersRes.rows.length}`);
    console.log(`Testing against ${KNOWN_PASSWORDS.length} known passwords...\n`);

    const results = [];
    const passwordSummary = {};

    for (const user of usersRes.rows) {
      if (!user.passwordHash) {
        results.push({
          id: user.id, email: user.email, fullName: user.fullName,
          staffCode: user.staffCode, roles: user.roles,
          password: '❌ NULL (no password set)'
        });
        passwordSummary['NULL'] = (passwordSummary['NULL'] || 0) + 1;
        continue;
      }

      let matchedPassword = null;
      for (const pwd of KNOWN_PASSWORDS) {
        const matches = await bcrypt.compare(pwd, user.passwordHash).catch(() => false);
        if (matches) {
          matchedPassword = pwd;
          break;
        }
      }

      if (matchedPassword) {
        results.push({
          id: user.id, email: user.email, fullName: user.fullName,
          staffCode: user.staffCode, roles: user.roles,
          password: matchedPassword
        });
        passwordSummary[matchedPassword] = (passwordSummary[matchedPassword] || 0) + 1;
      } else {
        results.push({
          id: user.id, email: user.email, fullName: user.fullName,
          staffCode: user.staffCode, roles: user.roles,
          password: '🔒 Mật khẩu do người dùng tự đặt khi đăng ký'
        });
        passwordSummary['Người dùng tự đặt'] = (passwordSummary['Người dùng tự đặt'] || 0) + 1;
      }
    }

    // Print summary
    console.log(`\n=== 📊 TỔNG KẾT MẬT KHẨU ===`);
    for (const [pwd, count] of Object.entries(passwordSummary)) {
      console.log(`  ${pwd}: ${count} tài khoản`);
    }

    // Print full table
    console.log(`\n=== 📋 CHI TIẾT TẤT CẢ ${results.length} TÀI KHOẢN ===`);
    console.table(results);

  } catch (err) {
    console.error(`Error querying ${label}:`, err.message);
  } finally {
    try { await client.end(); } catch { }
  }
}

async function main() {
  await identifyPasswords(localUri, "LOCAL POSTGRES");
  await identifyPasswords(stagingUri, "REMOTE STAGING (Supabase)");
}

main();
