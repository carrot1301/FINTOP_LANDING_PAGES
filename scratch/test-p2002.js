const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:123@localhost:5432/fintop"
    }
  }
});

async function test() {
  // Clean up existing test users if any
  await prisma.user.deleteMany({
    where: {
      email: { in: ["test1@fintop.vn", "test2@fintop.vn"] }
    }
  });

  try {
    // Create first test user
    await prisma.user.create({
      data: {
        email: "test1@fintop.vn",
        fullName: "Test 1",
        phone: "0123456789",
        passwordHash: "123"
      }
    });
    console.log("Created test1");

    // Create second test user with duplicate phone
    await prisma.user.create({
      data: {
        email: "test2@fintop.vn",
        fullName: "Test 2",
        phone: "0123456789",
        passwordHash: "123"
      }
    });
  } catch (error) {
    console.log("Error code:", error.code);
    console.log("Error meta:", JSON.stringify(error.meta));
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
