/**
 * Import staff and client data from old fintopdata.vn into current database.
 * 
 * Usage: node scratch/import-data.js
 * 
 * Prerequisites:
 * - scratch/staff_data.json  (39 records)
 * - scratch/client_data.json (73 records)
 */

const path = require('path');
const fs = require('fs');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
const bcryptPath = path.join(backendDir, 'node_modules/bcrypt');
let bcrypt;
try { bcrypt = require(bcryptPath); } catch(e) {
  bcrypt = require(path.join(backendDir, 'node_modules/bcryptjs'));
}

dotenv.config({ path: path.join(backendDir, '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Map tier level names from old system
function mapTierLevel(tier) {
  if (!tier) return 'STANDARD';
  const t = tier.trim().toLowerCase();
  if (t.includes('diamond') || t.includes('kim cương')) return 'DIAMOND';
  if (t.includes('gold') || t.includes('vàng')) return 'GOLD';
  if (t.includes('silver') || t.includes('bạc')) return 'SILVER';
  return 'STANDARD';
}

// Format date string to ISO date  
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = dateStr.trim();
  if (!d) return null;
  
  // Try YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    return new Date(d.split(' ')[0]); // Take just date part if datetime
  }
  
  // Try DD/MM/YYYY
  const parts = d.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (parts) {
    return new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
  }
  
  // Try parsing as general date
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

async function importStaff(client) {
  const filePath = path.join(__dirname, 'staff_data.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ staff_data.json not found. Skipping staff import.');
    return 0;
  }

  const staffData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`\n📋 Found ${staffData.length} staff records to import.`);
  
  let imported = 0, updated = 0, skipped = 0;

  for (const s of staffData) {
    if (!s.email) {
      console.log(`  ⚠️ Skipping staff "${s.fullName}" - no email`);
      skipped++;
      continue;
    }

    const email = s.email.trim().toLowerCase();
    
    // Check if user exists
    const existing = await client.query('SELECT id, "fullName" FROM users WHERE LOWER(email) = $1', [email]);
    
    if (existing.rows.length > 0) {
      // Update existing user with missing fields
      const userId = existing.rows[0].id;
      const updates = [];
      const values = [];
      let paramIdx = 1;

      if (s.fullName && s.fullName.trim()) {
        updates.push(`"fullName" = $${paramIdx++}`);
        values.push(s.fullName.trim());
      }
      if (s.phone && s.phone.trim()) {
        updates.push(`phone = $${paramIdx++}`);
        values.push(s.phone.trim());
      }
      if (s.address && s.address.trim()) {
        updates.push(`address = $${paramIdx++}`);
        values.push(s.address.trim());
      }
      if (s.dob) {
        const dob = parseDate(s.dob);
        if (dob) {
          updates.push(`dob = $${paramIdx++}`);
          values.push(dob);
        }
      }

      if (updates.length > 0) {
        values.push(userId);
        await client.query(
          `UPDATE users SET ${updates.join(', ')}, "updatedAt" = NOW() WHERE id = $${paramIdx}`,
          values
        );
        console.log(`  ✅ Updated staff: ${s.fullName} (${email}) - ID: ${userId}`);
        updated++;
      } else {
        console.log(`  ⏭️ Staff already up-to-date: ${s.fullName} (${email})`);
        skipped++;
      }
    } else {
      // Create new user
      const dob = parseDate(s.dob);
      const hash = await bcrypt.hash('Fintop@2026', 10); // Default password

      const result = await client.query(
        `INSERT INTO users (email, "passwordHash", "fullName", phone, address, dob, status, "tierLevel", "createdAt", "updatedAt", "emailVerifiedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', 'STANDARD', NOW(), NOW(), NOW())
         RETURNING id`,
        [email, hash, s.fullName || '', s.phone || null, s.address || null, dob]
      );
      
      const newId = result.rows[0].id;
      console.log(`  🆕 Created staff: ${s.fullName} (${email}) - New ID: ${newId}`);
      imported++;
    }
  }

  console.log(`\n📊 Staff Import Summary: ${imported} created, ${updated} updated, ${skipped} skipped`);
  return imported + updated;
}

async function importClients(client) {
  const filePath = path.join(__dirname, 'client_data.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ client_data.json not found. Skipping client import.');
    return 0;
  }

  const clientData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`\n📋 Found ${clientData.length} client records to import.`);
  
  let imported = 0, updated = 0, skipped = 0;

  for (const c of clientData) {
    if (!c.email) {
      console.log(`  ⚠️ Skipping client "${c.fullName}" - no email`);
      skipped++;
      continue;
    }

    const email = c.email.trim().toLowerCase();
    
    // Check if user exists
    const existing = await client.query('SELECT id, "fullName" FROM users WHERE LOWER(email) = $1', [email]);
    
    if (existing.rows.length > 0) {
      // Update existing user with missing fields
      const userId = existing.rows[0].id;
      const updates = [];
      const values = [];
      let paramIdx = 1;

      if (c.fullName && c.fullName.trim()) {
        updates.push(`"fullName" = $${paramIdx++}`);
        values.push(c.fullName.trim());
      }
      if (c.phone && c.phone.trim()) {
        updates.push(`phone = $${paramIdx++}`);
        values.push(c.phone.trim());
      }
      if (c.address && c.address.trim()) {
        updates.push(`address = $${paramIdx++}`);
        values.push(c.address.trim());
      }
      if (c.dob) {
        const dob = parseDate(c.dob);
        if (dob) {
          updates.push(`dob = $${paramIdx++}`);
          values.push(dob);
        }
      }
      if (c.joinDate) {
        const joinDate = parseDate(c.joinDate);
        if (joinDate) {
          updates.push(`"joinDate" = $${paramIdx++}`);
          values.push(joinDate);
        }
      }
      if (c.investmentDuration && c.investmentDuration.trim()) {
        updates.push(`"investmentDuration" = $${paramIdx++}`);
        values.push(c.investmentDuration.trim());
      }
      if (c.investmentStyle && c.investmentStyle.trim()) {
        updates.push(`"investmentStyle" = $${paramIdx++}`);
        values.push(c.investmentStyle.trim());
      }
      if (c.stockCompany && c.stockCompany.trim()) {
        updates.push(`"stockCompany" = $${paramIdx++}`);
        values.push(c.stockCompany.trim());
      }
      if (c.stockAccount && c.stockAccount.trim()) {
        updates.push(`"stockAccount" = $${paramIdx++}`);
        values.push(c.stockAccount.trim());
      }
      if (c.tierLevel) {
        updates.push(`"tierLevel" = $${paramIdx++}`);
        values.push(mapTierLevel(c.tierLevel));
      }

      if (updates.length > 0) {
        values.push(userId);
        await client.query(
          `UPDATE users SET ${updates.join(', ')}, "updatedAt" = NOW() WHERE id = $${paramIdx}`,
          values
        );
        console.log(`  ✅ Updated client: ${c.fullName} (${email}) - ID: ${userId}`);
        updated++;
      } else {
        console.log(`  ⏭️ Client already up-to-date: ${c.fullName} (${email})`);
        skipped++;
      }
    } else {
      // Create new user
      const dob = parseDate(c.dob);
      const joinDate = parseDate(c.joinDate);
      const hash = await bcrypt.hash('Fintop@2026', 10); // Default password
      const tier = mapTierLevel(c.tierLevel);

      const result = await client.query(
        `INSERT INTO users (email, "passwordHash", "fullName", phone, address, dob, "joinDate",
         "investmentDuration", "investmentStyle", "stockCompany", "stockAccount",
         status, "tierLevel", "createdAt", "updatedAt", "emailVerifiedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE', $12, NOW(), NOW(), NOW())
         RETURNING id`,
        [
          email, hash, c.fullName || '', c.phone || null, c.address || null,
          dob, joinDate, c.investmentDuration || null, c.investmentStyle || null,
          c.stockCompany || null, c.stockAccount || null, tier
        ]
      );
      
      const newId = result.rows[0].id;
      console.log(`  🆕 Created client: ${c.fullName} (${email}) - New ID: ${newId}`);
      imported++;
    }
  }

  console.log(`\n📊 Client Import Summary: ${imported} created, ${updated} updated, ${skipped} skipped`);
  return imported + updated;
}

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting data import from old fintopdata.vn...\n');
    
    // Begin transaction
    await client.query('BEGIN');

    const staffCount = await importStaff(client);
    const clientCount = await importClients(client);

    // Commit
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Import completed! Staff: ${staffCount}, Clients: ${clientCount}`);
    console.log('='.repeat(50));

    // Show total users count
    const total = await client.query('SELECT COUNT(*) FROM users WHERE "deletedAt" IS NULL');
    console.log(`\n📊 Total active users in database: ${total.rows[0].count}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed, rolled back:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
