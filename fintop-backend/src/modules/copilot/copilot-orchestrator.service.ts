import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';
import { ToolRegistryService, ToolResult } from './tool-registry.service';

// ─────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────

export interface CopilotResponse {
  reply: string;
  toolsUsed: { name: string; args: Record<string, any>; success: boolean }[];
  sessionId: string;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const MAX_TOOL_ROUNDS = 5;
const SESSION_TTL_SECONDS = 1800; // 30 minutes
const MAX_HISTORY_MESSAGES = 20; // Keep last 20 messages to avoid token overflow

const SYSTEM_PROMPT = `You are **FINTop AI Copilot** — an intelligent assistant for the FINTop Vietnam stock market research platform.

## Your Capabilities
You have access to real-time tools that query the FINTop platform's databases and computation engines. You MUST use these tools to answer any question about:
- Stock information (prices, financials, analyst ratings, trends)
- Market regime (bull/bear/neutral, risk scores)
- Sector rotation and performance rankings
- Market breadth (advancing/declining stocks, MA analysis)
- Money flow (institutional capital movement)
- Foreign investor flow (net buy/sell by foreign institutions)
- Portfolio details (holdings, NAV, P&L)
- Market intelligence summaries

## Critical Rules
1. **NEVER fabricate data.** If you need stock prices, financial metrics, market data, or portfolio values, you MUST call the appropriate tool. Do NOT guess or make up numbers.
2. **NEVER bypass calculations.** If the user asks for quantitative analysis, use the tools to get real data first.
3. **Report errors honestly.** If a tool call fails or returns no data, tell the user exactly what happened. Do NOT substitute with made-up data.
4. **Cite your data sources.** When presenting data from tools, mention that it comes from the FINTop platform.
5. **Use Vietnamese by default** unless the user writes in English. Match the user's language.
6. **Be concise but thorough.** Present data in well-formatted tables and bullet points when appropriate.
7. **Add context and interpretation.** After presenting raw data, add brief analytical commentary based strictly on what the data shows. Do NOT speculate beyond the data.
8. **For general market questions**, use the get_intelligence_summary tool to get a comprehensive overview before answering.

## Disclaimer
End every substantive analysis with: "Thông tin được tổng hợp từ dữ liệu FinTop, chỉ phục vụ mục đích nghiên cứu, không phải khuyến nghị đầu tư."`;

// ─────────────────────────────────────────────────────────────
// ORCHESTRATOR SERVICE
// ─────────────────────────────────────────────────────────────

@Injectable()
export class CopilotOrchestratorService {
  private readonly logger = new Logger(CopilotOrchestratorService.name);
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly toolRegistry: ToolRegistryService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
  }

  // ─────────────────────────────────────────────────────────
  // MAIN ORCHESTRATION ENTRY
  // ─────────────────────────────────────────────────────────

  async orchestrate(
    message: string,
    sessionId: string,
    userId: number,
  ): Promise<CopilotResponse> {
    const toolsUsed: CopilotResponse['toolsUsed'] = [];

    // 1. Load conversation history from Redis
    const history = await this.loadHistory(sessionId);

    // 2. Add user message to history
    history.push({ role: 'user', parts: [{ text: message }] });

    // 3. Prepare Gemini request with tools
    const toolDeclarations = this.toolRegistry.getDeclarations();

    // 4. Multi-turn tool-calling loop
    let currentHistory = [...history];
    let finalReply = '';

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const geminiResponse = await this.callGemini(currentHistory, toolDeclarations);

      if (!geminiResponse) {
        finalReply = 'Xin lỗi, hệ thống AI đang tạm thời không khả dụng. Vui lòng thử lại sau.';
        break;
      }

      const candidate = geminiResponse.candidates?.[0];
      if (!candidate?.content?.parts) {
        finalReply = 'Xin lỗi, không nhận được phản hồi từ hệ thống AI.';
        break;
      }

      const parts = candidate.content.parts;

      // Check if Gemini wants to call a function
      const functionCall = parts.find((p: any) => p.functionCall);

      if (functionCall?.functionCall) {
        const { name, args } = functionCall.functionCall;
        this.logger.log(`Gemini requested tool: ${name} with args: ${JSON.stringify(args)}`);

        // Execute the tool
        const toolResult = await this.toolRegistry.execute(name, args || {});
        toolsUsed.push({ name, args: args || {}, success: toolResult.success });

        // Add the assistant's function call to history
        currentHistory.push({
          role: 'model',
          parts: [{ functionCall: { name, args: args || {} } }],
        });

        // Add tool result as function response
        currentHistory.push({
          role: 'function',
          parts: [{
            functionResponse: {
              name,
              response: {
                result: toolResult.success ? toolResult.data : { error: toolResult.error },
              },
            },
          }],
        });

        // Continue the loop — Gemini will process the result
        continue;
      }

      // No function call — extract text response
      const textPart = parts.find((p: any) => p.text);
      finalReply = textPart?.text || 'Copilot không có phản hồi.';
      break;
    }

    // 5. Add assistant response to history
    if (finalReply) {
      currentHistory.push({ role: 'model', parts: [{ text: finalReply }] });
    }

    // 6. Save updated history to Redis
    await this.saveHistory(sessionId, currentHistory);

    return { reply: finalReply, toolsUsed, sessionId };
  }

  // ─────────────────────────────────────────────────────────
  // GEMINI API CALL
  // ─────────────────────────────────────────────────────────

  private async callGemini(
    history: any[],
    toolDeclarations: any[],
  ): Promise<any | null> {
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. Copilot cannot function.');
      return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    // Separate system instruction from conversation history
    // Filter out 'function' role messages and convert them to proper format
    const contents = this.formatContentsForGemini(history);

    const body: any = {
      contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      tools: [{
        functionDeclarations: toolDeclarations,
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API error: ${response.status} — ${errorText}`);
        return null;
      }

      return response.json();
    } catch (err) {
      this.logger.error(`Gemini API network error: ${err.message}`);
      return null;
    }
  }

  /**
   * Format conversation history into Gemini-compatible contents array.
   * Gemini expects alternating user/model turns, with function responses
   * using role 'function' (v1beta) or embedded in user turns.
   */
  private formatContentsForGemini(history: any[]): any[] {
    const contents: any[] = [];

    for (const msg of history) {
      if (msg.role === 'function') {
        // Gemini v1beta expects function responses with role 'function'
        // but some versions may need 'user'. We use the raw role.
        contents.push(msg);
      } else if (msg.role === 'user' || msg.role === 'model') {
        contents.push(msg);
      }
      // Skip any unknown roles
    }

    return contents;
  }

  // ─────────────────────────────────────────────────────────
  // SESSION MANAGEMENT (REDIS)
  // ─────────────────────────────────────────────────────────

  private sessionKey(sessionId: string): string {
    return `copilot:session:${sessionId}`;
  }

  private async loadHistory(sessionId: string): Promise<any[]> {
    try {
      const raw = await this.redisService.getClient().get(this.sessionKey(sessionId));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Trim to last N messages to prevent token overflow
      if (Array.isArray(parsed) && parsed.length > MAX_HISTORY_MESSAGES) {
        return parsed.slice(-MAX_HISTORY_MESSAGES);
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      this.logger.warn(`Failed to load session ${sessionId}: ${err.message}`);
      return [];
    }
  }

  private async saveHistory(sessionId: string, history: any[]): Promise<void> {
    try {
      // Trim before saving
      const trimmed = history.length > MAX_HISTORY_MESSAGES
        ? history.slice(-MAX_HISTORY_MESSAGES)
        : history;
      await this.redisService.getClient().set(
        this.sessionKey(sessionId),
        JSON.stringify(trimmed),
        'EX',
        SESSION_TTL_SECONDS,
      );
    } catch (err) {
      this.logger.warn(`Failed to save session ${sessionId}: ${err.message}`);
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    try {
      await this.redisService.getClient().del(this.sessionKey(sessionId));
      this.logger.log(`Cleared session: ${sessionId}`);
    } catch (err) {
      this.logger.warn(`Failed to clear session ${sessionId}: ${err.message}`);
    }
  }
}
