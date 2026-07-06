/**
 * Advanced DB Import Script for Fintop
 * Imports staff and client records from scrape files into PostgreSQL
 */

const path = require('path');
const fs = require('fs');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
const bcrypt = require(path.join(backendDir, 'node_modules/bcrypt'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Clean name for exact name matching
function cleanName(name) {
  if (!name) return '';
  return name.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, ' ');
}

// Map old system roles to ROLE_CODE enum
function mapRoleCode(oldRole) {
  if (!oldRole) return 'SALE';
  const r = oldRole.trim().toLowerCase();
  if (r.includes('ceo') || r.includes('giám đốc')) return 'CEO';
  if (r.includes('sale_admin') || r.includes('sale admin')) return 'SALE_ADMIN';
  if (r.includes('sale') || r.includes('môi giới')) return 'SALE';
  if (r.includes('admin') || r.includes('quản trị')) return 'SUPER_ADMIN';
  if (r.includes('editor') || r.includes('biên tập')) return 'EDITOR';
  return 'SALE'; // Default role for staff
}

// Map old system tiers to SUBSCRIPTION_TIER enum
function mapTierLevel(oldTier) {
  if (!oldTier) return 'STANDARD';
  const t = oldTier.trim().toLowerCase();
  if (t.includes('diamond') || t.includes('kim cương') || t.includes('kim_cuong')) return 'DIAMOND';
  if (t.includes('gold') || t.includes('vàng')) return 'GOLD';
  if (t.includes('silver') || t.includes('bạc')) return 'SILVER';
  return 'STANDARD';
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = dateStr.trim();
  if (!d || d.startsWith('1988-0') || d.startsWith('1988-00') || d === '1988-0') return null; // handle malformed dob in examples like 1988-0
  
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    return new Date(d.split(' ')[0]);
  }
  const parts = d.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (parts) {
    return new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
  }
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

async function runImport() {
  const client = await pool.connect();
  const defaultPasswordHash = await bcrypt.hash('Fintop@2026', 10);

  try {
    console.log('🚀 Starting import of staff and clients...');
    await client.query('BEGIN');

    // 1. Fetch existing Roles to map IDs
    const rolesRes = await client.query('SELECT id, code FROM roles');
    const rolesMap = {}; // code -> id
    rolesRes.rows.forEach(r => {
      rolesMap[r.code] = r.id;
    });

    // 2. Fetch all current Users for matching
    const usersRes = await client.query('SELECT id, email, "fullName", phone, "teamId" FROM users WHERE "deletedAt" IS NULL');
    const existingUsersByEmail = {};
    const existingUsersByPhone = {};
    const existingUsersByName = {};

    usersRes.rows.forEach(u => {
      existingUsersByEmail[u.email.toLowerCase()] = u;
      if (u.phone) {
        existingUsersByPhone[u.phone.trim()] = u;
      }
      const cName = cleanName(u.fullName);
      if (cName) {
        existingUsersByName[cName] = u;
      }
    });

    // 3. Import STAFF records
    const staffFile = path.join(__dirname, 'staff_data.json');
    let staffCount = 0;
    if (fs.existsSync(staffFile)) {
      const staffData = JSON.parse(fs.readFileSync(staffFile, 'utf8'));
      console.log(`\n--- Importing ${staffData.length} Staff records ---`);

      for (const s of staffData) {
        if (!s.email || !s.fullName) continue;
        const email = s.email.trim().toLowerCase();
        const cName = cleanName(s.fullName);

        // Check matching
        let dbUser = existingUsersByEmail[email];
        if (!dbUser && s.phone) {
          dbUser = existingUsersByPhone[s.phone.trim()];
        }
        if (!dbUser) {
          dbUser = existingUsersByName[cName];
        }
        
        let teamId = null;
        if (s.staffCode) {
          // Find or create Team for staffCode
          const teamRes = await client.query('SELECT id FROM teams WHERE code = $1', [s.staffCode]);
          if (teamRes.rows.length > 0) {
            teamId = teamRes.rows[0].id;
          } else {
            const newTeam = await client.query(
              `INSERT INTO teams (name, code, "departmentId", status, "createdAt", "updatedAt")
               VALUES ($1, $2, 2, 'ACTIVE', NOW(), NOW()) RETURNING id`,
              [`Team ${s.fullName}`, s.staffCode]
            );
            teamId = newTeam.rows[0].id;
            console.log(`  🆕 Created new Team: Team ${s.fullName} (${s.staffCode})`);
          }
        }

        const dob = parseDate(s.dob);
        const roleEnum = mapRoleCode(s.role);
        const roleId = rolesMap[roleEnum] || rolesMap['SALE'];

        if (dbUser) {
          // Update existing user info and align email to the production one if matched by name
          await client.query(
            `UPDATE users 
             SET email = $1, "fullName" = $2, phone = $3, dob = $4, address = $5, "teamId" = $6, "updatedAt" = NOW() 
             WHERE id = $7`,
            [email, s.fullName, s.phone || null, dob, s.address || null, teamId || dbUser.teamId, dbUser.id]
          );

          // Update user role
          await client.query(
            `INSERT INTO user_roles ("userId", "roleId", "assignedById") 
             VALUES ($1, $2, $1) 
             ON CONFLICT ("userId", "roleId") DO NOTHING`,
            [dbUser.id, roleId]
          );

          // Delete CLIENT role if it's a staff member
          const clientRoleId = rolesMap['CLIENT'];
          if (clientRoleId && roleId !== clientRoleId) {
            await client.query(
              `DELETE FROM user_roles WHERE "userId" = $1 AND "roleId" = $2`,
              [dbUser.id, clientRoleId]
            );
          }

          console.log(`  ✅ Updated staff: ${s.fullName} (${email}) - DB ID: ${dbUser.id}`);
        } else {
          // Create new staff
          const newUser = await client.query(
            `INSERT INTO users (email, "passwordHash", "fullName", phone, dob, address, "teamId", status, "tierLevel", "createdAt", "updatedAt", "emailVerifiedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', 'STANDARD', NOW(), NOW(), NOW())
             RETURNING id`,
            [email, defaultPasswordHash, s.fullName, s.phone || null, dob, s.address || null, teamId]
          );
          
          const newUserId = newUser.rows[0].id;

          // Assign role
          await client.query(
            `INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, $1)`,
            [newUserId, roleId]
          );

          console.log(`  🆕 Created staff: ${s.fullName} (${email}) - DB ID: ${newUserId}`);
        }
        staffCount++;
      }
    }

    // 4. Import CLIENT records
    const clientFile = path.join(__dirname, 'client_data.json');
    let clientCount = 0;
    if (fs.existsSync(clientFile)) {
      const clientData = JSON.parse(fs.readFileSync(clientFile, 'utf8'));
      console.log(`\n--- Importing ${clientData.length} Client records ---`);

      // Refresh users cache after staff import
      const usersRes2 = await client.query('SELECT id, email, "fullName", phone FROM users WHERE "deletedAt" IS NULL');
      const updatedUsersByEmail = {};
      const updatedUsersByPhone = {};
      const updatedUsersByName = {};
      usersRes2.rows.forEach(u => {
        updatedUsersByEmail[u.email.toLowerCase()] = u;
        if (u.phone) {
          updatedUsersByPhone[u.phone.trim()] = u;
        }
        const cName = cleanName(u.fullName);
        if (cName) {
          updatedUsersByName[cName] = u;
        }
      });

      for (const c of clientData) {
        if (!c.email || !c.fullName) continue;
        const email = c.email.trim().toLowerCase();
        const cName = cleanName(c.fullName);

        let dbUser = updatedUsersByEmail[email];
        if (!dbUser && c.phone) {
          dbUser = updatedUsersByPhone[c.phone.trim()];
        }
        if (!dbUser) {
          dbUser = updatedUsersByName[cName];
        }
        const dob = parseDate(c.dob);
        const joinDate = parseDate(c.joinDate);
        const tier = mapTierLevel(c.tierLevel);

        if (dbUser) {
          // Update client specific fields
          await client.query(
            `UPDATE users 
             SET email = $1, "fullName" = $2, phone = $3, dob = $4, address = $5, "joinDate" = $6,
                 "investmentDuration" = $7, "investmentStyle" = $8, "stockCompany" = $9, "stockAccount" = $10,
                 "tierLevel" = $11, "updatedAt" = NOW()
             WHERE id = $12`,
            [
              email, c.fullName, c.phone || null, dob, c.address || null, joinDate,
              c.investmentDuration || null, c.investmentStyle || null, c.stockCompany || null, c.stockAccount || null,
              tier, dbUser.id
            ]
          );

          // Ensure client role
          const roleId = rolesMap['CLIENT'] || 11;
          await client.query(
            `INSERT INTO user_roles ("userId", "roleId", "assignedById") 
             VALUES ($1, $2, $1) 
             ON CONFLICT ("userId", "roleId") DO NOTHING`,
            [dbUser.id, roleId]
          );

          console.log(`  ✅ Updated client: ${c.fullName} (${email}) - DB ID: ${dbUser.id}`);
        } else {
          // Create new client
          const newUser = await client.query(
            `INSERT INTO users (email, "passwordHash", "fullName", phone, dob, address, "joinDate",
             "investmentDuration", "investmentStyle", "stockCompany", "stockAccount", status, "tierLevel", "createdAt", "updatedAt", "emailVerifiedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE', $12, NOW(), NOW(), NOW())
             RETURNING id`,
            [
              email, defaultPasswordHash, c.fullName, c.phone || null, dob, c.address || null, joinDate,
              c.investmentDuration || null, c.investmentStyle || null, c.stockCompany || null, c.stockAccount || null,
              tier
            ]
          );

          const newUserId = newUser.rows[0].id;
          const roleId = rolesMap['CLIENT'] || 11;
          await client.query(
            `INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, $1)`,
            [newUserId, roleId]
          );

          console.log(`  🆕 Created client: ${c.fullName} (${email}) - DB ID: ${newUserId}`);
        }
        clientCount++;
      }
    }

    await client.query('COMMIT');
    console.log('\n==================================================');
    console.log(`🎉 IMPORT COMPLETED SUCCESSFULLY!`);
    console.log(`Staff records processed: ${staffCount}`);
    console.log(`Client records processed: ${clientCount}`);
    console.log('==================================================');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed, transaction rolled back:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

runImport();
