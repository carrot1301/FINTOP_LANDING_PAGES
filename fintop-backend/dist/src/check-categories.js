"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('--- USER CHECK: admin@fintop.vn ---');
    const user = await prisma.user.findUnique({
        where: { email: 'admin@fintop.vn' },
        include: {
            userRoles: {
                include: {
                    role: true
                }
            },
            subscriptions: {
                include: {
                    plan: true
                }
            }
        }
    });
    console.log(JSON.stringify(user, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-categories.js.map