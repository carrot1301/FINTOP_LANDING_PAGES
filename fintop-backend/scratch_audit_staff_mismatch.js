require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('====================================================');
    console.log('🔍 [AUDIT 1] ALL USERS WITH ROLES & STAFF CODES');
    console.log('====================================================');

    const allStaff = await client.query(`
      SELECT u.id, u.email, u."fullName", u."staffCode", u.status,
             array_to_string(array_agg(r.code), ', ') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur."userId"
      LEFT JOIN roles r ON ur."roleId" = r.id
      WHERE u."deletedAt" IS NULL
      GROUP BY u.id
      HAVING count(r.id) > 0
      ORDER BY u.id ASC
    `);

    console.table(allStaff.rows.map(r => ({
      id: r.id,
      email: r.email,
      fullName: r.fullName,
      staffCode: r.staffCode || '⚠️ (NO STAFF CODE)',
      roles: r.roles || ''
    })));

    console.log('\n====================================================');
    console.log('🔍 [AUDIT 2] DUPLICATE OR CONFLICTING STAFF CODES');
    console.log('====================================================');

    const duplicates = await client.query(`
      SELECT "staffCode", count(*) as count,
             array_to_string(array_agg(id), ', ') as user_ids,
             array_to_string(array_agg("fullName"), ' | ') as names,
             array_to_string(array_agg(email), ' | ') as emails
      FROM users
      WHERE "staffCode" IS NOT NULL AND "deletedAt" IS NULL
      GROUP BY "staffCode"
      HAVING count(*) > 1
    `);

    if (duplicates.rows.length === 0) {
      console.log('✅ No duplicate staffCode found! All staffCodes are unique.');
    } else {
      console.log('⚠️ CONFLICTS FOUND: Duplicate staffCodes assigned to multiple users!');
      console.table(duplicates.rows);
    }

    console.log('\n====================================================');
    console.log('🔍 [AUDIT 3] ALL STAFF MEMBERS & THEIR STAFF CODES');
    console.log('====================================================');

    const staffOnly = await client.query(`
      SELECT u.id, u.email, u."fullName", u."staffCode",
             array_to_string(array_agg(r.code), ', ') as roles
      FROM users u
      JOIN user_roles ur ON u.id = ur."userId"
      JOIN roles r ON ur."roleId" = r.id
      WHERE u."deletedAt" IS NULL
        AND r.code IN ('CEO', 'SUPER_ADMIN', 'DEVELOPER', 'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR', 'SALE_ADMIN', 'SALE')
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    console.table(staffOnly.rows);

    console.log('\n====================================================');
    console.log('🔍 [AUDIT 4] CLIENT BROKER ASSIGNMENTS & MISMATCHES');
    console.log('====================================================');

    const brokersAudit = await client.query(`
      SELECT u.id as client_id, u.email as client_email, u."fullName" as client_name,
             u."brokerId", u."referralId", u."referralName",
             b.id as manager_id, b.email as manager_email, b."fullName" as manager_name, b."staffCode" as manager_staffCode
      FROM users u
      LEFT JOIN users b ON u."brokerId" = b.id
      WHERE u."brokerId" IS NOT NULL AND u."deletedAt" IS NULL
      ORDER BY u.id ASC
    `);

    console.log(`Total clients with brokerId assigned: ${brokersAudit.rows.length}`);
    console.table(brokersAudit.rows.slice(0, 30).map(r => ({
      client: `${r.client_id}: ${r.client_name}`,
      brokerId: r.brokerId,
      managerName: r.manager_name || '❌ (INVALID MANAGER ID)',
      managerStaffCode: r.manager_staffCode || '⚠️ (NO STAFF CODE)',
      referralId: r.referralId || '—',
      referralName: r.referralName || '—'
    })));

    console.log('\n====================================================');
    console.log('🔍 [AUDIT 5] REFERRAL ID vs MANAGER STAFF CODE MISMATCHES');
    console.log('====================================================');

    const referralMismatch = await client.query(`
      SELECT u.id, u.email, u."fullName", u."brokerId", u."referralId", u."referralName",
             b."fullName" as broker_name, b."staffCode" as broker_staffCode
      FROM users u
      JOIN users b ON u."brokerId" = b.id
      WHERE u."deletedAt" IS NULL
        AND u."referralId" IS NOT NULL
        AND u."referralId" != b."staffCode"
    `);

    if (referralMismatch.rows.length === 0) {
      console.log('✅ No mismatch between referralId and broker.staffCode!');
    } else {
      console.log(`⚠️ Mismatches found (${referralMismatch.rows.length} cases where referralId != broker.staffCode):`);
      console.table(referralMismatch.rows);
    }

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
