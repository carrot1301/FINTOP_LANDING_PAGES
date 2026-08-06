import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../../common/audit/audit.service';
import { ALERT_CONDITION, Prisma } from '@prisma/client';
import { NotificationQueue } from '../notification/notification.queue';
export declare class AlertService {
    private readonly prisma;
    private readonly redisService;
    private readonly auditService;
    private readonly notificationQueue;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService, auditService: AuditService, notificationQueue: NotificationQueue);
    createAlert(userId: number, stockId: number, condition: ALERT_CONDITION, targetValue: number): Promise<{
        status: import("@prisma/client").$Enums.ALERT_STATUS;
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        stockId: number;
        notes: string | null;
        condition: import("@prisma/client").$Enums.ALERT_CONDITION;
        targetValue: Prisma.Decimal;
        lastTriggeredAt: Date | null;
        cooldownMinutes: number;
    }>;
    evaluatePriceQuote(stockId: number, symbol: string, currentPrice: number): Promise<void>;
    private triggerAlert;
    getUserAlerts(userId: number): Promise<{
        targetValue: number;
        stock: {
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
        };
        status: import("@prisma/client").$Enums.ALERT_STATUS;
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        stockId: number;
        notes: string | null;
        condition: import("@prisma/client").$Enums.ALERT_CONDITION;
        lastTriggeredAt: Date | null;
        cooldownMinutes: number;
    }[]>;
    deleteAlert(userId: number, alertId: number): Promise<{
        success: boolean;
    }>;
}
