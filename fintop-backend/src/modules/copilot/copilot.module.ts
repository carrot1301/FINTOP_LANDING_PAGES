import { Module } from '@nestjs/common';
import { CopilotController } from './copilot.controller';
import { CopilotOrchestratorService } from './copilot-orchestrator.service';
import { ToolRegistryService } from './tool-registry.service';
import { MarketModule } from '../market/market.module';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [
    MarketModule,
    PortfolioModule,
  ],
  controllers: [CopilotController],
  providers: [
    CopilotOrchestratorService,
    ToolRegistryService,
  ],
})
export class CopilotModule {}
