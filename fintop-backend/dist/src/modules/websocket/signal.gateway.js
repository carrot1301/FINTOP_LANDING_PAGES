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
var SignalGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const socket_auth_guard_1 = require("./socket-auth.guard");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../../common/audit/audit.service");
const client_2 = require("@prisma/client");
const subscription_helper_1 = require("../../common/utils/subscription-helper");
const tierHierarchy = {
    STANDARD: 1,
    SILVER: 2,
    GOLD: 3,
    DIAMOND: 4,
};
let SignalGateway = SignalGateway_1 = class SignalGateway {
    auditService;
    server;
    logger = new common_1.Logger(SignalGateway_1.name);
    constructor(auditService) {
        this.auditService = auditService;
    }
    async handleSubscribeSignals(client, minTier) {
        const user = client.user;
        if (!(0, subscription_helper_1.isFeatureAllowed)(user.planFeatures, minTier)) {
            this.logger.warn(`User ${user.id} attempted to subscribe to tier ${minTier} signals without permission.`);
            client.emit('error', { message: 'Insufficient subscription tier' });
            return;
        }
        client.join(`signals:tier:${minTier}`);
        this.logger.debug(`User ${user.id} subscribed to signals:tier:${minTier}`);
    }
    async broadcastSignal(minTierAccess, payload) {
        this.server.to(`signals:tier:${minTierAccess}`).emit('signal_update', payload);
        await this.auditService.log({
            source: client_2.AUDIT_SOURCE.SYSTEM,
            action: 'REALTIME_SIGNAL_BROADCAST',
            tableName: 'vip_signals',
            recordId: payload.id ? payload.id.toString() : 'UNKNOWN',
        });
    }
};
exports.SignalGateway = SignalGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SignalGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('subscribe_signals'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SignalGateway.prototype, "handleSubscribeSignals", null);
exports.SignalGateway = SignalGateway = SignalGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/ws/signals', cors: true }),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], SignalGateway);
//# sourceMappingURL=signal.gateway.js.map