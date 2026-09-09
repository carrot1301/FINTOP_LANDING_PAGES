import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class WatchlistService {
    private readonly prisma;
    private readonly redisService;
    private readonly auditService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService, auditService: AuditService);
    createWatchlist(userId: number, name: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        isDefault: boolean;
    }>;
    getUserWatchlists(userId: number): Promise<({
        items: ({
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
        } & {
            id: number;
            stockId: number;
            watchlistId: number;
            addedAt: Date;
        })[];
    } & {
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        isDefault: boolean;
    })[]>;
    addStockToWatchlist(userId: number, watchlistId: number, stockId?: number, symbol?: string): Promise<{
        id: number;
        stockId: number;
        watchlistId: number;
        addedAt: Date;
    }>;
    removeStockFromWatchlist(userId: number, watchlistId: number, symbol: string): Promise<{
        success: boolean;
    }>;
}
