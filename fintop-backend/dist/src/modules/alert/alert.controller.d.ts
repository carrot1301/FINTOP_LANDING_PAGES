import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/alert.dto';
export declare class AlertController {
    private readonly alertService;
    constructor(alertService: AlertService);
    getAlerts(user: any): Promise<{
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
    createAlert(user: any, dto: CreateAlertDto): Promise<{
        status: import("@prisma/client").$Enums.ALERT_STATUS;
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        stockId: number;
        notes: string | null;
        condition: import("@prisma/client").$Enums.ALERT_CONDITION;
        targetValue: import("@prisma/client-runtime-utils").Decimal;
        lastTriggeredAt: Date | null;
        cooldownMinutes: number;
    }>;
    deleteAlert(user: any, id: string): Promise<{
        success: boolean;
    }>;
}
