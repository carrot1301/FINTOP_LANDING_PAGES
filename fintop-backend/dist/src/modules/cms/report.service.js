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
var ReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const client_1 = require("@prisma/client");
const subscription_helper_1 = require("../../common/utils/subscription-helper");
let ReportService = ReportService_1 = class ReportService {
    prisma;
    auditService;
    logger = new common_1.Logger(ReportService_1.name);
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async listReports(userFeatures, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const total = await this.prisma.reportFile.count({
            where: { status: client_1.BLOG_STATUS.PUBLISHED }
        });
        const reports = await this.prisma.reportFile.findMany({
            where: { status: client_1.BLOG_STATUS.PUBLISHED },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: limit,
        });
        const mapped = reports.map(r => {
            const locked = !this.isTierAllowed(userFeatures, r.minTierAccess);
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
    async downloadReport(reportId, userId, userFeatures) {
        const report = await this.prisma.reportFile.findUnique({
            where: { id: reportId }
        });
        if (!report || report.status !== client_1.BLOG_STATUS.PUBLISHED) {
            throw new common_1.NotFoundException('Report not found');
        }
        const allowed = this.isTierAllowed(userFeatures, report.minTierAccess);
        if (!allowed) {
            throw new common_1.ForbiddenException(`Access to this report requires a ${report.minTierAccess} subscription or higher.`);
        }
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.USER,
            action: 'REPORT_DOWNLOADED',
            tableName: 'report_files',
            recordId: reportId.toString(),
        });
        return {
            fileUrl: report.fileUrl,
        };
    }
    isTierAllowed(userFeatures, minTier) {
        return (0, subscription_helper_1.isFeatureAllowed)(userFeatures, minTier || 'STANDARD');
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = ReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ReportService);
//# sourceMappingURL=report.service.js.map