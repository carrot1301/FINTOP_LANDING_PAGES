import { Server } from 'socket.io';
import { SUBSCRIPTION_TIER } from '@prisma/client';
import { AuditService } from '../../common/audit/audit.service';
export declare class SignalGateway {
    private readonly auditService;
    server: Server;
    private readonly logger;
    constructor(auditService: AuditService);
    handleSubscribeSignals(client: any, minTier: SUBSCRIPTION_TIER): Promise<void>;
    broadcastSignal(minTierAccess: SUBSCRIPTION_TIER, payload: any): Promise<void>;
}
