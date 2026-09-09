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
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const agent_service_1 = require("./agent.service");
let AgentController = class AgentController {
    agentService;
    constructor(agentService) {
        this.agentService = agentService;
    }
    async runRuntimeCheck(admin) {
        return this.agentService.runDiagnostics(admin.id);
    }
    async resumeTask(taskId, admin) {
        return this.agentService.resumeTask(taskId, admin.id);
    }
    async getTasks() {
        return this.agentService.getTasks();
    }
    async getReport(taskId) {
        return this.agentService.getReport(taskId);
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Post)('agent/run-runtime-check'),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger QA/Ops Agent to run system-wide diagnostics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "runRuntimeCheck", null);
__decorate([
    (0, common_1.Post)('agent/resume-task'),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Resume a paused or failed diagnostic check task' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { taskId: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)('taskId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "resumeTask", null);
__decorate([
    (0, common_1.Get)('agent/tasks'),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of recent diagnostic agent tasks and statuses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Get)('agent/reports/:id'),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI generated operations markdown report by task ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getReport", null);
exports.AgentController = AgentController = __decorate([
    (0, swagger_1.ApiTags)('Admin AI Ops Agent'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map