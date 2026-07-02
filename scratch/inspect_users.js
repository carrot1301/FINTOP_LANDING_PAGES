const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['tuannv7105@gmail.com', 'tuanmv7105@gmail.com']
      }
    },
    include: {
      team: true,
      department: true
    }
  });

  console.log('--- USERS FOUND ---');
  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      teamId: u.teamId,
      teamCode: u.team?.code,
      departmentId: u.departmentId,
      deptCode: u.department?.code
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
