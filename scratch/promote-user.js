const { PrismaClient } = require('@prisma/client');

// Connect directly to Supabase Staging database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function main() {
  const email = "tuannv7105@gmail.com";
  
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`❌ Không tìm thấy tài khoản ${email} trên database Staging!`);
    return;
  }
  
  // Find SUPER_ADMIN role
  const role = await prisma.role.findFirst({ where: { code: 'SUPER_ADMIN' } });
  if (!role) {
    console.log("❌ Không tìm thấy role SUPER_ADMIN trong database!");
    return;
  }
  
  // Assign SUPER_ADMIN role to user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: user.id, roleId: role.id }
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
      assignedById: user.id
    }
  });
  
  // Update user tierLevel to DIAMOND
  await prisma.user.update({
    where: { id: user.id },
    data: { tierLevel: 'DIAMOND' }
  });
  
  console.log(`✅ Đã nâng quyền tài khoản ${email} thành SUPER_ADMIN và tier DIAMOND trên server Staging thành công!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
