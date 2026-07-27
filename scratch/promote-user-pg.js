const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
});

async function main() {
  await client.connect();
  const email = "tuannv7105@gmail.com";
  
  // Find user id (note the table name is plural 'users' in Prisma standard PostgreSQL generation, or singular 'User' mapped in schema)
  // Let's check table names. Prisma by default maps model User to 'User' unless @@map("users") is used.
  // Wait, in schema.prisma, users is lowercase or uppercase?
  // Let's do a quick query to check if table is "User" or "users"
  let tableName = 'User';
  try {
    await client.query("SELECT id FROM \"User\" LIMIT 1");
  } catch (e) {
    tableName = 'users';
  }

  let roleTableName = 'Role';
  try {
    await client.query("SELECT id FROM \"Role\" LIMIT 1");
  } catch (e) {
    roleTableName = 'roles';
  }

  let userRoleTableName = 'UserRole';
  try {
    await client.query("SELECT * FROM \"UserRole\" LIMIT 1");
  } catch (e) {
    userRoleTableName = 'user_roles';
  }

  console.log(`Using table names: ${tableName}, ${roleTableName}, ${userRoleTableName}`);

  const userRes = await client.query(`SELECT id FROM "${tableName}" WHERE email = $1 AND "deletedAt" IS NULL`, [email]);
  if (userRes.rows.length === 0) {
    console.log(`❌ Không tìm thấy tài khoản ${email} trên database Staging!`);
    return;
  }
  const userId = userRes.rows[0].id;
  
  const roleRes = await client.query(`SELECT id FROM "${roleTableName}" WHERE code = 'SUPER_ADMIN' AND "deletedAt" IS NULL`);
  if (roleRes.rows.length === 0) {
    console.log("❌ Không tìm thấy role SUPER_ADMIN trong database!");
    return;
  }
  const roleId = roleRes.rows[0].id;
  
  const userRoleRes = await client.query(`SELECT * FROM "${userRoleTableName}" WHERE "userId" = $1 AND "roleId" = $2`, [userId, roleId]);
  if (userRoleRes.rows.length === 0) {
    await client.query(`INSERT INTO "${userRoleTableName}" ("userId", "roleId", "assignedById") VALUES ($1, $2, $3)`, [userId, roleId, userId]);
  }
  
  await client.query(`UPDATE "${tableName}" SET "tierLevel" = 'DIAMOND' WHERE id = $1`, [userId]);
  
  console.log(`✅ Đã nâng quyền tài khoản ${email} thành SUPER_ADMIN và tier DIAMOND trên server Staging thành công!`);
}

main()
  .catch(console.error)
  .finally(() => client.end());
