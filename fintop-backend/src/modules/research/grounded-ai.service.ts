import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GroundedAiService {
  private readonly logger = new Logger(GroundedAiService.name);

  constructor(private readonly configService: ConfigService) {}

  async generate(data: any, language = 'vi'): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const systemPrompt = `You are a Principal Investment Research Automation Architect and Quant Researcher. 
Your task is to write a highly professional, objective investment research report based strictly on the provided structured data.
Do NOT invent or fabricate any numbers or company facts. If sections (such as Backtesting or Optimization) are marked as "Data unavailable" or "Dữ liệu chưa có sẵn", clearly write that they are not available.
Do NOT make any investment recommendations. Use an academic, objective finance tone. 
Every output must conclude with this exact warning block:
"Ấn phẩm này được tạo từ dữ liệu định lượng và diễn giải hỗ trợ bởi AI, chỉ phục vụ mục đích nghiên cứu và giáo dục, không phải là khuyến nghị đầu tư hoặc tư vấn đầu tư."`;

    const userPrompt = `Generate a ${data.report_type} report for "${data.subject}" in ${language === 'vi' ? 'Vietnamese' : 'English'}.
Structured Data:
${JSON.stringify(data, null, 2)}`;

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.1, // low temperature for strict grounding
              maxOutputTokens: 2048,
            }
          })
        });

        if (response.ok) {
          const json: any = await response.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            this.logger.log('Gemini API report generation succeeded.');
            return text;
          }
        }
        this.logger.warn(`Gemini API returned status: ${response.status}. Falling back to template-based generation.`);
      } catch (err) {
        this.logger.error(`Failed to call Gemini API: ${err.message}. Falling back to template-based generation.`);
      }
    } else {
      this.logger.log('GEMINI_API_KEY is not defined. Using template-based generator fallback.');
    }

    return this.generateLocalFallback(data, language);
  }

  private generateLocalFallback(data: any, language: string): string {
    const isVi = language === 'vi';
    const disc = isVi 
      ? `> [!IMPORTANT]\n> **Ấn phẩm này được tạo từ dữ liệu định lượng và diễn giải hỗ trợ bởi AI, chỉ phục vụ mục đích nghiên cứu và giáo dục, không phải là khuyến nghị đầu tư hoặc tư vấn đầu tư.**`
      : `> [!IMPORTANT]\n> **This publication is created from quantitative data and interpretations supported by AI, for research and educational purposes only, and is not an investment recommendation or investment advice.**`;

    const createdTime = new Date().toLocaleString(isVi ? 'vi-VN' : 'en-US');

    // 1. Company Research Fallback
    if (data.report_type === 'company') {
      const f = data.financials;
      const q = data.quant;
      const t = data.subject.toUpperCase();

      if (!f || !f.ticker) {
        return `# ${isVi ? 'Nghiên cứu & Phân tích Doanh nghiệp' : 'Company Research Report'}: ${t}\n\n${isVi ? 'Dữ liệu doanh nghiệp không khả dụng.' : 'Company data is currently unavailable.'}\n\n${disc}`;
      }

      return `# ${isVi ? 'Nghiên cứu & Phân tích Doanh nghiệp' : 'Company Research Report'}: ${f.companyName} (${f.ticker})
*${isVi ? 'Ngày tạo' : 'Generated on'}: ${createdTime} · ${isVi ? 'Nguồn' : 'Source'}: FinTop DATA*

## 1. ${isVi ? 'Tóm tắt kết quả' : 'Executive Summary'}
${isVi ? `Báo cáo này trình bày tóm tắt kết quả phân tích định lượng cho mã cổ phiếu ${f.ticker} thuộc sàn ${f.exchange}. Cổ phiếu hiện được xếp hạng trạng thái xu hướng kỹ thuật là **${q.ratingTA}** với tín hiệu chỉ số Model là **${q.actSignal}**.` : `This report details the quantitative research for ${f.ticker} listed on ${f.exchange}. The stock's technical trend rating is currently **${q.ratingTA}** with a Model indicator signal of **${q.actSignal}**.`}

## 2. ${isVi ? 'Thông tin doanh nghiệp' : 'Business Overview'}
- **${isVi ? 'Tên doanh nghiệp' : 'Company Name'}**: ${f.companyName}
- **${isVi ? 'Sàn giao dịch' : 'Exchange'}**: ${f.exchange}
- **${isVi ? 'Ngành hoạt động' : 'Industry'}**: ${f.industry} / ${f.sector}

## 3. ${isVi ? 'Chỉ số tài chính' : 'Financial Snapshot'}
- **${isVi ? 'Thị giá gần nhất' : 'Last Close Price'}**: ${f.priceClose ? f.priceClose.toLocaleString() + ' VND' : 'N/A'}
- **${isVi ? 'Hệ số P/E' : 'P/E Ratio'}**: ${f.peRatio || 'N/A'}
- **${isVi ? 'Hệ số P/B' : 'P/B Ratio'}**: ${f.pbRatio || 'N/A'}
- **${isVi ? 'Thu nhập mỗi cổ phần (EPS)' : 'Earnings Per Share (EPS)'}**: ${f.eps ? f.eps.toLocaleString() + ' VND' : 'N/A'}
- **${isVi ? 'Vốn hóa thị trường' : 'Market Capitalization'}**: ${f.marketCap ? (f.marketCap / 1000000000).toLocaleString() + ' tỷ VND' : 'N/A'}

## 4. ${isVi ? 'Định giá & Phân tích kỹ thuật' : 'Valuation & Technical Snapshot'}
- **${isVi ? 'Xu hướng giá chính' : 'Trend Identification'}**: ${q.trend}
- **${isVi ? 'Ngưỡng hỗ trợ kỹ thuật' : 'Technical Support Zone'}**: ${q.support}
- **${isVi ? 'Ngưỡng kháng cự kỹ thuật' : 'Technical Resistance Zone'}**: ${q.resistance}
- **${isVi ? 'Nhà phân tích chịu trách nhiệm' : 'Responsible Analyst'}**: ${q.analyst}

## 5. ${isVi ? 'Phân tích Backtest & Bộ Tối Ưu Hóa' : 'Backtest & Optimization Analysis'}
- **${isVi ? 'Bộ máy kiểm thử lịch sử (Backtest Engine)' : 'Backtest Engine'}**: *${isVi ? 'Dữ liệu chưa có sẵn' : 'Data unavailable'}* (warnings: ${data.warnings[0]})
- **${isVi ? 'Bộ máy tối ưu hóa danh mục (Optimizer Engine)' : 'Optimizer Engine'}**: *${isVi ? 'Dữ liệu chưa có sẵn' : 'Data unavailable'}* (warnings: ${data.warnings[1]})

## 6. ${isVi ? 'Hạn chế dữ liệu' : 'Data Limitations'}
${isVi ? 'Dữ liệu báo cáo được tổng hợp trực tiếp từ cơ sở dữ liệu định lượng của hệ thống FinTop. Do thiếu tích hợp của bộ máy Backtest/Optimizer, các đánh giá phân tích hiệu quả lịch sử vị thế và tối ưu hóa tỷ trọng chưa khả dụng trong ấn phẩm này.' : 'This report aggregates information from the FinTop quantitative database. Due to the lack of integration with the Backtest and Optimizer engines, historical performance backtesting and weight optimizations are unavailable in this version.'}

## 7. ${isVi ? 'Kết luận' : 'Conclusion'}
${isVi ? `Mã cổ phiếu ${f.ticker} đang giao dịch ở ngưỡng thị giá ${f.priceClose ? f.priceClose.toLocaleString() : 'N/A'} VND, thể hiện mức định giá P/E là ${f.peRatio || 'N/A'}. Nhà đầu tư cần cân nhắc các ngưỡng hỗ trợ/kháng cự khi ra quyết định giao dịch.` : `The stock ${f.ticker} is trading at ${f.priceClose ? f.priceClose.toLocaleString() : 'N/A'} VND with a P/E valuation of ${f.peRatio || 'N/A'}. Investors should inspect the technical support/resistance levels during trading calculations.`}

\n\n${disc}`;
    }

    // 2. Sector Research Fallback
    if (data.report_type === 'sector') {
      const s = data.market_intelligence;
      const t = data.subject.toUpperCase();

      if (!s || s.status === 'Not applicable') {
        return `# ${isVi ? 'Nghiên cứu & Phân tích Ngành' : 'Sector Research Report'}: ${t}\n\n${isVi ? 'Dữ liệu ngành không khả dụng.' : 'Sector data is currently unavailable.'}\n\n${disc}`;
      }

      return `# ${isVi ? 'Nghiên cứu & Phân tích Ngành' : 'Sector Research Report'}: ${s.sectorName} (${s.sectorCode})
*${isVi ? 'Ngày tạo' : 'Generated on'}: ${createdTime} · ${isVi ? 'Nguồn' : 'Source'}: FinTop DATA*

## 1. ${isVi ? 'Tóm tắt ngành' : 'Executive Summary'}
${isVi ? `Báo cáo phân tích hiệu suất và dòng tiền tích lũy của nhóm ngành **${s.sectorName}** (${s.sectorCode}). Ngành hiện đứng hạng **#${s.rank1m}** về hiệu suất sinh lời 1 tháng qua.` : `This report provides an analysis of performance and capital rotation within the **${s.sectorName}** (${s.sectorCode}) sector. The sector is currently ranked **#${s.rank1m}** in 1-month return performance.`}

## 2. ${isVi ? 'Hiệu suất sinh lời ngành' : 'Sector Return Performance'}
- **${isVi ? 'Tỷ suất sinh lời 1 ngày (1D)' : '1-Day Return (1D)'}**: ${s.return1d}%
- **${isVi ? 'Tỷ suất sinh lời 1 tuần (1W)' : '1-Week Return (1W)'}**: ${s.return1w}%
- **${isVi ? 'Tỷ suất sinh lời 1 tháng (1M)' : '1-Month Return (1M)'}**: ${s.return1m}%
- **${isVi ? 'Tỷ suất sinh lời 3 tháng (3M)' : '3-Month Return (3M)'}**: ${s.return3m}%
- **${isVi ? 'Sức mạnh tương quan (Relative Strength vs VNINDEX)' : 'Relative Strength vs Index'}**: ${s.relativeStrength}

## 3. ${isVi ? 'Luân chuyển dòng tiền & Khối ngoại' : 'Capital & Foreign Inflows'}
${isVi ? 'Hệ thống đánh giá sự dịch chuyển dòng tiền cho thấy nhóm ngành này đang có biến động tương quan dòng tiền chủ động cao. Chi tiết dòng tiền khối ngoại và tự doanh có sẵn trên biểu đồ dashboard.' : 'The capital rotation engine indicates this sector maintains a high active correlation with overall market turnover. Detailed foreign flow data is available on the live dashboard.'}

## 4. ${isVi ? 'Hạn chế dữ liệu' : 'Data Limitations'}
${isVi ? 'Báo cáo chỉ dựa trên dữ liệu giao dịch khớp lệnh lịch sử tích lũy trên các sàn giao dịch HOSE/HNX/UPCOM và không bao gồm các dữ liệu giao dịch thỏa thuận hoặc phái sinh.' : 'This report relies strictly on historical order-matching transaction data across HOSE/HNX/UPCOM exchanges and excludes block trades or derivative instruments.'}

## 5. ${isVi ? 'Kết luận' : 'Conclusion'}
${isVi ? `Ngành ${s.sectorName} có chỉ số sức mạnh kỹ thuật là ${s.relativeStrength}, phản ánh triển vọng đầu tư trung hạn tương đối ổn định.` : `The ${s.sectorName} sector maintains a relative strength indicator of ${s.relativeStrength}, indicating stable medium-term performance.`}

\n\n${disc}`;
    }

    // 3. Weekly Market Report Fallback
    if (data.report_type === 'weekly_market' || data.report_type === 'market_brief') {
      const m = data.market_intelligence;
      if (!m || m.status === 'Not applicable') {
        return `# ${isVi ? 'Báo cáo Phân tích Thị trường' : 'Market Research Report'}\n\n${isVi ? 'Dữ liệu tổng hợp thị trường không khả dụng.' : 'Market intelligence data is currently unavailable.'}\n\n${disc}`;
      }

      const r = m.regime || {};
      const b = m.breadth || {};

      return `# ${isVi ? 'Nghiên cứu & Phân tích Thị trường Tuần' : 'Weekly Market Intelligence Report'}
*${isVi ? 'Ngày giao dịch' : 'Trade Date'}: ${m.tradeDate || 'N/A'} · ${isVi ? 'Ngày tạo' : 'Generated on'}: ${createdTime}*

## 1. ${isVi ? 'Trạng thái xu hướng thị trường (Regime)' : 'Market Regime'}
- **${isVi ? 'Xu hướng chính' : 'Market State'}**: **${r.regime || 'Neutral'}** (Risk Score: ${r.risk_score || 50}/100)
- **${isVi ? 'Đánh giá chi tiết' : 'Detailed Assessment'}**: ${r.explanation || 'N/A'}
- **${isVi ? 'Hệ số biến động ATR' : 'Volatility (ATR)'}**: ${r.atr || 'N/A'} · ADX: ${r.adx || 'N/A'}

## 2. ${isVi ? 'Độ rộng thị trường (Market Breadth)' : 'Market Breadth'}
- **${isVi ? 'Tỷ lệ mã Tăng / Giảm' : 'Advancing / Declining Ratio'}**: ${b.advancingCount} ${isVi ? 'Tăng' : 'Advancing'} / ${b.decliningCount} ${isVi ? 'Giảm' : 'Declining'} (Tỷ lệ: ${b.advanceDeclineRatio})
- **${isVi ? 'Số mã nằm trên đường MA20' : 'Stocks above MA20'}**: ${b.aboveMa20Count}
- **${isVi ? 'Số mã nằm trên đường MA50' : 'Stocks above MA50'}**: ${b.aboveMa50Count}
- **${isVi ? 'Số mã nằm trên đường MA200' : 'Stocks above MA200'}**: ${b.aboveMa200Count}

## 3. **${isVi ? 'Dự báo & Phân bổ' : 'Assessments & Considerations'}**
${isVi ? `Thị trường đang vận hành dưới trạng thái **${r.regime}** với điểm số rủi ro là ${r.risk_score}. Nhà đầu tư được khuyến nghị điều chỉnh danh mục bám sát các nhóm ngành dẫn dắt dòng tiền.` : `The market is currently operating in a **${r.regime}** regime with a risk score of ${r.risk_score}. Investors are suggested to re-allocate holdings towards leading sectors.`}

## 4. ${isVi ? 'Hạn chế dữ liệu' : 'Data Limitations'}
${isVi ? 'Dữ liệu báo cáo được đồng bộ từ Trung tâm Market Intelligence Center. Các chỉ số kỹ thuật có độ trễ nhất định và được cập nhật cuối ngày giao dịch.' : 'This report pulls metrics from the Market Intelligence Center. Technical indices are updated at the end of each trading session and might experience standard propagation delays.'}

\n\n${disc}`;
    }

    // 4. Portfolio Research Fallback
    if (data.report_type === 'portfolio') {
      const q = data.quant;
      if (!q || q.status === 'Not applicable') {
        return `# ${isVi ? 'Nghiên cứu & Phân tích Danh mục' : 'Portfolio Research Report'}\n\n${isVi ? 'Dữ liệu danh mục đầu tư không khả dụng.' : 'Portfolio data is currently unavailable.'}\n\n${disc}`;
      }

      return `# ${isVi ? 'Nghiên cứu & Phân tích Danh mục' : 'Portfolio Research Report'}: ${q.name}
*${isVi ? 'Ngày tạo' : 'Generated on'}: ${createdTime} · ${isVi ? 'Phân bổ tài sản' : 'Asset Allocation'}*

## 1. ${isVi ? 'Tóm tắt danh mục' : 'Portfolio Summary'}
- **${isVi ? 'Tên danh mục' : 'Portfolio Name'}**: ${q.name}
- **${isVi ? 'Mô tả chiến lược' : 'Strategy Description'}**: ${q.description}
- **${isVi ? 'Vốn ban đầu' : 'Initial Capital'}**: ${q.initialCapital?.toLocaleString()} VND
- **${isVi ? 'Giá trị tài sản hiện tại (NAV)' : 'Current NAV'}**: ${q.currentNav?.toLocaleString()} VND
- **${isVi ? 'Số dư tiền mặt' : 'Cash Balance'}**: ${q.cashBalance?.toLocaleString()} VND
- **${isVi ? 'Tổng giá trị cổ phiếu' : 'Total Stocks Value'}**: ${q.stocksValue?.toLocaleString()} VND

## 2. ${isVi ? 'Danh sách vị thế nắm giữ & Tỷ trọng' : 'Portfolio Holdings & Allocations'}
| ${isVi ? 'Mã CP' : 'Symbol'} | ${isVi ? 'Số lượng' : 'Quantity'} | ${isVi ? 'Giá vốn' : 'Entry Price'} | ${isVi ? 'Giá thị trường' : 'Current Price'} | ${isVi ? 'Giá trị' : 'Value'} | ${isVi ? 'Tỷ trọng' : 'Allocation'} |
|---|---|---|---|---|---|
${q.holdings.map(h => `| **${h.symbol}** | ${h.quantity.toLocaleString()} | ${h.avgEntryPrice.toLocaleString()} | ${h.currentPrice.toLocaleString()} | ${h.value.toLocaleString()} | ${h.allocation.toFixed(1)}% |`).join('\n')}

## 3. ${isVi ? 'Kiểm định lịch sử & Tối ưu hóa' : 'Backtest & Optimization metrics'}
- **${isVi ? 'Bộ máy kiểm thử lịch sử (Backtest Engine)' : 'Backtest Engine'}**: *${isVi ? 'Dữ liệu chưa có sẵn' : 'Data unavailable'}* (warnings: ${data.warnings[0]})
- **${isVi ? 'Bộ máy tối ưu hóa danh mục (Optimizer Engine)' : 'Optimizer Engine'}**: *${isVi ? 'Dữ liệu chưa có sẵn' : 'Data unavailable'}* (warnings: ${data.warnings[1]})

## 4. ${isVi ? 'Hạn chế dữ liệu' : 'Data Limitations'}
${isVi ? 'Báo cáo phản ánh các vị thế nắm giữ thực tế tại thời điểm truy vấn. Chỉ số tối ưu hóa chưa khả dụng do thiếu kết nối từ bộ máy Optimizer Engine.' : 'This report reflects the actual positions at the time of calculation. Optimization scores are currently unavailable due to missing integrations from the Optimizer Engine.'}

\n\n${disc}`;
    }

    return `# ${isVi ? 'Báo cáo Nghiên cứu' : 'Research Report'}: ${data.subject}\n\n${disc}`;
  }
}
