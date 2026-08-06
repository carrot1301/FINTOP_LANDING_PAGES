import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { NotificationGateway } from '../websocket/notification.gateway';
export declare class NotificationService {
    private readonly prisma;
    private readonly redisService;
    private readonly notificationGateway;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService, notificationGateway: NotificationGateway);
    createNotification(userId: number, title: string, content: string): Promise<{
        priority: import("@prisma/client").$Enums.NOTIFICATION_PRIORITY;
        status: import("@prisma/client").$Enums.NOTIFICATION_STATUS;
        id: bigint;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        title: string;
        content: string;
    }>;
    sendSessionUpdate(userId: number): Promise<void>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(notificationId: bigint): Promise<{
        priority: import("@prisma/client").$Enums.NOTIFICATION_PRIORITY;
        status: import("@prisma/client").$Enums.NOTIFICATION_STATUS;
        id: bigint;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        title: string;
        content: string;
    }>;
    getNotifications(userId: number, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            priority: import("@prisma/client").$Enums.NOTIFICATION_PRIORITY;
            status: import("@prisma/client").$Enums.NOTIFICATION_STATUS;
            createdAt: Date;
            userId: number;
            updatedAt: Date;
            title: string;
            content: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
