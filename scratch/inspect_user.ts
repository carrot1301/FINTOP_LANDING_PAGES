import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- USER INFO ---');
  const user = await prisma.user.findFirst({
    where: { email: 'tuanmv7105@gmail.com' },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    status: user.status,
    tierLevel: user.tierLevel,
    roles: user.userRoles.map(ur => ({
      code: ur.role.code,
      name: ur.role.name,
      permissions: ur.role.permissions.map(rp => rp.permission.code)
    }))
  }, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
