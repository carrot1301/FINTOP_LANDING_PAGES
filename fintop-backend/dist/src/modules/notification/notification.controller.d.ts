import { NotificationService } from './notification.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(user: any, pagination: PaginationDto): Promise<{
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
    markAsRead(user: any, id: string): Promise<{
        message: string;
        notificationId: string;
        status: import("@prisma/client").$Enums.NOTIFICATION_STATUS;
    }>;
}
