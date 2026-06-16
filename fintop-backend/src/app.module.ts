import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from './infra/infra.module';
import { AuthModule } from './modules/auth/auth.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { BillingModule } from './modules/billing/billing.module';
import { MarketModule } from './modules/market/market.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { SignalModule } from './modules/signal/signal.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { AlertModule } from './modules/alert/alert.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CmsModule } from './modules/cms/cms.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { AdminModule } from './modules/admin/admin.module';
import { CopyTradeModule } from './modules/copy-trade/copy-trade.module';
import { ResearchModule } from './modules/research/research.module';
import { CopilotModule } from './modules/copilot/copilot.module';
import { CorrelationIdMiddleware } from './common/interceptors/correlation-id.middleware';

@Module({
  imports: [
    InfraModule,
    AuthModule,
    SubscriptionModule,
    BillingModule,
    MarketModule,
    IngestionModule,
    SignalModule,
    PortfolioModule,
    WatchlistModule,
    AlertModule,
    NotificationModule,
    CmsModule,
    WebsocketModule,
    AdminModule,
    CopyTradeModule,
    ResearchModule,
    CopilotModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL') || 60000,
          limit: config.get<number>('THROTTLE_LIMIT') || 60,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
