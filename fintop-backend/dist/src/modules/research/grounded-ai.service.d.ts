import { ConfigService } from '@nestjs/config';
export declare class GroundedAiService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    generate(data: any, language?: string): Promise<string>;
    private generateLocalFallback;
}
