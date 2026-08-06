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
exports.CopilotController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const copilot_orchestrator_service_1 = require("./copilot-orchestrator.service");
const tool_registry_service_1 = require("./tool-registry.service");
const crypto_1 = require("crypto");
let CopilotController = class CopilotController {
    orchestrator;
    toolRegistry;
    constructor(orchestrator, toolRegistry) {
        this.orchestrator = orchestrator;
        this.toolRegistry = toolRegistry;
    }
    async chat(dto, user) {
        if (!dto.message || typeof dto.message !== 'string' || dto.message.trim().length === 0) {
            throw new common_1.HttpException('Message is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (dto.message.length > 2000) {
            throw new common_1.HttpException('Message too long (max 2000 characters)', common_1.HttpStatus.BAD_REQUEST);
        }
        const sessionId = dto.sessionId || (0, crypto_1.randomUUID)();
        const result = await this.orchestrator.orchestrate(dto.message.trim(), sessionId, user.id);
        return result;
    }
    async listTools() {
        return this.toolRegistry.listTools();
    }
    async clearSession(sessionId) {
        await this.orchestrator.clearSession(sessionId);
        return { success: true, message: 'Session cleared' };
    }
};
exports.CopilotController = CopilotController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message to the FINTop AI Copilot' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Phân tích cổ phiếu FPT' },
                sessionId: { type: 'string', example: null },
            },
            required: ['message'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('tools'),
    (0, swagger_1.ApiOperation)({ summary: 'List available Copilot tools and their descriptions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "listTools", null);
__decorate([
    (0, common_1.Delete)('session/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear a Copilot conversation session' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "clearSession", null);
exports.CopilotController = CopilotController = __decorate([
    (0, swagger_1.ApiTags)('AI Copilot'),
    (0, common_1.Controller)('copilot'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [copilot_orchestrator_service_1.CopilotOrchestratorService,
        tool_registry_service_1.ToolRegistryService])
], CopilotController);
//# sourceMappingURL=copilot.controller.js.map