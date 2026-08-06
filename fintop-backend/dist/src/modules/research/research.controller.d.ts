import { ResearchDataAggregatorService } from './research-data-aggregator.service';
import { GroundedAiService } from './grounded-ai.service';
import { ResearchExportService } from './research-export.service';
import { PrismaService } from '../../common/database/prisma.service';
import type { Response } from 'express';
export declare class ResearchController {
    private readonly aggregator;
    private readonly ai;
    private readonly exportService;
    private readonly prisma;
    constructor(aggregator: ResearchDataAggregatorService, ai: GroundedAiService, exportService: ResearchExportService, prisma: PrismaService);
    generateReport(dto: {
        report_type: string;
        subject: string;
        language?: string;
        format?: string;
        include_charts?: boolean;
        date_range?: {
            start_date: string;
            end_date: string;
        };
    }): Promise<{
        subject: string;
        id: number;
        format: string;
        title: string;
        content: string;
        reportType: string;
        language: string;
        generatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getTemplates(): Promise<{
        type: string;
        name_vi: string;
        name_en: string;
        sections: string[];
    }[]>;
    getHistory(): Promise<{
        subject: string;
        id: number;
        format: string;
        title: string;
        reportType: string;
        language: string;
        generatedAt: Date;
    }[]>;
    exportReport(id: string, format: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
