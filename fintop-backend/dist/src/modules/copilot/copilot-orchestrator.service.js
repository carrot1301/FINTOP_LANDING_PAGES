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
var CopilotOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../../common/redis/redis.service");
const tool_registry_service_1 = require("./tool-registry.service");
const MAX_TOOL_ROUNDS = 5;
const SESSION_TTL_SECONDS = 1800;
const MAX_HISTORY_MESSAGES = 20;
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
let CopilotOrchestratorService = CopilotOrchestratorService_1 = class CopilotOrchestratorService {
    configService;
    redisService;
    toolRegistry;
    logger = new common_1.Logger(CopilotOrchestratorService_1.name);
    apiKey;
    constructor(configService, redisService, toolRegistry) {
        this.configService = configService;
        this.redisService = redisService;
        this.toolRegistry = toolRegistry;
        this.apiKey = this.configService.get('GEMINI_API_KEY') || '';
    }
    async orchestrate(message, sessionId, userId) {
        const toolsUsed = [];
        const history = await this.loadHistory(sessionId);
        history.push({ role: 'user', parts: [{ text: message }] });
        const toolDeclarations = this.toolRegistry.getDeclarations();
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
            const functionCall = parts.find((p) => p.functionCall);
            if (functionCall?.functionCall) {
                const { name, args } = functionCall.functionCall;
                this.logger.log(`Gemini requested tool: ${name} with args: ${JSON.stringify(args)}`);
                const toolResult = await this.toolRegistry.execute(name, args || {});
                toolsUsed.push({ name, args: args || {}, success: toolResult.success });
                currentHistory.push({
                    role: 'model',
                    parts: [{ functionCall: { name, args: args || {} } }],
                });
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
                continue;
            }
            const textPart = parts.find((p) => p.text);
            finalReply = textPart?.text || 'Copilot không có phản hồi.';
            break;
        }
        if (finalReply) {
            currentHistory.push({ role: 'model', parts: [{ text: finalReply }] });
        }
        await this.saveHistory(sessionId, currentHistory);
        return { reply: finalReply, toolsUsed, sessionId };
    }
    async callGemini(history, toolDeclarations) {
        if (!this.apiKey) {
            this.logger.warn('GEMINI_API_KEY is not set. Copilot cannot function.');
            return null;
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
        const contents = this.formatContentsForGemini(history);
        const body = {
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
        }
        catch (err) {
            this.logger.error(`Gemini API network error: ${err.message}`);
            return null;
        }
    }
    formatContentsForGemini(history) {
        const contents = [];
        for (const msg of history) {
            if (msg.role === 'function') {
                contents.push(msg);
            }
            else if (msg.role === 'user' || msg.role === 'model') {
                contents.push(msg);
            }
        }
        return contents;
    }
    sessionKey(sessionId) {
        return `copilot:session:${sessionId}`;
    }
    async loadHistory(sessionId) {
        try {
            const raw = await this.redisService.getClient().get(this.sessionKey(sessionId));
            if (!raw)
                return [];
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > MAX_HISTORY_MESSAGES) {
                return parsed.slice(-MAX_HISTORY_MESSAGES);
            }
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (err) {
            this.logger.warn(`Failed to load session ${sessionId}: ${err.message}`);
            return [];
        }
    }
    async saveHistory(sessionId, history) {
        try {
            const trimmed = history.length > MAX_HISTORY_MESSAGES
                ? history.slice(-MAX_HISTORY_MESSAGES)
                : history;
            await this.redisService.getClient().set(this.sessionKey(sessionId), JSON.stringify(trimmed), 'EX', SESSION_TTL_SECONDS);
        }
        catch (err) {
            this.logger.warn(`Failed to save session ${sessionId}: ${err.message}`);
        }
    }
    async clearSession(sessionId) {
        try {
            await this.redisService.getClient().del(this.sessionKey(sessionId));
            this.logger.log(`Cleared session: ${sessionId}`);
        }
        catch (err) {
            this.logger.warn(`Failed to clear session ${sessionId}: ${err.message}`);
        }
    }
};
exports.CopilotOrchestratorService = CopilotOrchestratorService;
exports.CopilotOrchestratorService = CopilotOrchestratorService = CopilotOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        redis_service_1.RedisService,
        tool_registry_service_1.ToolRegistryService])
], CopilotOrchestratorService);
//# sourceMappingURL=copilot-orchestrator.service.js.map