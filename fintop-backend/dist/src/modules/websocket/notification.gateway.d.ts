import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from '../notification/notification.service';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly notificationService;
    server: Server;
    private readonly logger;
    private activeConnections;
    constructor(notificationService: NotificationService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: any): void;
    handleSubscribeNotifications(client: any): Promise<void>;
    broadcastToUser(userId: number, payload: any): void;
}
