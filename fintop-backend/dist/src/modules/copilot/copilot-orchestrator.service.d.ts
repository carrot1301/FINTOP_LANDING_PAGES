import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';
import { ToolRegistryService } from './tool-registry.service';
export interface CopilotResponse {
    reply: string;
    toolsUsed: {
        name: string;
        args: Record<string, any>;
        success: boolean;
    }[];
    sessionId: string;
}
export declare class CopilotOrchestratorService {
    private readonly configService;
    private readonly redisService;
    private readonly toolRegistry;
    private readonly logger;
    private readonly apiKey;
    constructor(configService: ConfigService, redisService: RedisService, toolRegistry: ToolRegistryService);
    orchestrate(message: string, sessionId: string, userId: number): Promise<CopilotResponse>;
    private callGemini;
    private formatContentsForGemini;
    private sessionKey;
    private loadHistory;
    private saveHistory;
    clearSession(sessionId: string): Promise<void>;
}
