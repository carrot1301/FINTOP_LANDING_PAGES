require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('====================================================');
    console.log('🔍 [ORIGINAL BROKER AUDIT FROM BACKUP FILES]');
    console.log('====================================================');

    // Read client_data.json if exists
    let clientJsonPath = path.join(__dirname, '../fintop_web_cu/scratch/client_data.json');
    if (!fs.existsSync(clientJsonPath)) {
      clientJsonPath = path.join(__dirname, 'scratch/client_data.json');
    }

    if (fs.existsSync(clientJsonPath)) {
      const clientData = JSON.parse(fs.readFileSync(clientJsonPath, 'utf8'));
      console.log(`Found ${clientData.length} records in client_data.json:`);
      
      const targetEmails = [
        'ptu186204@gmail.com',
        'xolano8558@gmail.com',
        'phuonganh2559@gmail.com',
        'huongdn2008@gmail.com',
        'thanhcaht38@gmail.com',
        'maitiendung210899@gmail.com'
      ];

      targetEmails.forEach(email => {
        const item = clientData.find(c => (c.email || '').toLowerCase() === email);
        if (item) {
          console.log(`- ${email} (${item.fullName || item.name}): manager = "${item.manager || item.broker}"`);
        } else {
          console.log(`- ${email}: Not found in client_data.json`);
        }
      });
    }

    // Now query current database for all users with brokerId = 6
    console.log('\n====================================================');
    console.log('🔍 [CURRENT DATABASE USERS WITH BROKER_ID = 6 (Nguyễn Văn Tuấn)]');
    console.log('====================================================');

    const usersWithBroker6 = await client.query(`
      SELECT u.id, u.email, u."fullName", u."brokerId", u."referralId", u."referralName"
      FROM users u
      WHERE u."brokerId" = 6 AND u."deletedAt" IS NULL
    `);
    console.table(usersWithBroker6.rows);

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
