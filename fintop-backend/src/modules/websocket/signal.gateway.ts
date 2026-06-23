import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from './socket-auth.guard';
import { SUBSCRIPTION_TIER } from '@prisma/client';
import { AuditService } from '../../common/audit/audit.service';
import { AUDIT_SOURCE } from '@prisma/client';
import { isFeatureAllowed } from '../../common/utils/subscription-helper';

const tierHierarchy = {
  STANDARD: 1,
  SILVER: 2,
  GOLD: 3,
  DIAMOND: 4,
};

@WebSocketGateway({ namespace: '/ws/signals', cors: true })
export class SignalGateway {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(SignalGateway.name);

  constructor(private readonly auditService: AuditService) {}

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('subscribe_signals')
  async handleSubscribeSignals(@ConnectedSocket() client: any, @MessageBody() minTier: SUBSCRIPTION_TIER) {
    const user = client.user;

    if (!isFeatureAllowed(user.planFeatures, minTier)) {
      this.logger.warn(`User ${user.id} attempted to subscribe to tier ${minTier} signals without permission.`);
      client.emit('error', { message: 'Insufficient subscription tier' });
      return;
    }

    client.join(`signals:tier:${minTier}`);
    this.logger.debug(`User ${user.id} subscribed to signals:tier:${minTier}`);
  }

  // Internal method called by SignalService
  async broadcastSignal(minTierAccess: SUBSCRIPTION_TIER, payload: any) {
    this.server.to(`signals:tier:${minTierAccess}`).emit('signal_update', payload);
    
    await this.auditService.log({
      source: AUDIT_SOURCE.SYSTEM,
      action: 'REALTIME_SIGNAL_BROADCAST',
      tableName: 'vip_signals',
      recordId: payload.id ? payload.id.toString() : 'UNKNOWN',
    });
  }
}
