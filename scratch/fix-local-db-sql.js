const { Client } = require('pg');

async function fixLocalDbDirect() {
  const dbUri = "postgresql://postgres:123@localhost:5432/fintop";
  console.log('Connecting to local DB postgresql://postgres:123@localhost:5432/fintop...');
  const client = new Client({ connectionString: dbUri });
  try {
    await client.connect();
    console.log('Connected!');
    const res = await client.query(
      `UPDATE users SET "emailVerifiedAt" = NULL WHERE email != 'admin@fintop.vn' AND "deletedAt" IS NULL`
    );
    console.log(`✅ Direct SQL updated ${res.rowCount} rows on local DB!`);
  } catch (err) {
    console.error('Error direct SQL:', err.message);
  } finally {
    await client.end();
  }
}

fixLocalDbDirect().catch(console.error);
