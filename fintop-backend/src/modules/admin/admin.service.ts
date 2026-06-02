import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import {
  RECORD_STATUS,
  AUDIT_SOURCE,
  SIGNAL_STATUS,
  BLOG_STATUS,
  Prisma,
} from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

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

  async getUsers(page = 1, limit = 20, search?: string, status?: string) {
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

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          tierLevel: true,
          status: true,
          createdAt: true,
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

    return { message: 'Role removed', userId, roleCode };
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

  async getBlogs(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.BlogWhereInput = { deletedAt: null };

    if (status && Object.values(BLOG_STATUS).includes(status as BLOG_STATUS)) {
      where.status = status as BLOG_STATUS;
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
        orderBy: { symbol: 'asc' },
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
}
