import { AdminService } from './admin.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    getUsers(page?: string, limit?: string, search?: string, status?: string, userType?: string, tierLevel?: string): Promise<{
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
                    price: import("@prisma/client-runtime-utils").Decimal;
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
    getUserDetail(id: string): Promise<{
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
                price: import("@prisma/client-runtime-utils").Decimal;
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
    updateUserStatus(id: string, status: string, admin: any): Promise<{
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        email: string;
    } | {
        message: string;
        userId: number;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
    }>;
    assignRole(id: string, roleCode: string, admin: any): Promise<{
        message: string;
        userId: number;
        roleCode: string;
    }>;
    removeRole(id: string, roleCode: string, admin: any): Promise<{
        message: string;
        userId: number;
        roleCode: string;
    }>;
    deleteUser(id: string, admin: any): Promise<{
        message: string;
        userId: number;
    }>;
    updateUser(id: string, dto: any, admin: any): Promise<{
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
    getRolePermissions(id: string): Promise<{
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
    updateRolePermissions(id: string, permissionIds: number[], admin: any): Promise<{
        message: string;
        roleId: number;
    }>;
    getSignals(page?: string, limit?: string, status?: string): Promise<{
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
    getBlogs(page?: string, limit?: string, status?: string, search?: string, categoryId?: string): Promise<{
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
    getReports(page?: string, limit?: string): Promise<{
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
    getNotifications(page?: string, limit?: string): Promise<{
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
    broadcastNotification(title: string, content: string, userIds: number[], admin: any): Promise<{
        sent: number;
        results: {
            userId: number;
            status: string;
            id?: string;
            error?: string;
        }[];
    }>;
    getAuditLogs(page?: string, limit?: string, action?: string, userId?: string): Promise<{
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
            oldValues: import("@prisma/client/runtime/client").JsonValue;
            newValues: import("@prisma/client/runtime/client").JsonValue;
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
        price: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        durationDays: number;
    }[]>;
    createPlan(dto: CreatePlanDto, admin: any): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        durationDays: number;
    }>;
    updatePlan(id: string, dto: UpdatePlanDto, admin: any): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        durationDays: number;
    }>;
    deletePlan(id: string, admin: any): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        durationDays: number;
    }>;
    getInvoices(page?: string, limit?: string): Promise<{
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
    approveInvoice(id: string, admin: any, isPermanent?: boolean, endDate?: string): Promise<{
        success: boolean;
    }>;
    getMarketSyncLogs(page?: string, limit?: string): Promise<{
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
    getStocks(page?: string, limit?: string): Promise<{
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
        driveLink: string;
        category: string;
    }, admin: any): Promise<{
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
    updateHandbook(id: string, dto: {
        title?: string;
        driveLink?: string;
        category?: string;
    }, admin: any): Promise<{
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
    deleteHandbook(id: string, admin: any): Promise<{
        message: string;
        id: number;
    }>;
}
