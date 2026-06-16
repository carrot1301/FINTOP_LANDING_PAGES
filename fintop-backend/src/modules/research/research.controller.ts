import { Controller, Get, Post, Query, Body, Res, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ResearchDataAggregatorService } from './research-data-aggregator.service';
import { GroundedAiService } from './grounded-ai.service';
import { ResearchExportService } from './research-export.service';
import { PrismaService } from '../../common/database/prisma.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Research')
@Controller('research')
export class ResearchController {
  constructor(
    private readonly aggregator: ResearchDataAggregatorService,
    private readonly ai: GroundedAiService,
    private readonly exportService: ResearchExportService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new research report' })
  async generateReport(@Body() dto: {
    report_type: string;
    subject: string;
    language?: string;
    format?: string;
    include_charts?: boolean;
    date_range?: { start_date: string; end_date: string };
  }) {
    const reportType = dto.report_type;
    const subject = dto.subject;
    const language = dto.language || 'vi';
    const format = dto.format || 'markdown';

    // Validate inputs
    if (!reportType || !subject) {
      throw new HttpException('Missing report_type or subject', HttpStatus.BAD_REQUEST);
    }

    const validTypes = ['company', 'sector', 'weekly_market', 'portfolio', 'market_brief'];
    if (!validTypes.includes(reportType)) {
      throw new HttpException('Invalid report_type', HttpStatus.BAD_REQUEST);
    }

    try {
      // 1. Aggregate data
      const data = await this.aggregator.aggregate(reportType, subject, dto.date_range);

      // 2. Generate report content using GroundedAiService
      const content = await this.ai.generate(data, language);

      // 3. Resolve report title
      let title = '';
      if (reportType === 'company') {
        title = language === 'vi' 
          ? `Nghiên cứu & Phân tích Doanh nghiệp ${subject.toUpperCase()}`
          : `Company Research Report ${subject.toUpperCase()}`;
      } else if (reportType === 'sector') {
        title = language === 'vi'
          ? `Nghiên cứu & Phân tích Ngành ${subject}`
          : `Sector Research Report ${subject}`;
      } else if (reportType === 'weekly_market') {
        title = language === 'vi'
          ? `Nghiên cứu & Phân tích Thị trường Tuần`
          : `Weekly Market Research Report`;
      } else if (reportType === 'portfolio') {
        title = language === 'vi'
          ? `Nghiên cứu & Phân tích Danh mục`
          : `Portfolio Research Report`;
      } else if (reportType === 'market_brief') {
        title = language === 'vi'
          ? `Tóm tắt Thông tin Thị trường`
          : `Market Intelligence Brief`;
      }

      // 4. Persist to DB
      const report = await this.prisma.researchReport.create({
        data: {
          reportType,
          subject,
          language,
          format,
          title,
          content,
          metadata: data as any,
        }
      });

      return report;
    } catch (err) {
      throw new HttpException(`Failed to generate report: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available templates' })
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

  @Get('history')
  @ApiOperation({ summary: 'Get generated reports history' })
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

  @Get('export/:id')
  @ApiOperation({ summary: 'Export a research report' })
  @ApiQuery({ name: 'format', required: true, example: 'docx' })
  async exportReport(
    @Param('id') id: string,
    @Query('format') format: string,
    @Res() res: Response
  ) {
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      throw new HttpException('Invalid report ID', HttpStatus.BAD_REQUEST);
    }

    const report = await this.prisma.researchReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
    }

    const fmt = format.toLowerCase();
    const filename = `${report.reportType}_${report.subject}_${report.id}`;

    if (fmt === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
      return res.status(HttpStatus.OK).send(this.exportService.exportJson(report));
    } else if (fmt === 'markdown') {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.md`);
      return res.status(HttpStatus.OK).send(this.exportService.exportMarkdown(report.content));
    } else if (fmt === 'docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.doc`);
      return res.status(HttpStatus.OK).send(this.exportService.exportDocx(report.title, report.content));
    } else if (fmt === 'pdf') {
      // PDF export is not supported directly in the backend sandbox, return "PDF export unavailable" warning as requested
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(HttpStatus.BAD_REQUEST).send('PDF export unavailable. Please use the print function on your web browser to save the preview as PDF.');
    } else {
      throw new HttpException('Unsupported format', HttpStatus.BAD_REQUEST);
    }
  }
}
