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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchController = void 0;
const common_1 = require("@nestjs/common");
const research_data_aggregator_service_1 = require("./research-data-aggregator.service");
const grounded_ai_service_1 = require("./grounded-ai.service");
const research_export_service_1 = require("./research-export.service");
const prisma_service_1 = require("../../common/database/prisma.service");
const swagger_1 = require("@nestjs/swagger");
let ResearchController = class ResearchController {
    aggregator;
    ai;
    exportService;
    prisma;
    constructor(aggregator, ai, exportService, prisma) {
        this.aggregator = aggregator;
        this.ai = ai;
        this.exportService = exportService;
        this.prisma = prisma;
    }
    async generateReport(dto) {
        const reportType = dto.report_type;
        const subject = dto.subject;
        const language = dto.language || 'vi';
        const format = dto.format || 'markdown';
        if (!reportType || !subject) {
            throw new common_1.HttpException('Missing report_type or subject', common_1.HttpStatus.BAD_REQUEST);
        }
        const validTypes = ['company', 'sector', 'weekly_market', 'portfolio', 'market_brief'];
        if (!validTypes.includes(reportType)) {
            throw new common_1.HttpException('Invalid report_type', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const data = await this.aggregator.aggregate(reportType, subject, dto.date_range);
            const content = await this.ai.generate(data, language);
            let title = '';
            if (reportType === 'company') {
                title = language === 'vi'
                    ? `Nghiên cứu & Phân tích Doanh nghiệp ${subject.toUpperCase()}`
                    : `Company Research Report ${subject.toUpperCase()}`;
            }
            else if (reportType === 'sector') {
                title = language === 'vi'
                    ? `Nghiên cứu & Phân tích Ngành ${subject}`
                    : `Sector Research Report ${subject}`;
            }
            else if (reportType === 'weekly_market') {
                title = language === 'vi'
                    ? `Nghiên cứu & Phân tích Thị trường Tuần`
                    : `Weekly Market Research Report`;
            }
            else if (reportType === 'portfolio') {
                title = language === 'vi'
                    ? `Nghiên cứu & Phân tích Danh mục`
                    : `Portfolio Research Report`;
            }
            else if (reportType === 'market_brief') {
                title = language === 'vi'
                    ? `Tóm tắt Thông tin Thị trường`
                    : `Market Intelligence Brief`;
            }
            const report = await this.prisma.researchReport.create({
                data: {
                    reportType,
                    subject,
                    language,
                    format,
                    title,
                    content,
                    metadata: data,
                }
            });
            return report;
        }
        catch (err) {
            throw new common_1.HttpException(`Failed to generate report: ${err.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTemplates() {
        return [
            {
                type: 'company',
                name_vi: 'Nghiên cứu & Phân tích Doanh nghiệp',
                name_en: 'Company Research',
                sections: [
                    'Executive Summary', 'Business Overview', 'Financial Snapshot',
                    'Valuation Snapshot', 'Stock Performance', 'Quantitative Risk Metrics',
                    'Market Context', 'Sector Context', 'Key Strengths', 'Key Risks',
                    'Data Limitations', 'Conclusion'
                ]
            },
            {
                type: 'sector',
                name_vi: 'Nghiên cứu & Phân tích Ngành',
                name_en: 'Sector Research',
                sections: [
                    'Executive Summary', 'Sector Performance', 'Sector Rotation Ranking',
                    'Money Flow Analysis', 'Foreign Flow Analysis', 'Valuation Comparison',
                    'Key Drivers', 'Key Risks', 'Data Limitations', 'Conclusion'
                ]
            },
            {
                type: 'weekly_market',
                name_vi: 'Nghiên cứu & Phân tích Thị trường Tuần',
                name_en: 'Weekly Market Report',
                sections: [
                    'Executive Summary', 'Market Regime', 'Index Performance',
                    'Sector Rotation', 'Money Flow', 'Foreign Flow', 'Market Breadth',
                    'Risk-On / Risk-Off Assessment', 'Watchlist Signals', 'Data Limitations', 'Conclusion'
                ]
            },
            {
                type: 'portfolio',
                name_vi: 'Nghiên cứu & Phân tích Danh mục',
                name_en: 'Portfolio Research',
                sections: [
                    'Executive Summary', 'Portfolio Composition', 'Quant Metrics',
                    'Backtest Performance', 'Optimizer Findings', 'Benchmark Comparison',
                    'Risk Assessment', 'Rebalancing Considerations', 'Data Limitations', 'Conclusion'
                ]
            },
            {
                type: 'market_brief',
                name_vi: 'Tóm tắt Thông tin Thị trường',
                name_en: 'Market Intelligence Brief',
                sections: [
                    'Market Snapshot', 'Regime Signal', 'Breadth Signal',
                    'Sector Leadership', 'Capital Flow', 'Foreign Flow',
                    'Key Observations', 'Risks', 'Conclusion'
                ]
            }
        ];
    }
    async getHistory() {
        return this.prisma.researchReport.findMany({
            orderBy: { generatedAt: 'desc' },
            select: {
                id: true,
                reportType: true,
                subject: true,
                language: true,
                format: true,
                title: true,
                generatedAt: true,
            }
        });
    }
    async exportReport(id, format, res) {
        const reportId = parseInt(id, 10);
        if (isNaN(reportId)) {
            throw new common_1.HttpException('Invalid report ID', common_1.HttpStatus.BAD_REQUEST);
        }
        const report = await this.prisma.researchReport.findUnique({
            where: { id: reportId }
        });
        if (!report) {
            throw new common_1.HttpException('Report not found', common_1.HttpStatus.NOT_FOUND);
        }
        const fmt = format.toLowerCase();
        const filename = `${report.reportType}_${report.subject}_${report.id}`;
        if (fmt === 'json') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
            return res.status(common_1.HttpStatus.OK).send(this.exportService.exportJson(report));
        }
        else if (fmt === 'markdown') {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.md`);
            return res.status(common_1.HttpStatus.OK).send(this.exportService.exportMarkdown(report.content));
        }
        else if (fmt === 'docx') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.doc`);
            return res.status(common_1.HttpStatus.OK).send(this.exportService.exportDocx(report.title, report.content));
        }
        else if (fmt === 'pdf') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(common_1.HttpStatus.BAD_REQUEST).send('PDF export unavailable. Please use the print function on your web browser to save the preview as PDF.');
        }
        else {
            throw new common_1.HttpException('Unsupported format', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.ResearchController = ResearchController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a new research report' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available templates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get generated reports history' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('export/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Export a research report' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: true, example: 'docx' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ResearchController.prototype, "exportReport", null);
exports.ResearchController = ResearchController = __decorate([
    (0, swagger_1.ApiTags)('Research'),
    (0, common_1.Controller)('research'),
    __metadata("design:paramtypes", [research_data_aggregator_service_1.ResearchDataAggregatorService,
        grounded_ai_service_1.GroundedAiService,
        research_export_service_1.ResearchExportService,
        prisma_service_1.PrismaService])
], ResearchController);
//# sourceMappingURL=research.controller.js.map