import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchDataAggregatorService } from './research-data-aggregator.service';
import { GroundedAiService } from './grounded-ai.service';
import { ResearchExportService } from './research-export.service';
import { InfraModule } from '../../infra/infra.module';
import { MarketModule } from '../market/market.module';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [
    InfraModule,
    MarketModule,
    PortfolioModule,
  ],
  controllers: [ResearchController],
  providers: [
    ResearchDataAggregatorService,
    GroundedAiService,
    ResearchExportService,
  ],
  exports: [
    ResearchDataAggregatorService,
    GroundedAiService,
    ResearchExportService,
  ],
})
export class ResearchModule {}
