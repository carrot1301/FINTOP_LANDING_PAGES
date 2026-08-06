const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
const bcrypt = require(path.join(backendDir, 'node_modules/bcrypt'));

dotenv.config({ path: path.join(backendDir, '.env') });

const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function resetStagingPasswords() {
  console.log(`================================================================`);
  console.log(`=== SYNCING STAGING PASSWORDS TO FinTop@2026 ===`);
  console.log(`================================================================`);
  
  const client = new Client({ connectionString: stagingUri, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();

    // 1. Generate standard hash for FinTop@2026
    const targetPassword = 'FinTop@2026';
    const targetHash = await bcrypt.hash(targetPassword, 10);
    console.log(`Generated Bcrypt Hash for '${targetPassword}': ${targetHash}`);

    // 2. Execute UPDATE on Staging Database
    console.log(`Executing UPDATE on Staging Database...`);
    const updateRes = await client.query(`
      UPDATE users 
      SET "passwordHash" = $1, "updatedAt" = NOW()
      WHERE "deletedAt" IS NULL
    `, [targetHash]);

    console.log(`✅ Updated ${updateRes.rowCount} accounts on Remote Staging Supabase.`);

    // 3. Verification step
    const verifyRes = await client.query(`
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN "passwordHash" = $1 THEN 1 END) as exact_matches
      FROM users 
      WHERE "deletedAt" IS NULL
    `, [targetHash]);

    console.log(`\n=== 📊 KẾT QUẢ XÁC NHẬN TRÊN SUPABASE STAGING ===`);
    console.log(`- Tổng số tài khoản: ${verifyRes.rows[0].total}`);
    console.log(`- Số tài khoản đã đồng bộ mật khẩu 'FinTop@2026': ${verifyRes.rows[0].exact_matches}`);
    
    if (parseInt(verifyRes.rows[0].total) === parseInt(verifyRes.rows[0].exact_matches)) {
      console.log(`🎉 HOÀN TẤT 100%! TOÀN BỘ TÀI KHOẢN TRÊN STAGING ĐÃ ĐƯỢC RESET VỀ 'FinTop@2026'.`);
    }

  } catch (err) {
    console.error(`❌ Error updating Staging Database:`, err.message);
  } finally {
    try { await client.end(); } catch {}
  }
}

resetStagingPasswords();
