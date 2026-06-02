import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../common/audit/audit.service';
import { AUDIT_SOURCE } from '@prisma/client';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agentUrl: string;
  private readonly agentSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {
    this.agentUrl = this.configService.get<string>('AGENT_URL') || 'http://127.0.0.1:8000';
    this.agentSecret = this.configService.get<string>('AGENT_IPC_SECRET') || 'fintop_agent_secure_secret_token_2026';
  }

  private async callAgent(path: string, options: RequestInit = {}): Promise<any> {
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
        throw new InternalServerErrorException(`Agent returned error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to connect to Agent microservice at ${url}: ${error.message}`);
      throw new InternalServerErrorException('AI Ops Agent is currently offline or unreachable.');
    }
  }

  async runDiagnostics(adminId: number) {
    this.logger.log(`Admin #${adminId} triggered runtime system diagnostics.`);
    const result = await this.callAgent('/agent/run-diagnostics', { method: 'POST' });

    // Log this operation to FINTop's central audit tables
    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'AGENT_RUN_QA',
      tableName: 'tasks',
      recordId: result.taskId,
      newValues: { status: 'RUNNING', triggeredBy: adminId },
    });

    return result;
  }

  async resumeTask(taskId: string, adminId: number) {
    this.logger.log(`Admin #${adminId} requested resume on QA task: ${taskId}`);
    const result = await this.callAgent('/agent/resume-task', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });

    await this.auditService.log({
      userId: adminId,
      source: AUDIT_SOURCE.SYSTEM,
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

  async getReport(taskId: string) {
    return this.callAgent(`/agent/reports/${taskId}`);
  }
}
