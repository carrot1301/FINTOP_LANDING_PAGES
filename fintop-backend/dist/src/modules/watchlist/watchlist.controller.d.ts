import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto, AddStockDto } from './dto/watchlist.dto';
export declare class WatchlistController {
    private readonly watchlistService;
    constructor(watchlistService: WatchlistService);
    getUserWatchlists(user: any): Promise<({
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
    createWatchlist(user: any, dto: CreateWatchlistDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        isDefault: boolean;
    }>;
    addItem(user: any, watchlistId: string, dto: AddStockDto): Promise<{
        id: number;
        stockId: number;
        watchlistId: number;
        addedAt: Date;
    }>;
    removeItem(user: any, watchlistId: string, symbol: string): Promise<{
        success: boolean;
    }>;
}
