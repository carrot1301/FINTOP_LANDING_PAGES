const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres:123@localhost:5432/fintop"
});

async function main() {
  await client.connect();
  
  // Clean up
  await client.query("DELETE FROM users WHERE email IN ('test1@fintop.vn', 'test2@fintop.vn')");

  try {
    await client.query("INSERT INTO users (email, \"fullName\", phone, \"passwordHash\", status, \"createdAt\", \"updatedAt\") VALUES ('test1@fintop.vn', 'Test 1', '0123456789', '123', 'ACTIVE', NOW(), NOW())");
    console.log("Created test1");
    
    await client.query("INSERT INTO users (email, \"fullName\", phone, \"passwordHash\", status, \"createdAt\", \"updatedAt\") VALUES ('test2@fintop.vn', 'Test 2', '0123456789', '123', 'ACTIVE', NOW(), NOW())");
  } catch(error) {
    console.log("PG Error code:", error.code);
    console.log("PG Error constraint:", error.constraint);
    console.log("PG Error detail:", error.detail);
    console.log("PG Error message:", error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => client.end());
