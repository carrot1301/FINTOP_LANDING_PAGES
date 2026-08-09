/**
 * fix-email-verified.js
 * ---------------------------------------------------
 * Fix lỗi EMAIL_NOT_VERIFIED cho tất cả tài khoản hiện có
 * bằng cách set emailVerifiedAt = NOW() cho tất cả user
 * mà chưa có giá trị emailVerifiedAt.
 * ---------------------------------------------------
 */

const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
});

async function main() {
  await client.connect();
  console.log('✅ Kết nối database thành công.\n');

  // 1. Detect table name (could be "User" or "users" depending on Prisma @@map)
  let tableName = 'users';
  try {
    await client.query('SELECT id FROM "users" LIMIT 1');
  } catch {
    tableName = 'User';
  }
  console.log(`📋 Table name: "${tableName}"\n`);

  // 2. Check how many users currently have emailVerifiedAt = NULL
  const beforeRes = await client.query(
    `SELECT id, email, "fullName", "createdAt", "emailVerifiedAt"
     FROM "${tableName}"
     WHERE "emailVerifiedAt" IS NULL
       AND "deletedAt" IS NULL
     ORDER BY id`
  );

  console.log(`📊 Tổng tài khoản chưa xác thực email: ${beforeRes.rows.length}`);
  console.log('─'.repeat(80));

  if (beforeRes.rows.length === 0) {
    console.log('✅ Không có tài khoản nào cần fix. Mọi thứ đã OK!');
    return;
  }

  // List them out
  for (const row of beforeRes.rows) {
    const created = new Date(row.createdAt).toLocaleDateString('vi-VN');
    console.log(`  ID=${String(row.id).padStart(3)}  ${(row.email || '').padEnd(45)}  ${row.fullName || ''}  (created: ${created})`);
  }

  console.log('\n🔧 Đang update emailVerifiedAt = NOW() cho tất cả...\n');

  // 3. Run the UPDATE
  const updateRes = await client.query(
    `UPDATE "${tableName}"
     SET "emailVerifiedAt" = NOW()
     WHERE "emailVerifiedAt" IS NULL
       AND "deletedAt" IS NULL`
  );

  console.log(`✅ Đã update thành công ${updateRes.rowCount} tài khoản!\n`);

  // 4. Verify the fix
  const afterRes = await client.query(
    `SELECT COUNT(*) as remaining
     FROM "${tableName}"
     WHERE "emailVerifiedAt" IS NULL
       AND "deletedAt" IS NULL`
  );

  const remaining = parseInt(afterRes.rows[0].remaining, 10);
  if (remaining === 0) {
    console.log('🎉 Xác nhận: Tất cả tài khoản đã có emailVerifiedAt. Không còn ai bị block EMAIL_NOT_VERIFIED!');
  } else {
    console.log(`⚠️  Vẫn còn ${remaining} tài khoản chưa được update (có thể đã bị soft-delete).`);
  }
}

main()
  .catch(console.error)
  .finally(() => client.end());
