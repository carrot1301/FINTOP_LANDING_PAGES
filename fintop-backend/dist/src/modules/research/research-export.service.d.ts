export declare class ResearchExportService {
    private readonly logger;
    exportMarkdown(content: string): string;
    exportJson(report: any): string;
    exportDocx(title: string, markdownContent: string): string;
    private convertMarkdownToHtml;
    private replaceInlineStyles;
}
