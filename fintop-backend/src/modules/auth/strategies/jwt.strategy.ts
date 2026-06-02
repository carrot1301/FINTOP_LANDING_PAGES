import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/database/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';
import { RECORD_STATUS } from '@prisma/client';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const cacheKey = `user:permissions:${payload.sub}`;
    const cachedData = await this.redisService.getClient().get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== RECORD_STATUS.ACTIVE || user.deletedAt) {
      throw new UnauthorizedException('User account is invalid or locked');
    }

    // Flatten roles and permissions for easy RBAC traversal
    const roles = user.userRoles.map((ur) => ur.role.code);
    const permissions = new Set<string>();
    
    for (const ur of user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissions.add(`${rp.permission.module}:${rp.permission.action}`);
      }
    }

    const userData = {
      id: user.id,
      email: user.email,
      tierLevel: user.tierLevel,
      roles,
      permissions: Array.from(permissions),
    };

    // Cache the validated data for 60 seconds
    await this.redisService.getClient().set(cacheKey, JSON.stringify(userData), 'EX', 60);

    return userData;
  }
}
