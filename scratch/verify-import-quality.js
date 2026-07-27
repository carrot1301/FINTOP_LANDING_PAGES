const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== Checking Client Import Integrity ===');
    // 1. Fetch total clients
    const clientsCountRes = await client.query(`
      SELECT COUNT(*) 
      FROM users u
      JOIN user_roles ur ON u.id = ur."userId"
      JOIN roles r ON ur."roleId" = r.id
      WHERE r.code = 'CLIENT' AND u."deletedAt" IS NULL
    `);
    console.log(`Total CLIENT users in DB: ${clientsCountRes.rows[0].count}`);

    // 2. Fetch total staff
    const staffCountRes = await client.query(`
      SELECT COUNT(*) 
      FROM users u
      JOIN user_roles ur ON u.id = ur."userId"
      JOIN roles r ON ur."roleId" = r.id
      WHERE r.code != 'CLIENT' AND u."deletedAt" IS NULL
    `);
    console.log(`Total STAFF/ADMIN users in DB: ${staffCountRes.rows[0].count}`);

    // 3. Inspect a sample of clients to verify stockCompany, stockAccount, dob, joinDate, brokerId
    const sampleClients = await client.query(`
      SELECT u.id, u.email, u."fullName", u."stockCompany", u."stockAccount", u.dob, u."joinDate", u."brokerId", b."fullName" as broker_name, b."staffCode" as broker_code
      FROM users u
      JOIN user_roles ur ON u.id = ur."userId"
      JOIN roles r ON ur."roleId" = r.id
      LEFT JOIN users b ON u."brokerId" = b.id
      WHERE r.code = 'CLIENT' AND u."deletedAt" IS NULL
      AND u."stockAccount" IS NOT NULL AND u."stockAccount" != ''
      LIMIT 5
    `);
    console.log('\n=== Sample Clients with Active Accounts in DB ===');
    console.log(JSON.stringify(sampleClients.rows, null, 2));

    // 4. Check if any client has a manager code but brokerId is null
    const mismatchCount = await client.query(`
      SELECT COUNT(*)
      FROM users u
      JOIN user_roles ur ON u.id = ur."userId"
      JOIN roles r ON ur."roleId" = r.id
      WHERE r.code = 'CLIENT' AND u."deletedAt" IS NULL
      AND u."referralId" IS NOT NULL AND u."referralId" != ''
      AND u."brokerId" IS NULL
    `);
    console.log(`\nClients with referralId but brokerId is null: ${mismatchCount.rows[0].count}`);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
