import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class SocketAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(jwtService: JwtService, prisma: PrismaService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
