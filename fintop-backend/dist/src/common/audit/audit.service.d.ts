import { PrismaService } from '../database/prisma.service';
import { Prisma, AUDIT_SOURCE } from '@prisma/client';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(data: {
        userId?: number | null;
        source: AUDIT_SOURCE;
        action: string;
        tableName: string;
        recordId?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        id: bigint;
        source: import("@prisma/client").$Enums.AUDIT_SOURCE;
        action: string;
        tableName: string;
        recordId: string;
        oldValues: Prisma.JsonValue | null;
        newValues: Prisma.JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        userId: number | null;
    }>;
}
