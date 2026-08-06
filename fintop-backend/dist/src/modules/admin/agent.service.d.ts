import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../common/audit/audit.service';
export declare class AgentService {
    private readonly configService;
    private readonly auditService;
    private readonly logger;
    private readonly agentUrl;
    private readonly agentSecret;
    constructor(configService: ConfigService, auditService: AuditService);
    private callAgent;
    runDiagnostics(adminId: number): Promise<any>;
    resumeTask(taskId: string, adminId: number): Promise<any>;
    getTasks(): Promise<any>;
    getReport(taskId: string): Promise<any>;
}
