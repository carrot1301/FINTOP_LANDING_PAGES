import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { BLOG_STATUS, SUBSCRIPTION_TIER, AUDIT_SOURCE } from '@prisma/client';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listReports(userTier?: SUBSCRIPTION_TIER, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.reportFile.count({
      where: { status: BLOG_STATUS.PUBLISHED }
    });

    const reports = await this.prisma.reportFile.findMany({
      where: { status: BLOG_STATUS.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    const mapped = reports.map(r => {
      const locked = !this.isTierAllowed(userTier, r.minTierAccess);
      return {
        id: r.id,
        title: r.title,
        reportType: r.reportType,
        fileSize: r.fileSize,
        minTierAccess: r.minTierAccess,
        publishedAt: r.publishedAt,
        locked,
        fileUrl: locked ? null : r.fileUrl,
      };
    });

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

  async downloadReport(reportId: number, userId: number, userTier: SUBSCRIPTION_TIER) {
    const report = await this.prisma.reportFile.findUnique({
      where: { id: reportId }
    });

    if (!report || report.status !== BLOG_STATUS.PUBLISHED) {
      throw new NotFoundException('Report not found');
    }

    const allowed = this.isTierAllowed(userTier, report.minTierAccess);
    if (!allowed) {
      throw new ForbiddenException(`Access to this report requires a ${report.minTierAccess} subscription or higher.`);
    }

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.USER,
      action: 'REPORT_DOWNLOADED',
      tableName: 'report_files',
      recordId: reportId.toString(),
    });

    return {
      fileUrl: report.fileUrl,
    };
  }

  private isTierAllowed(userTier?: SUBSCRIPTION_TIER, minTier?: SUBSCRIPTION_TIER): boolean {
    if (!userTier) return false;
    const tierHierarchy = {
      STANDARD: 1,
      SILVER: 2,
      GOLD: 3,
      DIAMOND: 4,
    };
    return (tierHierarchy[userTier] || 0) >= (tierHierarchy[minTier || 'STANDARD'] || 0);
  }
}
