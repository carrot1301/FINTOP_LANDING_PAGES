import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ROLE_CODE } from '@prisma/client';
import { AgentService } from './agent.service';

@ApiTags('Admin AI Ops Agent')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('agent/run-runtime-check')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'Trigger QA/Ops Agent to run system-wide diagnostics' })
  async runRuntimeCheck(@CurrentUser() admin: any) {
    return this.agentService.runDiagnostics(admin.id);
  }

  @Post('agent/resume-task')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'Resume a paused or failed diagnostic check task' })
  @ApiBody({ schema: { properties: { taskId: { type: 'string' } } } })
  async resumeTask(
    @Body('taskId') taskId: string,
    @CurrentUser() admin: any,
  ) {
    return this.agentService.resumeTask(taskId, admin.id);
  }

  @Get('agent/tasks')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get list of recent diagnostic agent tasks and statuses' })
  async getTasks() {
    return this.agentService.getTasks();
  }

  @Get('agent/reports/:id')
  @Roles(ROLE_CODE.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get AI generated operations markdown report by task ID' })
  async getReport(@Param('id') taskId: string) {
    return this.agentService.getReport(taskId);
  }
}
