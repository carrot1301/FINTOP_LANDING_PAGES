require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('====================================================');
    console.log('🔄 [RESTORE ALL CLIENT MANAGERS FROM ORIGINAL CLIENT_DATA.JSON]');
    console.log('====================================================');

    let clientJsonPath = path.join(__dirname, '../fintop_web_cu/scratch/client_data.json');
    if (!fs.existsSync(clientJsonPath)) {
      clientJsonPath = path.join(__dirname, 'scratch/client_data.json');
    }

    if (!fs.existsSync(clientJsonPath)) {
      console.error('❌ client_data.json not found!');
      return;
    }

    const clientData = JSON.parse(fs.readFileSync(clientJsonPath, 'utf8'));
    console.log(`Loaded ${clientData.length} records from client_data.json.`);

    const staffQuery = await client.query(`
      SELECT id, email, "fullName", "staffCode"
      FROM users
      WHERE "deletedAt" IS NULL
    `);
    const staffList = staffQuery.rows;

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const item of clientData) {
      const email = (item.email || '').toLowerCase().trim();
      const managerStr = (item.manager || item.broker || '').trim();

      if (!email || !managerStr) continue;

      let targetCode = '';
      let targetName = '';
      if (managerStr.includes('-')) {
        const parts = managerStr.split('-');
        targetCode = parts[0].trim();
        targetName = parts.slice(1).join('-').trim();
      } else {
        targetName = managerStr;
      }

      let matchedStaff = null;
      if (targetCode) {
        matchedStaff = staffList.find(s => s.staffCode === targetCode);
      }
      if (!matchedStaff && targetName) {
        matchedStaff = staffList.find(s => (s.fullName || '').toLowerCase() === targetName.toLowerCase());
      }

      if (matchedStaff) {
        const updateRes = await client.query(`
          UPDATE users
          SET "brokerId" = $1,
              "referralId" = COALESCE($2, "referralId"),
              "referralName" = COALESCE($3, "referralName")
          WHERE LOWER(email) = $4 AND "deletedAt" IS NULL
        `, [matchedStaff.id, matchedStaff.staffCode, matchedStaff.fullName, email]);

        if (updateRes.rowCount > 0) {
          console.log(`✅ [Restored] ${email} (${item.fullName || item.name}) -> Manager: ${matchedStaff.staffCode} - ${matchedStaff.fullName} (id: ${matchedStaff.id})`);
          updatedCount++;
        }
      } else {
        console.log(`⚠️ [Manager Not Found] ${email} -> manager string "${managerStr}" (Code: ${targetCode}, Name: ${targetName})`);
        notFoundCount++;
      }
    }

    console.log(`\n====================================================`);
    console.log(`🎉 RESTORATION SUMMARY: Updated ${updatedCount} clients. Unmatched: ${notFoundCount}`);
    console.log(`====================================================`);

    const tuanClients = await client.query(`
      SELECT u.id, u.email, u."fullName", u."brokerId", b."fullName" as manager_name, b."staffCode" as manager_code
      FROM users u
      LEFT JOIN users b ON u."brokerId" = b.id
      WHERE u."brokerId" = 6 AND u."deletedAt" IS NULL
    `);
    console.log(`\nRemaining clients under Nguyễn Văn Tuấn (id 6): ${tuanClients.rows.length}`);
    console.table(tuanClients.rows);

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
