import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CopilotOrchestratorService } from './copilot-orchestrator.service';
import { ToolRegistryService } from './tool-registry.service';
import { randomUUID } from 'crypto';

@ApiTags('AI Copilot')
@Controller('copilot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CopilotController {
  constructor(
    private readonly orchestrator: CopilotOrchestratorService,
    private readonly toolRegistry: ToolRegistryService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the FINTop AI Copilot' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Phân tích cổ phiếu FPT' },
        sessionId: { type: 'string', example: null },
      },
      required: ['message'],
    },
  })
  async chat(
    @Body() dto: { message: string; sessionId?: string },
    @CurrentUser() user: any,
  ) {
    if (!dto.message || typeof dto.message !== 'string' || dto.message.trim().length === 0) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }

    if (dto.message.length > 2000) {
      throw new HttpException('Message too long (max 2000 characters)', HttpStatus.BAD_REQUEST);
    }

    const sessionId = dto.sessionId || randomUUID();

    const result = await this.orchestrator.orchestrate(
      dto.message.trim(),
      sessionId,
      user.id,
    );

    return result;
  }

  @Get('tools')
  @ApiOperation({ summary: 'List available Copilot tools and their descriptions' })
  async listTools() {
    return this.toolRegistry.listTools();
  }

  @Delete('session/:id')
  @ApiOperation({ summary: 'Clear a Copilot conversation session' })
  async clearSession(@Param('id') sessionId: string) {
    await this.orchestrator.clearSession(sessionId);
    return { success: true, message: 'Session cleared' };
  }
}
