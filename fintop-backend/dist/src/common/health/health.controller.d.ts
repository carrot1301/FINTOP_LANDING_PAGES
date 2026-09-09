import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
interface ServiceHealth {
    status: 'up' | 'down';
    latencyMs?: number;
    provider: string;
}
export declare class HealthController {
    private readonly prismaService;
    private readonly redisService;
    private readonly mailService;
    private readonly startTime;
    constructor(prismaService: PrismaService, redisService: RedisService, mailService: MailService);
    check(): Promise<{
        status: string;
        uptime: number;
        timestamp: string;
        services: {
            database: ServiceHealth;
            cache: ServiceHealth;
        };
        smtp: {
            status: "up" | "down";
            configured: boolean;
            provider: "resend" | "brevo" | "smtp" | "none";
            host: string;
            user: string;
            frontendUrl: string;
        };
    }>;
    readiness(): Promise<{
        ready: boolean;
        timestamp: string;
        checks: {
            database: ServiceHealth;
            cache: ServiceHealth;
        };
    }>;
    liveness(): Promise<{
        alive: boolean;
        uptime: number;
        memoryUsage: {
            rss: number;
            heapUsed: number;
            heapTotal: number;
        };
        timestamp: string;
    }>;
    private checkDatabase;
    private checkRedis;
}
export {};
