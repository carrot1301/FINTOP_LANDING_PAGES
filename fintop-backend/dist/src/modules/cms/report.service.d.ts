import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class ReportService {
    private readonly prisma;
    private readonly auditService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: AuditService);
    listReports(userFeatures?: string[], page?: number, limit?: number): Promise<{
        data: {
            id: number;
            title: string;
            reportType: import("@prisma/client").$Enums.REPORT_TYPE;
            fileSize: number;
            minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            publishedAt: Date | null;
            locked: boolean;
            fileUrl: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    downloadReport(reportId: number, userId: number, userFeatures: string[]): Promise<{
        fileUrl: string;
    }>;
    private isTierAllowed;
}
