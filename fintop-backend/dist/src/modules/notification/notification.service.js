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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const client_1 = require("@prisma/client");
const notification_gateway_1 = require("../websocket/notification.gateway");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    redisService;
    notificationGateway;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma, redisService, notificationGateway) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.notificationGateway = notificationGateway;
    }
    async createNotification(userId, title, content) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                title,
                content,
                priority: client_1.NOTIFICATION_PRIORITY.NORMAL,
                status: client_1.NOTIFICATION_STATUS.UNREAD,
            }
        });
        await this.prisma.notificationDeliveryLog.create({
            data: {
                notificationId: notification.id,
                channel: client_1.NOTIFICATION_CHANNEL.SYSTEM,
                isSuccess: true,
            }
        });
        await this.redisService.getClient().del(`notifications:feed:${userId}`);
        try {
            this.notificationGateway.broadcastToUser(userId, {
                id: notification.id.toString(),
                title: notification.title,
                content: notification.content,
                priority: notification.priority,
                status: notification.status,
                createdAt: notification.createdAt,
            });
        }
        catch (err) {
            this.logger.warn(`Could not emit realtime notification: ${err.message}`);
        }
        return notification;
    }
    async sendSessionUpdate(userId) {
        try {
            this.notificationGateway.server.to(`user:${userId}:notifications`).emit('session_updated', { userId });
            this.logger.log(`Emitted session_updated for user #${userId}`);
        }
        catch (err) {
            this.logger.warn(`Could not emit session update via websocket: ${err.message}`);
        }
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, status: client_1.NOTIFICATION_STATUS.UNREAD }
        });
    }
    async markAsRead(notificationId) {
        const updated = await this.prisma.notification.update({
            where: { id: notificationId },
            data: { status: client_1.NOTIFICATION_STATUS.READ }
        });
        await this.redisService.getClient().del(`notifications:feed:${updated.userId}`);
        return updated;
    }
    async getNotifications(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const total = await this.prisma.notification.count({
            where: { userId }
        });
        const notifications = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        const mapped = notifications.map(n => ({
            ...n,
            id: n.id.toString(),
        }));
        return {
            data: mapped,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_gateway_1.NotificationGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map