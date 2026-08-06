import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../common/redis/redis.service';
import * as bcrypt from 'bcrypt';
import {
  RECORD_STATUS,
  AUDIT_SOURCE,
  SIGNAL_STATUS,
  BLOG_STATUS,
  INVOICE_STATUS,
  Prisma,
  SUBSCRIPTION_TIER,
  ROLE_CODE,
} from '@prisma/client';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
  ) {}

  private async clearUserPermissionsCache(userId: number) {
    try {
      const cacheKey = `user:permissions:${userId}`;
      await this.redisService.getClient().del(cacheKey);
      this.logger.log(`Cleared permissions cache for user #${userId}`);
    } catch (err: any) {
      this.logger.error(`Failed to clear permissions cache for user #${userId}: ${err.message}`);
    }
  }

  private async syncClientRoleForTier(userId: number, tierLevel: SUBSCRIPTION_TIER, adminId: number = 1) {
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: { role: true },
      });
      const currentRoleCodes = userRoles.map(ur => ur.role.code);
      const hasStaffRole = currentRoleCodes.some(code => 
        ['SUPER_ADMIN', 'CEO', 'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR', 'SALE_ADMIN', 'SALE', 'EXPERT'].includes(code)
      );

      if (!hasStaffRole) {
        const isVipTier = tierLevel === SUBSCRIPTION_TIER.GOLD || tierLevel === SUBSCRIPTION_TIER.DIAMOND;
        const targetRoleCode = isVipTier ? 'CLIENT_VIP' : 'CLIENT';
        const roleToRemoveCode = isVipTier ? 'CLIENT' : 'CLIENT_VIP';

        if (!currentRoleCodes.includes(targetRoleCode)) {
          const targetRole = await this.prisma.role.findFirst({
            where: { code: targetRoleCode as any, deletedAt: null },
          });
          if (targetRole) {
            await this.prisma.userRole.deleteMany({
              where: {
                userId,
                role: { code: roleToRemoveCode as any },
              },
            });
            await this.prisma.userRole.create({
              data: {
                userId,
                roleId: targetRole.id,
                assignedById: adminId,
              },
            });
          }
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed to sync client role for user #${userId}: ${err.message}`);
    }
  }


  // ─────────────────────────────────────────────────────
  // OVERVIEW / KPIs
  // ─────────────────────────────────────────────────────

  async getOverview() {
    const [
      totalUsers,
      activeUsers,
      totalSignals,
      publishedSignals,
      totalBlogs,
      publishedBlogs,
      totalReports,
      totalNotifications,
      totalInvoices,
      paidInvoices,
      totalPortfolios,
      totalAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { status: RECORD_STATUS.ACTIVE, deletedAt: null } }),
      this.prisma.vipSignal.count({ where: { deletedAt: null } }),
      this.prisma.vipSignal.count({ where: { status: SIGNAL_STATUS.PUBLISHED, deletedAt: null } }),
      this.prisma.blog.count({ where: { deletedAt: null } }),
      this.prisma.blog.count({ where: { status: BLOG_STATUS.PUBLISHED, deletedAt: null } }),
      this.prisma.reportFile.count({ where: { deletedAt: null } }),
      this.prisma.notification.count(),
      this.prisma.invoice.count({ where: { deletedAt: null } }),
      this.prisma.invoice.count({ where: { status: 'PAID', deletedAt: null } }),
      this.prisma.recommendedPortfolio.count({ where: { deletedAt: null } }),
      this.prisma.auditLog.count(),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      signals: { total: totalSignals, published: publishedSignals },
      blogs: { total: totalBlogs, published: publishedBlogs },
      reports: { total: totalReports },
      notifications: { total: totalNotifications },
      invoices: { total: totalInvoices, paid: paidInvoices },
      portfolios: { total: totalPortfolios },
      auditLogs: { total: totalAuditLogs },
    };
  }

  // ─────────────────────────────────────────────────────
  // USER MANAGEMENT
  // ─────────────────────────────────────────────────────

  // Staff role codes — used for userType filtering
  private static readonly STAFF_ROLE_CODES = [
    'CEO', 'DEVELOPER', 'SUPER_ADMIN', 'ASSISTANT_CEO',
    'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR',
    'SALE_ADMIN', 'SALE', 'EXPERT',
  ];

  private static readonly CLIENT_ROLE_CODES = ['CLIENT', 'CLIENT_VIP'];

  private static readonly ROLE_HIERARCHY_RANK: Record<string, number> = {
    CEO: 1,           // Rank 1: Top Level Executive (fintop.ba@gmail.com)
    DEVELOPER: 2,     // Rank 2: Developer (fintop.bashare@gmail.com)
    SUPER_ADMIN: 2,   // Legacy rank 2
    EDITOR_ADMIN: 3,  // Rank 3: Trưởng phòng Biên tập (Chỉ do CEO/Developer quản lý)
    SALE_ADMIN: 3,    // Rank 3: Trưởng khối Môi giới (Chỉ do CEO/Developer quản lý)
    ASSISTANT_CEO: 4, // Rank 4: Trợ lý CEO (Quyền Biên tập Admin + Sale Admin + Duyệt thanh toán, không sửa được Rank 1, 2, 3)
    EDITOR_PRO: 5,
    EDITOR: 5,
    SALE: 5,
    EXPERT: 5,
    CLIENT_VIP: 6,
    CLIENT: 6,
  };

  private async enforceRoleHierarchy(operatorUserId: number, targetUserId: number, actionName: string) {
    if (!operatorUserId || operatorUserId === targetUserId) {
      return;
    }

    const [operatorUser, targetUser] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: operatorUserId },
        include: { userRoles: { include: { role: true } } },
      }),
      this.prisma.user.findUnique({
        where: { id: targetUserId },
        include: { userRoles: { include: { role: true } } },
      }),
    ]);

    if (!targetUser) return;

    // Rule 1: NO ONE except fintop.ba@gmail.com (CEO) can modify fintop.ba@gmail.com
    if (targetUser.email === 'fintop.ba@gmail.com' && operatorUser?.email !== 'fintop.ba@gmail.com') {
      throw new BadRequestException('Tài khoản CEO cấp cao nhất (fintop.ba@gmail.com) được bảo vệ tuyệt đối! Không ai có quyền chỉnh sửa, khóa hoặc gán lại vai trò của tài khoản này.');
    }

    // Rule 2: Rank enforcement
    const operatorRanks = operatorUser?.userRoles.map(ur => AdminService.ROLE_HIERARCHY_RANK[ur.role.code] ?? 99) || [99];
    const operatorMinRank = Math.min(...operatorRanks);

    const targetRanks = targetUser.userRoles.map(ur => AdminService.ROLE_HIERARCHY_RANK[ur.role.code] ?? 99);
    const targetMinRank = Math.min(...targetRanks);

    if (operatorMinRank >= targetMinRank && operatorUser?.email !== 'fintop.ba@gmail.com') {
      const isAssistantCeo = operatorUser?.userRoles.some(ur => ur.role.code === 'ASSISTANT_CEO');
      const isTargetAdminHeader = targetUser.userRoles.some(ur => ['EDITOR_ADMIN', 'SALE_ADMIN'].includes(ur.role.code));
      if (isAssistantCeo && isTargetAdminHeader) {
        throw new BadRequestException('Trợ lý CEO không được quyền chỉnh sửa, khóa, xóa hoặc thay đổi vai trò của Trưởng phòng Biên tập (EDITOR_ADMIN) và Trưởng khối Môi giới (SALE_ADMIN). Quyền này chỉ do CEO cấp!');
      }
      throw new BadRequestException(`Bạn không có quyền thực hiện hành động "${actionName}" trên tài khoản có cấp bậc tương đương hoặc cao hơn!`);
    }
  }

  async getUsers(page = 1, limit = 20, search?: string, status?: string, userType?: string, tierLevel?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (status && Object.values(RECORD_STATUS).includes(status as RECORD_STATUS)) {
      where.status = status as RECORD_STATUS;
    }

    if (tierLevel && Object.values(SUBSCRIPTION_TIER).includes(tierLevel.toUpperCase() as SUBSCRIPTION_TIER)) {
      where.tierLevel = tierLevel.toUpperCase() as SUBSCRIPTION_TIER;
    }

    const andConditions: Prisma.UserWhereInput[] = [];

    if (search && search.trim() !== '') {
      const query = search.trim();
      andConditions.push({
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { stockCompany: { contains: query, mode: 'insensitive' } },
          { stockAccount: { contains: query, mode: 'insensitive' } },
          { referralName: { contains: query, mode: 'insensitive' } },
          { referralId: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    if (userType === 'staff') {
      andConditions.push({
        userRoles: {
          some: {
            role: { code: { in: AdminService.STAFF_ROLE_CODES as any } },
          },
        },
        email: { not: 'admin@fintop.vn' },
      });
    } else if (userType === 'client') {
      andConditions.push({
        userRoles: {
          none: {
            role: { code: { in: AdminService.STAFF_ROLE_CODES as any } },
          },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          dob: true,
          address: true,
          avatarUrl: true,
          paymentProofUrl: true,
          tierLevel: true,
          status: true,
          createdAt: true,
          investmentDuration: true,
          investmentStyle: true,
          stockCompany: true,
          stockAccount: true,
          referralId: true,
          referralName: true,
          legacyTier: true,
          company: true,
          position: true,
          joinDate: true,
          sortOrder: true,
          staffCode: true,
          broker: {
            select: {
              id: true,
              fullName: true,
              department: { select: { code: true } },
              team: { select: { code: true } },
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          userRoles: {
            select: {
              role: { select: { code: true, name: true } },
            },
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = users.map(u => ({
      ...u,
      roles: u.userRoles.map(ur => ur.role),
      userRoles: undefined,
      activeSubscription: u.subscriptions?.[0] || null,
      subscriptions: undefined,
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        sessions: {
          where: { isRevoked: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        department: true,
        team: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;

    return {
      ...safeUser,
      roles: user.userRoles.map(ur => ({
        code: ur.role.code,
        name: ur.role.name,
        permissions: ur.role.permissions.map(rp => rp.permission.code),
      })),
      activeSubscription: user.subscriptions[0] || null,
      recentSessions: user.sessions.map(s => ({
        ...s,
        id: s.id.toString(),
      })),
      userRoles: undefined,
      subscriptions: undefined,
      sessions: undefined,
    };
  }

  async updateUserStatus(userId: number, newStatus: RECORD_STATUS, adminId: number) {
    await this.enforceRoleHierarchy(adminId, userId, 'thay đổi trạng thái');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }
    if (user.status === newStatus) {
      return { message: 'Status unchanged', userId, status: newStatus };
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
      select: { id: true, email: true, status: true },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: `USER_STATUS_${newStatus}`,
      tableName: 'users',
      recordId: userId.toString(),
      oldValues: { status: user.status },
      newValues: { status: newStatus },
    });

    await this.clearUserPermissionsCache(userId);
    return updated;
  }

  async assignRole(userId: number, roleCode: string, adminId: number) {
    await this.enforceRoleHierarchy(adminId, userId, 'gán vai trò');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const role = await this.prisma.role.findFirst({
      where: { code: roleCode as any, deletedAt: null },
    });
    if (!role) {
      throw new NotFoundException(`Role "${roleCode}" not found`);
    }

    // Check if operator has rank to assign this role
    const operatorUser = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { userRoles: { include: { role: true } } },
    });
    const operatorRanks = operatorUser?.userRoles.map(ur => AdminService.ROLE_HIERARCHY_RANK[ur.role.code] ?? 99) || [99];
    const operatorMinRank = Math.min(...operatorRanks);
    const targetRoleRank = AdminService.ROLE_HIERARCHY_RANK[roleCode] ?? 99;

    if (operatorMinRank >= targetRoleRank && operatorUser?.email !== 'fintop.ba@gmail.com') {
      throw new BadRequestException(`Bạn không có quyền gán vai trò "${roleCode}" (cấp bậc tương đương hoặc cao hơn vai trò của bạn)!`);
    }

    // Check if already assigned
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: role.id } },
    });
    if (existing) {
      return { message: 'Role already assigned', userId, roleCode };
    }

    await this.prisma.userRole.create({
      data: { userId, roleId: role.id, assignedById: adminId },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'ROLE_ASSIGNED',
      tableName: 'user_roles',
      recordId: `${userId}:${role.id}`,
      newValues: { userId, roleCode },
    });

    await this.clearUserPermissionsCache(userId);
    return { message: 'Role assigned', userId, roleCode };
  }

  async removeRole(userId: number, roleCode: string, adminId: number) {
    await this.enforceRoleHierarchy(adminId, userId, 'gỡ vai trò');
    const role = await this.prisma.role.findFirst({
      where: { code: roleCode as any, deletedAt: null },
    });
    if (!role) {
      throw new NotFoundException(`Role "${roleCode}" not found`);
    }

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: role.id } },
    });
    if (!existing) {
      return { message: 'Role not assigned', userId, roleCode };
    }

    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId: role.id } },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'ROLE_REMOVED',
      tableName: 'user_roles',
      recordId: `${userId}:${role.id}`,
      oldValues: { userId, roleCode },
    });

    await this.clearUserPermissionsCache(userId);
    return { message: 'Role removed', userId, roleCode };
  }

  async deleteUser(userId: number, adminId: number) {
    await this.enforceRoleHierarchy(adminId, userId, 'xóa tài khoản');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'USER_DELETED',
      tableName: 'users',
      recordId: userId.toString(),
      oldValues: { email: user.email },
    });

    await this.clearUserPermissionsCache(userId);
    return { message: 'User deleted successfully', userId };
  }

  async updateUser(userId: number, dto: any, adminId: number) {
    await this.enforceRoleHierarchy(adminId, userId, 'chỉnh sửa thông tin');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const data: Prisma.UserUncheckedUpdateInput = {};
    
    if (dto.password !== undefined && dto.password !== '') {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    
    if (dto.birthDate !== undefined) {
      data.dob = dto.birthDate ? new Date(dto.birthDate) : null;
    }
    if (dto.investmentDuration !== undefined) data.investmentDuration = dto.investmentDuration;
    if (dto.investmentStyle !== undefined) data.investmentStyle = dto.investmentStyle;
    if (dto.stockCompany !== undefined) data.stockCompany = dto.stockCompany;
    if (dto.stockAccount !== undefined) data.stockAccount = dto.stockAccount;
    if (dto.referralId !== undefined) data.referralId = dto.referralId;
    if (dto.referralName !== undefined) data.referralName = dto.referralName;
    if (dto.legacyTier !== undefined) data.legacyTier = dto.legacyTier;

    // Handle tierLevel updates and client role synchronization
    if (dto.tierLevel !== undefined) {
      const tierUpper = dto.tierLevel.toUpperCase();
      if (['STANDARD', 'SILVER', 'GOLD', 'DIAMOND'].includes(tierUpper)) {
        data.tierLevel = tierUpper as SUBSCRIPTION_TIER;

        // Auto synchronize roles for CLIENT/CLIENT_VIP to match the tier
        // First, check if the user is a client (does not have staff roles)
        const userRoles = await this.prisma.userRole.findMany({
          where: { userId },
          include: { role: true },
        });
        const currentRoleCodes = userRoles.map(ur => ur.role.code);
        const hasStaffRole = currentRoleCodes.some(code => 
          ['SUPER_ADMIN', 'CEO', 'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR', 'SALE_ADMIN', 'SALE', 'EXPERT'].includes(code)
        );

        if (!hasStaffRole) {
          // It's a client user. Let's sync their role!
          const isVipTier = tierUpper === 'GOLD' || tierUpper === 'DIAMOND';
          const targetRoleCode = isVipTier ? 'CLIENT_VIP' : 'CLIENT';
          const roleToRemoveCode = isVipTier ? 'CLIENT' : 'CLIENT_VIP';

          if (!currentRoleCodes.includes(targetRoleCode)) {
            // Find target role
            const targetRole = await this.prisma.role.findFirst({
              where: { code: targetRoleCode as any, deletedAt: null },
            });
            if (targetRole) {
              // Delete old client role
              await this.prisma.userRole.deleteMany({
                where: {
                  userId,
                  role: { code: roleToRemoveCode as any },
                },
              });
              // Create new client role
              await this.prisma.userRole.create({
                data: {
                  userId,
                  roleId: targetRole.id,
                  assignedById: adminId,
                },
              });
            }
          }
        }
      }
    }

    // Handle broker search and resolution if provided as string
    if (dto.broker !== undefined) {
      if (!dto.broker || dto.broker.trim() === '') {
        data.brokerId = null;
      } else {
        const brokerStr = dto.broker.trim();
        const possibleId = parseInt(brokerStr, 10);
        if (!isNaN(possibleId)) {
          data.brokerId = possibleId;
        } else {
          const foundBroker = await this.prisma.user.findFirst({
            where: {
              OR: [
                { fullName: { contains: brokerStr, mode: 'insensitive' } },
                { email: { contains: brokerStr, mode: 'insensitive' } }
              ],
              deletedAt: null
            }
          });
          if (foundBroker) {
            data.brokerId = foundBroker.id;
          }
        }
      }
    }

    // New fields
    if (dto.company !== undefined) data.company = dto.company;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.joinDate !== undefined) {
      data.joinDate = dto.joinDate ? new Date(dto.joinDate) : null;
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder ? parseInt(dto.sortOrder, 10) : null;
    }

    // Manager / Broker
    if (dto.brokerId !== undefined) {
      data.brokerId = dto.brokerId ? parseInt(dto.brokerId, 10) : null;
    }

    // Staff code (ID nhân sự) - save directly on user AND map to team/department
    if (dto.staffCode !== undefined) {
      data.staffCode = dto.staffCode ? dto.staffCode.trim() : null;
      if (!dto.staffCode || dto.staffCode.trim() === '') {
        data.teamId = null;
      } else {
        const code = dto.staffCode.trim();
        const team = await this.prisma.team.findUnique({ where: { code } });
        if (team) {
          data.teamId = team.id;
          data.departmentId = team.departmentId;
        } else {
          const dept = await this.prisma.department.findUnique({ where: { code } });
          if (dept) {
            data.departmentId = dept.id;
            data.teamId = null;
          } else {
            // Auto create team under SALES department if it doesn't exist
            const salesDept = await this.prisma.department.findUnique({ where: { code: 'SALES' } });
            if (salesDept) {
              const newTeam = await this.prisma.team.create({
                data: {
                  name: `Team ${code}`,
                  code,
                  departmentId: salesDept.id,
                },
              });
              data.teamId = newTeam.id;
              data.departmentId = salesDept.id;
            }
          }
        }
      }
    }

    // Update roles
    if (dto.roleCodes !== undefined) {
      await this.prisma.userRole.deleteMany({ where: { userId } });
      if (Array.isArray(dto.roleCodes) && dto.roleCodes.length > 0) {
        const roles = await this.prisma.role.findMany({
          where: { code: { in: dto.roleCodes as any } },
        });
        await this.prisma.userRole.createMany({
          data: roles.map(r => ({
            userId,
            roleId: r.id,
            assignedById: adminId,
          })),
        });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        dob: true,
        address: true,
        tierLevel: true,
        status: true,
        investmentDuration: true,
        investmentStyle: true,
        stockCompany: true,
        stockAccount: true,
        legacyTier: true,
        company: true,
        position: true,
        joinDate: true,
        sortOrder: true,
        staffCode: true,
        avatarUrl: true,
        brokerId: true,
      }
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'USER_UPDATED',
      tableName: 'users',
      recordId: userId.toString(),
      oldValues: {
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        investmentDuration: user.investmentDuration,
        investmentStyle: user.investmentStyle,
        stockCompany: user.stockCompany,
        stockAccount: user.stockAccount,
        company: user.company,
        position: user.position,
        joinDate: user.joinDate,
        sortOrder: user.sortOrder,
        brokerId: user.brokerId,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
      newValues: data,
    });

    await this.clearUserPermissionsCache(userId);
    if (dto.tierLevel !== undefined) {
      await this.notificationService.sendSessionUpdate(userId);
    }
    return updated;
  }

  // ─────────────────────────────────────────────────────
  // RBAC
  // ─────────────────────────────────────────────────────

  async getRoles() {
    const roles = await this.prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { permissions: true, users: true } },
      },
      orderBy: { id: 'asc' },
    });

    return roles.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description,
      isSystem: r.isSystem,
      status: r.status,
      permissionCount: r._count.permissions,
      userCount: r._count.users,
    }));
  }

  async getRolePermissions(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    return {
      role: { id: role.id, name: role.name, code: role.code },
      permissions: role.permissions.map(rp => ({
        id: rp.permission.id,
        module: rp.permission.module,
        action: rp.permission.action,
        code: rp.permission.code,
        description: rp.permission.description,
      })),
    };
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      where: { status: RECORD_STATUS.ACTIVE, deletedAt: null },
      orderBy: { code: 'asc' },
    });
  }

  async updateRolePermissions(roleId: number, permissionIds: number[], adminId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId, deletedAt: null },
    });
    if (!role) {
      throw new NotFoundException(`Role #${roleId} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Delete existing
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // 2. Create new
      if (permissionIds && permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((pid) => ({
            roleId,
            permissionId: pid,
          })),
        });
      }
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'ROLE_PERMISSIONS_UPDATED',
      tableName: 'roles',
      recordId: roleId.toString(),
      newValues: { permissionIds },
    });

    // Clear cache for all users assigned to this role
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: { roleId },
        select: { userId: true },
      });
      for (const ur of userRoles) {
        await this.clearUserPermissionsCache(ur.userId);
      }
    } catch (err: any) {
      this.logger.error(`Failed to clear cache for role #${roleId} users: ${err.message}`);
    }

    return { message: 'Permissions updated successfully', roleId };
  }

  // ─────────────────────────────────────────────────────
  // SIGNALS (Admin — all statuses, no tier filter)
  // ─────────────────────────────────────────────────────

  async getSignals(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.VipSignalWhereInput = { deletedAt: null };

    if (status && Object.values(SIGNAL_STATUS).includes(status as SIGNAL_STATUS)) {
      where.status = status as SIGNAL_STATUS;
    }

    const [total, signals] = await Promise.all([
      this.prisma.vipSignal.count({ where }),
      this.prisma.vipSignal.findMany({
        where,
        include: {
          stock: { select: { symbol: true, companyName: true } },
          author: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = signals.map(s => ({
      id: s.id,
      symbol: s.stock.symbol,
      companyName: s.stock.companyName,
      direction: s.direction,
      status: s.status,
      minTierAccess: s.minTierAccess,
      entryPrice: s.entryPrice.toNumber(),
      cutLossPrice: s.cutLossPrice.toNumber(),
      targetPrice: s.targetPrice.toNumber(),
      notes: s.notes,
      publishedAt: s.publishedAt,
      closedAt: s.closedAt,
      author: s.author ? { fullName: s.author.fullName, email: s.author.email } : null,
      createdAt: s.createdAt,
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─────────────────────────────────────────────────────
  // CMS — Blogs (Admin — all statuses)
  // ─────────────────────────────────────────────────────

  async getBlogs(page = 1, limit = 20, status?: string, search?: string, categoryId?: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.BlogWhereInput = { deletedAt: null };

    if (status && Object.values(BLOG_STATUS).includes(status as BLOG_STATUS)) {
      where.status = status as BLOG_STATUS;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, blogs] = await Promise.all([
      this.prisma.blog.count({ where }),
      this.prisma.blog.findMany({
        where,
        include: {
          author: { select: { fullName: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = blogs.map(b => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      excerpt: b.excerpt,
      status: b.status,
      visibility: b.visibility,
      minTierAccess: b.minTierAccess,
      publishedAt: b.publishedAt,
      createdAt: b.createdAt,
      author: b.author ? { fullName: b.author.fullName, email: b.author.email } : null,
      category: b.category,
      categoryId: b.categoryId,
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─────────────────────────────────────────────────────
  // CMS — Reports (Admin — all statuses)
  // ─────────────────────────────────────────────────────

  async getReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.ReportFileWhereInput = { deletedAt: null };

    const [total, reports] = await Promise.all([
      this.prisma.reportFile.count({ where }),
      this.prisma.reportFile.findMany({
        where,
        include: {
          uploader: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = reports.map(r => ({
      id: r.id,
      title: r.title,
      reportType: r.reportType,
      status: r.status,
      minTierAccess: r.minTierAccess,
      fileUrl: r.fileUrl,
      fileSize: r.fileSize,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
      uploader: r.uploader ? { fullName: r.uploader.fullName, email: r.uploader.email } : null,
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─────────────────────────────────────────────────────
  // NOTIFICATIONS (Admin — cross-user + broadcast)
  // ─────────────────────────────────────────────────────

  async getNotifications(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.findMany({
        include: {
          user: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = notifications.map(n => ({
      id: n.id.toString(),
      title: n.title,
      content: n.content,
      priority: n.priority,
      status: n.status,
      createdAt: n.createdAt,
      user: n.user ? { fullName: n.user.fullName, email: n.user.email } : null,
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async broadcastNotification(title: string, content: string, userIds: number[], adminId: number) {
    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('At least one userId is required');
    }

    const results: Array<{ userId: number; status: string; id?: string; error?: string }> = [];
    for (const userId of userIds) {
      try {
        const notification = await this.notificationService.createNotification(userId, title, content);
        results.push({ userId, status: 'sent', id: notification.id.toString() });
      } catch (err) {
        results.push({ userId, status: 'failed', error: err.message });
      }
    }

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'NOTIFICATION_BROADCAST',
      tableName: 'notifications',
      recordId: `broadcast:${userIds.length}`,
      newValues: { title, userIds },
    });

    return { sent: results.filter(r => r.status === 'sent').length, results };
  }

  // ─────────────────────────────────────────────────────
  // AUDIT LOGS
  // ─────────────────────────────────────────────────────

  async getAuditLogs(page = 1, limit = 30, action?: string, userId?: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }
    if (userId) {
      where.userId = userId;
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = logs.map(l => ({
      id: l.id.toString(),
      action: l.action,
      source: l.source,
      tableName: l.tableName,
      recordId: l.recordId,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
      user: l.user ? { fullName: l.user.fullName, email: l.user.email } : null,
      oldValues: l.oldValues,
      newValues: l.newValues,
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─────────────────────────────────────────────────────
  // BILLING (Admin — subscription plans + invoices)
  // ─────────────────────────────────────────────────────

  async getSubscriptionPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'asc' },
    });
  }

  async createPlan(dto: CreatePlanDto, adminId: number) {
    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        features: dto.features || '',
        tierLevel: dto.tierLevel,
        price: dto.price,
        currency: dto.currency || 'VND',
        durationDays: dto.durationDays,
        status: RECORD_STATUS.ACTIVE,
      },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'PLAN_CREATED',
      tableName: 'subscription_plans',
      recordId: plan.id.toString(),
      newValues: { ...dto },
    });

    return plan;
  }

  async updatePlan(id: number, dto: UpdatePlanDto, adminId: number) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Subscription plan #${id} not found`);
    }

    const oldValues = {
      name: existing.name,
      description: existing.description,
      features: existing.features,
      tierLevel: existing.tierLevel,
      price: existing.price.toNumber(),
      currency: existing.currency,
      durationDays: existing.durationDays,
      status: existing.status,
    };

    const plan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        features: dto.features,
        tierLevel: dto.tierLevel,
        price: dto.price,
        currency: dto.currency,
        durationDays: dto.durationDays,
        status: dto.status,
      },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'PLAN_UPDATED',
      tableName: 'subscription_plans',
      recordId: id.toString(),
      oldValues,
      newValues: { ...dto },
    });

    return plan;
  }

  async deletePlan(id: number, adminId: number) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Subscription plan #${id} not found`);
    }

    const plan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'PLAN_DELETED',
      tableName: 'subscription_plans',
      recordId: id.toString(),
      oldValues: { name: existing.name },
    });

    return plan;
  }

  async getInvoices(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.InvoiceWhereInput = { deletedAt: null };

    const [total, invoices] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              stockAccount: true,
              stockCompany: true,
              paymentProofUrl: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              tierLevel: true,
              price: true,
            },
          },
          subscription: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              isPermanent: true,
              plan: {
                select: {
                  id: true,
                  name: true,
                  tierLevel: true,
                },
              },
            },
          },
          transactions: {
            select: { id: true, provider: true, status: true, amount: true, createdAt: true },
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = invoices.map(inv => ({
      id: inv.id.toString(),
      amount: inv.amount.toNumber(),
      currency: inv.currency,
      status: inv.status,
      dueDate: inv.dueDate,
      createdAt: inv.createdAt,
      user: inv.user ? {
        fullName: inv.user.fullName,
        email: inv.user.email,
        phone: inv.user.phone,
        stockAccount: inv.user.stockAccount,
        stockCompany: inv.user.stockCompany,
        paymentProofUrl: inv.user.paymentProofUrl,
      } : null,
      plan: inv.plan ? {
        id: inv.plan.id,
        name: inv.plan.name,
        tierLevel: inv.plan.tierLevel,
        price: inv.plan.price.toNumber(),
      } : (inv.subscription?.plan ? {
        id: inv.subscription.plan.id,
        name: inv.subscription.plan.name,
        tierLevel: inv.subscription.plan.tierLevel,
        price: 0,
      } : null),
      subscription: inv.subscription ? {
        id: inv.subscription.id.toString(),
        status: inv.subscription.status,
        startDate: inv.subscription.startDate,
        endDate: inv.subscription.endDate,
        isPermanent: inv.subscription.isPermanent,
        plan: inv.subscription.plan ? {
          name: inv.subscription.plan.name,
          tierLevel: inv.subscription.plan.tierLevel,
        } : null,
      } : null,
      transactions: inv.transactions.map(t => ({
        id: t.id.toString(),
        provider: t.provider,
        status: t.status,
        amount: t.amount.toNumber(),
        createdAt: t.createdAt,
      })),
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveInvoice(invoiceId: bigint, isPermanent: boolean, endDateStr?: string, adminId?: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId, deletedAt: null },
      include: { user: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Find subscription plan matching invoice planId or amount (or fallback)
    const plan = (invoice.planId
      ? await this.prisma.subscriptionPlan.findUnique({ where: { id: invoice.planId } })
      : null)
      || await this.prisma.subscriptionPlan.findFirst({
        where: { price: invoice.amount, status: 'ACTIVE', deletedAt: null },
      }) || await this.prisma.subscriptionPlan.findFirst({
        where: { status: 'ACTIVE', deletedAt: null },
      });

    if (!plan) {
      throw new NotFoundException('No active subscription plan found');
    }

    const startDate = new Date();
    let endDate = new Date();
    if (isPermanent) {
      endDate = new Date('2099-12-31T23:59:59.999Z');
    } else if (endDateStr) {
      endDate = new Date(endDateStr);
    } else {
      endDate.setDate(endDate.getDate() + plan.durationDays);
    }

    if (invoice.status === INVOICE_STATUS.PAID && invoice.subscriptionId) {
      await this.prisma.userSubscription.update({
        where: { id: invoice.subscriptionId },
        data: {
          startDate,
          endDate,
          isPermanent,
        }
      });
      await this.prisma.user.update({
        where: { id: invoice.userId },
        data: { tierLevel: plan.tierLevel },
      });
      await this.syncClientRoleForTier(invoice.userId, plan.tierLevel, adminId || 1);
      await this.clearUserPermissionsCache(invoice.userId);
      await this.notificationService.sendSessionUpdate(invoice.userId);
      await this.prisma.auditLog.create({
        data: {
          userId: adminId || invoice.userId,
          source: 'USER',
          action: 'INVOICE_SUBSCRIPTION_UPDATED',
          tableName: 'invoices',
          recordId: invoiceId.toString(),
          newValues: { planId: plan.id, isPermanent, endDate: endDate.toISOString() },
        }
      });
      return { success: true };
    }

    if (invoice.status === INVOICE_STATUS.PAID) {
      throw new ConflictException('Invoice already paid');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Create transaction record
      await tx.transaction.create({
        data: {
          invoiceId,
          provider: 'MANUAL',
          providerId: `manual_admin_${adminId || 0}_${Date.now()}`,
          amount: invoice.amount,
          currency: invoice.currency,
          status: 'SUCCESS',
        }
      });

      // 2. Create UserSubscription
      const subscription = await tx.userSubscription.create({
        data: {
          userId: invoice.userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          isPermanent,
        }
      });

      // 3. Mark invoice as PAID
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: INVOICE_STATUS.PAID,
          subscriptionId: subscription.id,
        }
      });

      // 4. Update user's tierLevel
      await tx.user.update({
        where: { id: invoice.userId },
        data: { tierLevel: plan.tierLevel },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminId || invoice.userId,
          source: 'USER',
          action: 'INVOICE_APPROVED_MANUALLY',
          tableName: 'invoices',
          recordId: invoiceId.toString(),
          newValues: { planId: plan.id, isPermanent, endDate: endDate.toISOString() },
        }
      });
    });

    // Sync client role, clear cache, and push realtime session update
    await this.syncClientRoleForTier(invoice.userId, plan.tierLevel, adminId || 1);
    await this.clearUserPermissionsCache(invoice.userId);
    await this.notificationService.sendSessionUpdate(invoice.userId);

    // Send notification
    try {
      const tierLabels: Record<string, string> = {
        GOLD: 'V.I.P',
        DIAMOND: 'Diamond',
        SILVER: 'PRO',
        STANDARD: 'Standard',
      };
      const tierName = tierLabels[plan.tierLevel] || plan.tierLevel;
      await this.notificationService.createNotification(
        invoice.userId,
        'Nâng cấp tài khoản thành công',
        `Tài khoản của bạn đã được quản trị viên duyệt nâng cấp lên cấp độ ${tierName} (${plan.name}). Đã mở khóa đầy đủ đặc quyền tương ứng với gói.`
      );
    } catch (err: any) {
      this.logger.warn(`Failed to send approval notification to user ${invoice.userId}: ${err.message}`);
    }

    return { success: true };
  }

  // ─────────────────────────────────────────────────────
  // MARKET DATA
  // ─────────────────────────────────────────────────────

  async getMarketSyncLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      this.prisma.marketDataSyncLog.count(),
      this.prisma.marketDataSyncLog.findMany({
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = logs.map(l => ({
      id: l.id.toString(),
      source: l.source,
      syncType: l.syncType,
      status: l.status,
      recordsUpserted: l.recordsUpserted,
      recordsFailed: l.recordsFailed,
      errorMessage: l.errorMessage,
      startedAt: l.startedAt,
      completedAt: l.completedAt,
    }));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStocks(page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    const [total, stocks] = await Promise.all([
      this.prisma.stock.count({ where: { deletedAt: null } }),
      this.prisma.stock.findMany({
        where: { deletedAt: null },
        include: {
          exchange: { select: { code: true, name: true } },
          industry: { select: { name: true, code: true } },
        },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: stocks,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─────────────────────────────────────────────────────
  // PORTFOLIOS
  // ─────────────────────────────────────────────────────

  async getPortfolios() {
    const portfolios = await this.prisma.recommendedPortfolio.findMany({
      where: { deletedAt: null },
      include: {
        manager: { select: { fullName: true, email: true } },
        _count: { select: { holdings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return portfolios.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      minTierAccess: p.minTierAccess,
      initialCapital: p.initialCapital.toNumber(),
      currentNav: p.currentNav.toNumber(),
      cashBalance: p.cashBalance.toNumber(),
      holdingCount: p._count.holdings,
      manager: p.manager ? { fullName: p.manager.fullName, email: p.manager.email } : null,
      createdAt: p.createdAt,
    }));
  }

  // ─────────────────────────────────────────────────────
  // HANDBOOKS
  // ─────────────────────────────────────────────────────

  async getHandbooks(category?: string, search?: string) {
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.handbook.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
    });
  }

  async createHandbook(dto: { title: string; driveLink?: string; category: string; description?: string; linkType?: string; order?: number }, adminId: number) {
    const orderVal = dto.order !== undefined ? dto.order : 0;

    // Dịch chuyển các cẩm nang có order >= orderVal tăng thêm 1
    if (orderVal > 0) {
      await this.prisma.handbook.updateMany({
        where: {
          category: dto.category,
          order: {
            gte: orderVal,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });
    }

    const handbook = await this.prisma.handbook.create({
      data: {
        title: dto.title,
        driveLink: dto.driveLink,
        category: dto.category,
        description: dto.description,
        linkType: dto.linkType || 'link',
        order: orderVal,
      },
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'HANDBOOK_CREATED',
      tableName: 'handbooks',
      recordId: handbook.id.toString(),
      newValues: dto,
    });

    return handbook;
  }

  async updateHandbook(id: number, dto: { title?: string; driveLink?: string; category?: string; description?: string; linkType?: string; order?: number; status?: RECORD_STATUS }, adminId: number) {
    const existing = await this.prisma.handbook.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Handbook #${id} not found`);
    }

    const newOrder = dto.order;
    const oldOrder = existing.order;

    // Tự động sắp xếp lại thứ tự khi thay đổi thứ tự
    if (newOrder !== undefined && newOrder !== oldOrder) {
      const category = dto.category || existing.category;

      await this.prisma.$transaction(async (tx) => {
        if (newOrder > oldOrder) {
          // Di chuyển xuống dưới: các bài từ (oldOrder + 1) đến newOrder giảm đi 1
          await tx.handbook.updateMany({
            where: {
              category,
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
              id: { not: id },
            },
            data: {
              order: {
                decrement: 1,
              },
            },
          });
        } else {
          // Di chuyển lên trên: các bài từ newOrder đến (oldOrder - 1) tăng thêm 1
          await tx.handbook.updateMany({
            where: {
              category,
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
              id: { not: id },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });
        }
      });
    }

    const updated = await this.prisma.handbook.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'HANDBOOK_UPDATED',
      tableName: 'handbooks',
      recordId: id.toString(),
      oldValues: {
        title: existing.title,
        driveLink: existing.driveLink,
        category: existing.category,
        description: existing.description,
        linkType: existing.linkType,
        order: existing.order,
        status: existing.status,
      },
      newValues: dto,
    });

    return updated;
  }

  async deleteHandbook(id: number, adminId: number) {
    const existing = await this.prisma.handbook.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Handbook #${id} not found`);
    }

    await this.prisma.handbook.delete({ where: { id } });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.USER,
      action: 'HANDBOOK_DELETED',
      tableName: 'handbooks',
      recordId: id.toString(),
      oldValues: { title: existing.title },
    });

    return { message: 'Handbook deleted successfully', id };
  }
}
