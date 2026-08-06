import { ReportService } from './report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    getReports(page?: string, limit?: string, user?: any): Promise<{
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
    downloadReport(id: string, user: any): Promise<{
        fileUrl: string;
    }>;
}
