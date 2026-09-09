"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const socket_auth_guard_1 = require("./socket-auth.guard");
const notification_service_1 = require("../notification/notification.service");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    notificationService;
    server;
    logger = new common_1.Logger(NotificationGateway_1.name);
    activeConnections = new Map();
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    handleConnection(client) {
        this.logger.debug(`Notification client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        if (client.user) {
            const userId = client.user.id;
            let sockets = this.activeConnections.get(userId) || [];
            sockets = sockets.filter(id => id !== client.id);
            if (sockets.length > 0) {
                this.activeConnections.set(userId, sockets);
            }
            else {
                this.activeConnections.delete(userId);
            }
        }
    }
    async handleSubscribeNotifications(client) {
        const user = client.user;
        client.join(`user:${user.id}:notifications`);
        let sockets = this.activeConnections.get(user.id) || [];
        sockets.push(client.id);
        this.activeConnections.set(user.id, sockets);
        const unreadCount = await this.notificationService.getUnreadCount(user.id);
        client.emit('unread_count', { count: unreadCount });
    }
    broadcastToUser(userId, payload) {
        this.server.to(`user:${userId}:notifications`).emit('new_notification', payload);
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('subscribe_notifications'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleSubscribeNotifications", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/ws/notifications', cors: true }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map