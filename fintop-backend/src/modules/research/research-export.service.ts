import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ResearchExportService {
  private readonly logger = new Logger(ResearchExportService.name);

  exportMarkdown(content: string): string {
    return content;
  }

  exportJson(report: any): string {
    return JSON.stringify(report, null, 2);
  }

  exportDocx(title: string, markdownContent: string): string {
    const htmlBody = this.convertMarkdownToHtml(markdownContent);
    return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${title}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    padding: 20px;
  }
  h1 {
    color: #1e3a8a;
    font-size: 20pt;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 5px;
    margin-top: 24pt;
    margin-bottom: 12pt;
  }
  h2 {
    color: #2563eb;
    font-size: 14pt;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    margin-top: 18pt;
    margin-bottom: 8pt;
  }
  h3 {
    color: #1e293b;
    font-size: 12pt;
    margin-top: 12pt;
    margin-bottom: 6pt;
  }
  p, li {
    font-size: 10pt;
    margin-bottom: 6pt;
  }
  ul, ol {
    margin-top: 0;
    margin-bottom: 12pt;
    padding-left: 20px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 12pt;
    margin-bottom: 12pt;
    font-size: 9.5pt;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
  }
  th {
    background-color: #f1f5f9;
    font-weight: bold;
    color: #0f172a;
  }
  blockquote, .alert, .disclaimer-box {
    background-color: #f8fafc;
    border-left: 4px solid #3b82f6;
    padding: 8pt 12pt;
    margin: 12pt 0;
    font-style: italic;
    color: #475569;
  }
</style>
</head>
<body>
  ${htmlBody}
</body>
</html>
`;
  }

  private convertMarkdownToHtml(markdown: string): string {
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;
    let inTable = false;
    let inBlockquote = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Handle blockquotes/alerts
      if (line.startsWith('>')) {
        if (!inBlockquote) {
          html += '<div class="disclaimer-box">';
          inBlockquote = true;
        }
        // remove the '>' and clean text
        let cleanText = line.substring(1).trim();
        if (cleanText.startsWith('[!IMPORTANT]') || cleanText.startsWith('[!WARNING]') || cleanText.startsWith('[!NOTE]')) {
          cleanText = cleanText.replace(/\[!(IMPORTANT|WARNING|NOTE)\]/, '').trim();
        }
        cleanText = this.replaceInlineStyles(cleanText);
        html += `<p>${cleanText}</p>`;
        continue;
      } else if (inBlockquote) {
        html += '</div>';
        inBlockquote = false;
      }

      // Handle table close
      if (!line.startsWith('|') && inTable) {
        html += '</tbody></table>';
        inTable = false;
      }

      // Handle list close
      if (!line.startsWith('-') && !line.startsWith('*') && !/^\d+\./.test(line) && inList) {
        html += '</ul>';
        inList = false;
      }

      if (line === '') {
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        html += `<h1>${this.replaceInlineStyles(line.substring(2))}</h1>`;
      } else if (line.startsWith('## ')) {
        html += `<h2>${this.replaceInlineStyles(line.substring(3))}</h2>`;
      } else if (line.startsWith('### ')) {
        html += `<h3>${this.replaceInlineStyles(line.substring(4))}</h3>`;
      } else if (line.startsWith('#### ')) {
        html += `<h4>${this.replaceInlineStyles(line.substring(5))}</h4>`;
      }
      // Bullet lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${this.replaceInlineStyles(line.substring(2))}</li>`;
      }
      // Tables
      else if (line.startsWith('|')) {
        const parts = line.split('|').map(p => p.trim()).filter((p, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Skip separator line |---|---|
        if (parts.every(p => p.startsWith('-') || p.includes(':-') || p.includes('-:'))) {
          continue;
        }

        if (!inTable) {
          html += '<table><thead><tr>';
          parts.forEach(p => {
            html += `<th>${this.replaceInlineStyles(p)}</th>`;
          });
          html += '</tr></thead><tbody>';
          inTable = true;
        } else {
          html += '<tr>';
          parts.forEach(p => {
            html += `<td>${this.replaceInlineStyles(p)}</td>`;
          });
          html += '</tr>';
        }
      }
      // Standard paragraphs
      else {
        html += `<p>${this.replaceInlineStyles(line)}</p>`;
      }
    }

    // Close any unclosed tags
    if (inBlockquote) html += '</div>';
    if (inTable) html += '</tbody></table>';
    if (inList) html += '</ul>';

    return html;
  }

  private replaceInlineStyles(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }
}
