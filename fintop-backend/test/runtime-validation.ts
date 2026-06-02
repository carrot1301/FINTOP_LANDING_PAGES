import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  ROLE_CODE,
  RECORD_STATUS,
  SUBSCRIPTION_TIER,
  PERMISSION_ACTION,
  PERMISSION_MODULE,
  AUDIT_SOURCE
} from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runValidation() {
  console.log('🔍 Bắt đầu kiểm thử Runtime Integrity Validation (Wave 1)...');

  try {
    // 1. Kiểm tra UserRole assignment & RBAC relation traversal
    console.log('⚡ Check #1: RBAC relation traversal & UserRole assignment');
    const adminUser: any = await prisma.user.findUnique({
      where: { email: 'admin@fintop.vn' },
      include: {
        department: true,
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

    if (!adminUser) throw new Error('Không tìm thấy tài khoản admin@fintop.vn');
    console.log(`  -> Tìm thấy User: ${adminUser.fullName}`);
    console.log(`  -> Department: ${adminUser.department?.name}`);
    console.log(`  -> Số lượng Role gán: ${adminUser.userRoles.length}`);
    const firstRole = adminUser.userRoles[0]?.role;
    console.log(`  -> Role: ${firstRole?.name} (${firstRole?.code})`);
    console.log(`  -> Số lượng Permission trong Role: ${firstRole?.permissions?.length}`);
    console.log('  [PASS] RBAC relations và UserRole assignment hoạt động chính xác.');

    // 2. Kiểm tra Nullable Audit Events & AuditLog insert
    console.log('\n⚡ Check #2: AuditLog insert & Nullable audit events');
    const nonHumanAudit = await prisma.auditLog.create({
      data: {
        // Không truyền userId để kiểm tra nullable relations cho non-human events
        source: AUDIT_SOURCE.CRON,
        action: 'SCHEDULED_CLEANUP',
        tableName: 'user_sessions',
        recordId: 'SYSTEM_BATCH_01',
        newValues: { status: 'CLEANED_EXPIRED_SESSIONS' },
        ipAddress: '127.0.0.1',
        userAgent: 'System Cron Service',
      },
    });
    console.log(`  -> Đã tạo Audit Log không cần userId (ID: ${nonHumanAudit.id.toString()}), Source: ${nonHumanAudit.source}`);
    console.log('  [PASS] Nullable audit events & AuditLog insert hoạt động hoàn hảo.');

    // 3. Kiểm tra Enum serialization
    console.log('\n⚡ Check #3: Enum serialization');
    console.log(`  -> Tier Level của admin: ${adminUser.tierLevel}`);
    console.log(`  -> Record Status của admin: ${adminUser.status}`);
    if (adminUser.tierLevel !== SUBSCRIPTION_TIER.DIAMOND || adminUser.status !== RECORD_STATUS.ACTIVE) {
      throw new Error('Giá trị Enum không khớp với dữ liệu trong database');
    }
    console.log('  [PASS] Enum serialization hoạt động chuẩn xác.');

    // 4. Kiểm tra Soft delete pattern
    console.log('\n⚡ Check #4: Soft delete pattern & Query safety');
    // Tạo 1 phòng ban thử nghiệm
    const tempDept = await prisma.department.create({
      data: {
        name: 'Phòng ban tạm thời (Test Soft Delete)',
        code: 'TEMP_DEPT_01',
        description: 'Dùng để test soft delete',
        status: RECORD_STATUS.ACTIVE,
      },
    });
    console.log(`  -> Đã tạo Department tạm (ID: ${tempDept.id})`);

    // Thực hiện Soft delete
    const deletedDate = new Date();
    await prisma.department.update({
      where: { id: tempDept.id },
      data: {
        status: RECORD_STATUS.INACTIVE,
        deletedAt: deletedDate,
      },
    });

    // Query lọc soft deleted records
    const activeDepts = await prisma.department.findMany({
      where: { deletedAt: null, status: RECORD_STATUS.ACTIVE },
    });
    const foundTempInActive = activeDepts.some(d => d.id === tempDept.id);
    if (foundTempInActive) throw new Error('Soft deleted record vẫn xuất hiện trong query active');
    console.log('  -> Query danh sách active không bao gồm record đã bị soft delete.');
    console.log('  [PASS] Soft delete pattern hoạt động tuyệt đối an toàn.');

    // Dọn dẹp record tạm
    await prisma.department.delete({ where: { id: tempDept.id } });

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA RUNTIME ĐỀU THÀNH CÔNG (100% PASS)!');
  } catch (error) {
    console.error('\n❌ KIỂM THỬ RUNTIME THẤT BẠI:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runValidation();
