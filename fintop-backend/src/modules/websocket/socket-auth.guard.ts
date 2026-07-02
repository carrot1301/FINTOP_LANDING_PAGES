import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { getFeaturesByTier } from '../../common/utils/subscription-helper';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(SocketAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    try {
      const token = this.extractTokenFromHeader(client);
      if (!token) throw new WsException('Missing authentication token');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      // Verify user exists and get tier level and features
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
          subscriptions: {
            where: {
              status: 'ACTIVE',
              endDate: { gt: new Date() },
            },
            include: {
              plan: true,
            },
            orderBy: {
              endDate: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new WsException('Invalid user');
      }

      const TIER_HIERARCHY_VALUES = {
        STANDARD: 1,
        SILVER: 2,
        GOLD: 3,
        DIAMOND: 4,
      };

      const ROLE_TIER_MAPPING = {
        SUPER_ADMIN: 'DIAMOND',
        CEO: 'DIAMOND',
        ASSISTANT_CEO: 'DIAMOND',
        ADMIN: 'DIAMOND',
        EDITOR_ADMIN: 'DIAMOND',
        SALE_ADMIN: 'DIAMOND',
        EXPERT: 'GOLD',
        EDITOR_PRO: 'GOLD',
        EDITOR: 'SILVER',
        SALE: 'SILVER',
        CLIENT_VIP: 'GOLD',
      };

      const roles = user.userRoles.map((ur) => ur.role.code);
      let maxUserTier = user.tierLevel;
      let maxUserLevel = TIER_HIERARCHY_VALUES[maxUserTier] || 1;

      for (const role of roles) {
        const mappedTier = ROLE_TIER_MAPPING[role];
        if (mappedTier) {
          const mappedLevel = TIER_HIERARCHY_VALUES[mappedTier] || 1;
          if (mappedLevel > maxUserLevel) {
            maxUserLevel = mappedLevel;
            maxUserTier = mappedTier as any;
          }
        }
      }

      const planFeatures = getFeaturesByTier(maxUserTier);

      // Attach user to socket with planFeatures
      client.user = {
        ...user,
        planFeatures,
      };
      return true;
    } catch (error) {
      this.logger.error(`Socket auth failed: ${error.message}`);
      client.disconnect();
      return false;
    }
  }

  private extractTokenFromHeader(client: any): string | undefined {
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    if (client.handshake?.auth?.token) {
      return client.handshake.auth.token as string;
    }
    if (client.handshake?.query?.token) {
      return client.handshake.query.token as string;
    }
    return undefined;
  }
}
