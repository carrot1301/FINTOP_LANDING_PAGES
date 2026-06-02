import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

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

      // Verify user exists and get tier level
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new WsException('Invalid user');
      }

      // Attach user to socket
      client.user = user;
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
