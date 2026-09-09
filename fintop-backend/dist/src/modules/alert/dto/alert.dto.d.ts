import { ALERT_CONDITION } from '@prisma/client';
export declare class CreateAlertDto {
    stockId: number;
    condition: ALERT_CONDITION;
    targetValue: number;
}
