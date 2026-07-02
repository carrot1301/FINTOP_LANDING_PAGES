import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
  Prisma,
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
    'SUPER_ADMIN', 'CEO', 'ASSISTANT_CEO',
    'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR',
    'SALE_ADMIN', 'SALE', 'EXPERT',
  ];

  private static readonly CLIENT_ROLE_CODES = ['CLIENT', 'CLIENT_VIP'];

  async getUsers(page = 1, limit = 20, search?: string, status?: string, userType?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (status && Object.values(RECORD_STATUS).includes(status as RECORD_STATUS)) {
      where.status = status as RECORD_STATUS;
    }

    // Filter by user type (staff vs client)
    if (userType === 'staff') {
      where.userRoles = {
        some: {
          role: { code: { in: AdminService.STAFF_ROLE_CODES as any } },
        },
      };
      where.email = { not: 'admin@fintop.vn' };
    } else if (userType === 'client') {
      // Client = has CLIENT/CLIENT_VIP role OR has no roles at all
      where.OR = where.OR
        ? [
            ...where.OR,
            {
              AND: [
                { userRoles: { none: { role: { code: { in: AdminService.STAFF_ROLE_CODES as any } } } } },
              ],
            },
          ]
        : undefined;

      if (!where.OR) {
        where.userRoles = {
          none: {
            role: { code: { in: AdminService.STAFF_ROLE_CODES as any } },
          },
        };
      } else {
        // When search + client filter are combined, wrap properly
        const searchConditions = where.OR;
        delete where.OR;
        where.AND = [
          { OR: searchConditions },
          {
            userRoles: {
              none: {
                role: { code: { in: AdminService.STAFF_ROLE_CODES as any } },
              },
            },
          },
        ];
      }
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
          tierLevel: true,
          status: true,
          createdAt: true,
          investmentDuration: true,
          investmentStyle: true,
          stockCompany: true,
          stockAccount: true,
          legacyTier: true,
          company: true,
          position: true,
          joinDate: true,
          sortOrder: true,
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
    if (dto.legacyTier !== undefined) data.legacyTier = dto.legacyTier;

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

    // Staff code (ID nhân sự) mapping to team or department
    if (dto.staffCode !== undefined) {
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
          category: { select: { name: true, slug: true } },
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
          user: { select: { fullName: true, email: true } },
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
      user: inv.user ? { fullName: inv.user.fullName, email: inv.user.email } : null,
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
