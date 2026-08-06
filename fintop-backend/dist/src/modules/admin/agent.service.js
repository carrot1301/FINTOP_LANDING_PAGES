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
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const audit_service_1 = require("../../common/audit/audit.service");
const client_1 = require("@prisma/client");
let AgentService = AgentService_1 = class AgentService {
    configService;
    auditService;
    logger = new common_1.Logger(AgentService_1.name);
    agentUrl;
    agentSecret;
    constructor(configService, auditService) {
        this.configService = configService;
        this.auditService = auditService;
        this.agentUrl = this.configService.get('AGENT_URL') || 'http://127.0.0.1:8000';
        this.agentSecret = this.configService.get('AGENT_IPC_SECRET') || 'fintop_agent_secure_secret_token_2026';
    }
    async callAgent(path, options = {}) {
        const url = `${this.agentUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-Agent-Secret': this.agentSecret,
            ...(options.headers || {}),
        };
        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Error response from Agent microservice: Status ${response.status} - ${errorText}`);
                throw new common_1.InternalServerErrorException(`Agent returned error: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            this.logger.error(`Failed to connect to Agent microservice at ${url}: ${error.message}`);
            throw new common_1.InternalServerErrorException('AI Ops Agent is currently offline or unreachable.');
        }
    }
    async runDiagnostics(adminId) {
        this.logger.log(`Admin #${adminId} triggered runtime system diagnostics.`);
        const result = await this.callAgent('/agent/run-diagnostics', { method: 'POST' });
        await this.auditService.log({
            userId: adminId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'AGENT_RUN_QA',
            tableName: 'tasks',
            recordId: result.taskId,
            newValues: { status: 'RUNNING', triggeredBy: adminId },
        });
        return result;
    }
    async resumeTask(taskId, adminId) {
        this.logger.log(`Admin #${adminId} requested resume on QA task: ${taskId}`);
        const result = await this.callAgent('/agent/resume-task', {
            method: 'POST',
            body: JSON.stringify({ taskId }),
        });
        await this.auditService.log({
            userId: adminId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'AGENT_RESUME_TASK',
            tableName: 'tasks',
            recordId: taskId,
            newValues: { status: 'RUNNING', resumedBy: adminId },
        });
        return result;
    }
    async getTasks() {
        return this.callAgent('/agent/tasks');
    }
    async getReport(taskId) {
        return this.callAgent(`/agent/reports/${taskId}`);
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        audit_service_1.AuditService])
], AgentService);
//# sourceMappingURL=agent.service.js.map