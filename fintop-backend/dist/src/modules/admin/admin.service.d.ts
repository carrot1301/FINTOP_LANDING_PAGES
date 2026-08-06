import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../common/redis/redis.service';
import { RECORD_STATUS, Prisma } from '@prisma/client';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
export declare class AdminService {
    private readonly prisma;
    private readonly auditService;
    private readonly notificationService;
    private readonly redisService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: AuditService, notificationService: NotificationService, redisService: RedisService);
    private clearUserPermissionsCache;
    private static readonly ROLE_HIERARCHY_RANK;
    private static readonly CEO_EMAIL;
    private enforceRoleHierarchy;
    private syncClientRoleForTier;
    getOverview(): Promise<{
        users: {
            total: number;
            active: number;
        };
        signals: {
            total: number;
            published: number;
        };
        blogs: {
            total: number;
            published: number;
        };
        reports: {
            total: number;
        };
        notifications: {
            total: number;
        };
        invoices: {
            total: number;
            paid: number;
        };
        portfolios: {
            total: number;
        };
        auditLogs: {
            total: number;
        };
    }>;
    private static readonly STAFF_ROLE_CODES;
    private static readonly CLIENT_ROLE_CODES;
    getUsers(page?: number, limit?: number, search?: string, status?: string, userType?: string, tierLevel?: string): Promise<{
        data: {
            roles: {
                name: string;
                code: import("@prisma/client").$Enums.ROLE_CODE;
            }[];
            userRoles: undefined;
            activeSubscription: {
                plan: {
                    name: string;
                    description: string | null;
                    status: import("@prisma/client").$Enums.RECORD_STATUS;
                    id: number;
                    createdAt: Date;
                    tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    features: string | null;
                    price: Prisma.Decimal;
                    currency: string;
                    durationDays: number;
                };
            } & {
                status: import("@prisma/client").$Enums.SUBSCRIPTION_STATUS;
                id: bigint;
                createdAt: Date;
                userId: number;
                updatedAt: Date;
                deletedAt: Date | null;
                endDate: Date;
                planId: number;
                startDate: Date;
                isPermanent: boolean;
            };
            subscriptions: undefined;
            department: {
                name: string;
                id: number;
                code: string;
            } | null;
            team: {
                name: string;
                id: number;
                code: string;
            } | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            email: string;
            fullName: string;
            phone: string | null;
            dob: Date | null;
            address: string | null;
            investmentDuration: string | null;
            investmentStyle: string | null;
            stockCompany: string | null;
            stockAccount: string | null;
            referralId: string | null;
            referralName: string | null;
            avatarUrl: string | null;
            paymentProofUrl: string | null;
            legacyTier: string | null;
            tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            company: string | null;
            position: string | null;
            joinDate: Date | null;
            sortOrder: number | null;
            staffCode: string | null;
            broker: {
                department: {
                    code: string;
                } | null;
                team: {
                    code: string;
                } | null;
                id: number;
                fullName: string;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserDetail(userId: number): Promise<{
        roles: {
            code: import("@prisma/client").$Enums.ROLE_CODE;
            name: string;
            permissions: string[];
        }[];
        activeSubscription: {
            plan: {
                name: string;
                description: string | null;
                status: import("@prisma/client").$Enums.RECORD_STATUS;
                id: number;
                createdAt: Date;
                tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
                updatedAt: Date;
                deletedAt: Date | null;
                features: string | null;
                price: Prisma.Decimal;
                currency: string;
                durationDays: number;
            };
        } & {
            status: import("@prisma/client").$Enums.SUBSCRIPTION_STATUS;
            id: bigint;
            createdAt: Date;
            userId: number;
            updatedAt: Date;
            deletedAt: Date | null;
            endDate: Date;
            planId: number;
            startDate: Date;
            isPermanent: boolean;
        };
        recentSessions: {
            id: string;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            expiresAt: Date;
        }[];
        userRoles: undefined;
        subscriptions: undefined;
        sessions: undefined;
        department: {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
        } | null;
        team: {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            departmentId: number;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            leaderId: number | null;
        } | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string | null;
        dob: Date | null;
        address: string | null;
        investmentDuration: string | null;
        investmentStyle: string | null;
        stockCompany: string | null;
        stockAccount: string | null;
        referralId: string | null;
        referralName: string | null;
        avatarUrl: string | null;
        paymentProofUrl: string | null;
        emailVerifiedAt: Date | null;
        brokerId: number | null;
        departmentId: number | null;
        teamId: number | null;
        riskTaste: import("@prisma/client").$Enums.RISK_TASTE | null;
        legacyTier: string | null;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        company: string | null;
        position: string | null;
        joinDate: Date | null;
        sortOrder: number | null;
        staffCode: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    updateUserStatus(userId: number, newStatus: RECORD_STATUS, adminId: number): Promise<{
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        email: string;
    } | {
        message: string;
        userId: number;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
    }>;
    assignRole(userId: number, roleCode: string, adminId: number): Promise<{
        message: string;
        userId: number;
        roleCode: string;
    }>;
    removeRole(userId: number, roleCode: string, adminId: number): Promise<{
        message: string;
        userId: number;
        roleCode: string;
    }>;
    deleteUser(userId: number, adminId: number): Promise<{
        message: string;
        userId: number;
    }>;
    updateUser(userId: number, dto: any, adminId: number): Promise<{
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        email: string;
        fullName: string;
        phone: string | null;
        dob: Date | null;
        address: string | null;
        investmentDuration: string | null;
        investmentStyle: string | null;
        stockCompany: string | null;
        stockAccount: string | null;
        avatarUrl: string | null;
        brokerId: number | null;
        legacyTier: string | null;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        company: string | null;
        position: string | null;
        joinDate: Date | null;
        sortOrder: number | null;
        staffCode: string | null;
    }>;
    getRoles(): Promise<{
        id: number;
        name: string;
        code: import("@prisma/client").$Enums.ROLE_CODE;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        permissionCount: number;
        userCount: number;
    }[]>;
    getRolePermissions(roleId: number): Promise<{
        role: {
            id: number;
            name: string;
            code: import("@prisma/client").$Enums.ROLE_CODE;
        };
        permissions: {
            id: number;
            module: import("@prisma/client").$Enums.PERMISSION_MODULE;
            action: import("@prisma/client").$Enums.PERMISSION_ACTION;
            code: string;
            description: string | null;
        }[];
    }>;
    getAllPermissions(): Promise<{
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        action: import("@prisma/client").$Enums.PERMISSION_ACTION;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        module: import("@prisma/client").$Enums.PERMISSION_MODULE;
    }[]>;
    updateRolePermissions(roleId: number, permissionIds: number[], adminId: number): Promise<{
        message: string;
        roleId: number;
    }>;
    getSignals(page?: number, limit?: number, status?: string): Promise<{
        data: {
            id: number;
            symbol: string;
            companyName: string;
            direction: import("@prisma/client").$Enums.SIGNAL_DIRECTION;
            status: import("@prisma/client").$Enums.SIGNAL_STATUS;
            minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            entryPrice: number;
            cutLossPrice: number;
            targetPrice: number;
            notes: string | null;
            publishedAt: Date | null;
            closedAt: Date | null;
            author: {
                fullName: string;
                email: string;
            } | null;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getBlogs(page?: number, limit?: number, status?: string, search?: string, categoryId?: number): Promise<{
        data: {
            id: number;
            title: string;
            slug: string;
            content: string;
            excerpt: string | null;
            status: import("@prisma/client").$Enums.BLOG_STATUS;
            visibility: import("@prisma/client").$Enums.CONTENT_VISIBILITY;
            minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            publishedAt: Date | null;
            createdAt: Date;
            author: {
                fullName: string;
                email: string;
            } | null;
            category: {
                name: string;
                id: number;
                slug: string;
            };
            categoryId: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getReports(page?: number, limit?: number): Promise<{
        data: {
            id: number;
            title: string;
            reportType: import("@prisma/client").$Enums.REPORT_TYPE;
            status: import("@prisma/client").$Enums.BLOG_STATUS;
            minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            fileUrl: string;
            fileSize: number;
            publishedAt: Date | null;
            createdAt: Date;
            uploader: {
                fullName: string;
                email: string;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getNotifications(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            title: string;
            content: string;
            priority: import("@prisma/client").$Enums.NOTIFICATION_PRIORITY;
            status: import("@prisma/client").$Enums.NOTIFICATION_STATUS;
            createdAt: Date;
            user: {
                fullName: string;
                email: string;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    broadcastNotification(title: string, content: string, userIds: number[], adminId: number): Promise<{
        sent: number;
        results: {
            userId: number;
            status: string;
            id?: string;
            error?: string;
        }[];
    }>;
    getAuditLogs(page?: number, limit?: number, action?: string, userId?: number): Promise<{
        data: {
            id: string;
            action: string;
            source: import("@prisma/client").$Enums.AUDIT_SOURCE;
            tableName: string;
            recordId: string;
            ipAddress: string | null;
            createdAt: Date;
            user: {
                fullName: string;
                email: string;
            } | null;
            oldValues: Prisma.JsonValue;
            newValues: Prisma.JsonValue;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSubscriptionPlans(): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: Prisma.Decimal;
        currency: string;
        durationDays: number;
    }[]>;
    createPlan(dto: CreatePlanDto, adminId: number): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: Prisma.Decimal;
        currency: string;
        durationDays: number;
    }>;
    updatePlan(id: number, dto: UpdatePlanDto, adminId: number): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: Prisma.Decimal;
        currency: string;
        durationDays: number;
    }>;
    deletePlan(id: number, adminId: number): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: Prisma.Decimal;
        currency: string;
        durationDays: number;
    }>;
    getInvoices(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            amount: number;
            currency: string;
            status: import("@prisma/client").$Enums.INVOICE_STATUS;
            dueDate: Date;
            createdAt: Date;
            user: {
                fullName: string;
                email: string;
                phone: string | null;
                stockAccount: string | null;
                stockCompany: string | null;
                paymentProofUrl: string | null;
            } | null;
            plan: {
                id: number;
                name: string;
                tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
                price: number;
            } | null;
            subscription: {
                id: string;
                status: import("@prisma/client").$Enums.SUBSCRIPTION_STATUS;
                startDate: Date;
                endDate: Date;
                isPermanent: boolean;
                plan: {
                    name: string;
                    tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
                } | null;
            } | null;
            transactions: {
                id: string;
                provider: import("@prisma/client").$Enums.BILLING_PROVIDER;
                status: import("@prisma/client").$Enums.PAYMENT_STATUS;
                amount: number;
                createdAt: Date;
            }[];
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveInvoice(invoiceId: bigint, isPermanent: boolean, endDateStr?: string, adminId?: number): Promise<{
        success: boolean;
    }>;
    getMarketSyncLogs(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            source: string;
            syncType: string;
            status: import("@prisma/client").$Enums.MARKET_SYNC_STATUS;
            recordsUpserted: number;
            recordsFailed: number;
            errorMessage: string | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStocks(page?: number, limit?: number): Promise<{
        data: ({
            industry: {
                name: string;
                code: string;
            } | null;
            exchange: {
                name: string;
                code: import("@prisma/client").$Enums.EXCHANGE_CODE;
            };
        } & {
            symbol: string;
            description: string | null;
            status: import("@prisma/client").$Enums.STOCK_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isin: string | null;
            companyName: string;
            exchangeId: number;
            industryId: number | null;
            order: number;
            analyst: string | null;
            identify_trend: string | null;
            act: string | null;
            rsi_mfi: string | null;
            delta_rsi: string | null;
            trading_price_range: string | null;
            resistance_range: string | null;
            support_range: string | null;
            top_status: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPortfolios(): Promise<{
        id: number;
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.PORTFOLIO_STATUS;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        initialCapital: number;
        currentNav: number;
        cashBalance: number;
        holdingCount: number;
        manager: {
            fullName: string;
            email: string;
        } | null;
        createdAt: Date;
    }[]>;
    getHandbooks(category?: string, search?: string): Promise<{
        category: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        driveLink: string | null;
        linkType: string;
    }[]>;
    createHandbook(dto: {
        title: string;
        driveLink?: string;
        category: string;
        description?: string;
        linkType?: string;
        order?: number;
    }, adminId: number): Promise<{
        category: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        driveLink: string | null;
        linkType: string;
    }>;
    updateHandbook(id: number, dto: {
        title?: string;
        driveLink?: string;
        category?: string;
        description?: string;
        linkType?: string;
        order?: number;
        status?: RECORD_STATUS;
    }, adminId: number): Promise<{
        category: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        driveLink: string | null;
        linkType: string;
    }>;
    deleteHandbook(id: number, adminId: number): Promise<{
        message: string;
        id: number;
    }>;
}
