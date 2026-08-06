import { SignalService } from './signal.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateSignalDto, UpdateSignalStatusDto } from './dto/signal.dto';
export declare class SignalController {
    private readonly signalService;
    constructor(signalService: SignalService);
    getSignals(user: any, pagination: PaginationDto): Promise<{
        data: {
            id: number;
            stockId: number;
            symbol: string;
            companyName: string;
            direction: import("@prisma/client").$Enums.SIGNAL_DIRECTION;
            status: import("@prisma/client").$Enums.SIGNAL_STATUS;
            minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            entryPrice: number | null;
            cutLossPrice: number | null;
            targetPrice: number | null;
            notes: string | null;
            publishedAt: Date | null;
            locked: boolean;
            author: {
                fullName: string;
                avatarUrl: string | null;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createSignal(user: any, dto: CreateSignalDto): Promise<{
        status: import("@prisma/client").$Enums.SIGNAL_STATUS;
        id: number;
        source: import("@prisma/client").$Enums.SIGNAL_SOURCE;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        stockId: number;
        direction: import("@prisma/client").$Enums.SIGNAL_DIRECTION;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        entryPrice: import("@prisma/client-runtime-utils").Decimal;
        cutLossPrice: import("@prisma/client-runtime-utils").Decimal;
        targetPrice: import("@prisma/client-runtime-utils").Decimal;
        notes: string | null;
        publishedAt: Date | null;
        closedAt: Date | null;
        authorId: number | null;
    }>;
    updateStatus(id: string, dto: UpdateSignalStatusDto): Promise<{
        status: import("@prisma/client").$Enums.SIGNAL_STATUS;
        id: number;
        source: import("@prisma/client").$Enums.SIGNAL_SOURCE;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        stockId: number;
        direction: import("@prisma/client").$Enums.SIGNAL_DIRECTION;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        entryPrice: import("@prisma/client-runtime-utils").Decimal;
        cutLossPrice: import("@prisma/client-runtime-utils").Decimal;
        targetPrice: import("@prisma/client-runtime-utils").Decimal;
        notes: string | null;
        publishedAt: Date | null;
        closedAt: Date | null;
        authorId: number | null;
    }>;
}
