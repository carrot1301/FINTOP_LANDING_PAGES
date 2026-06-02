import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from './socket-auth.guard';
import { NotificationService } from '../notification/notification.service';

@WebSocketGateway({ namespace: '/ws/notifications', cors: true })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(NotificationGateway.name);
  private activeConnections = new Map<number, string[]>(); // userId -> socketIds

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Notification client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    if (client.user) {
      const userId = client.user.id;
      let sockets = this.activeConnections.get(userId) || [];
      sockets = sockets.filter(id => id !== client.id);
      if (sockets.length > 0) {
        this.activeConnections.set(userId, sockets);
      } else {
        this.activeConnections.delete(userId);
      }
    }
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('subscribe_notifications')
  async handleSubscribeNotifications(@ConnectedSocket() client: any) {
    const user = client.user;
    client.join(`user:${user.id}:notifications`);
    
    let sockets = this.activeConnections.get(user.id) || [];
    sockets.push(client.id);
    this.activeConnections.set(user.id, sockets);

    // Push initial unread count
    const unreadCount = await this.notificationService.getUnreadCount(user.id);
    client.emit('unread_count', { count: unreadCount });
  }

  // Called from NotificationQueue or Service when a new notification is created
  broadcastToUser(userId: number, payload: any) {
    this.server.to(`user:${userId}:notifications`).emit('new_notification', payload);
  }
}
