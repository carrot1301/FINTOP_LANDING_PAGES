"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const infra_module_1 = require("./infra/infra.module");
const auth_module_1 = require("./modules/auth/auth.module");
const subscription_module_1 = require("./modules/subscription/subscription.module");
const billing_module_1 = require("./modules/billing/billing.module");
const market_module_1 = require("./modules/market/market.module");
const ingestion_module_1 = require("./modules/ingestion/ingestion.module");
const signal_module_1 = require("./modules/signal/signal.module");
const portfolio_module_1 = require("./modules/portfolio/portfolio.module");
const watchlist_module_1 = require("./modules/watchlist/watchlist.module");
const alert_module_1 = require("./modules/alert/alert.module");
const notification_module_1 = require("./modules/notification/notification.module");
const cms_module_1 = require("./modules/cms/cms.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const admin_module_1 = require("./modules/admin/admin.module");
const copy_trade_module_1 = require("./modules/copy-trade/copy-trade.module");
const research_module_1 = require("./modules/research/research.module");
const copilot_module_1 = require("./modules/copilot/copilot.module");
const correlation_id_middleware_1 = require("./common/interceptors/correlation-id.middleware");
const mail_module_1 = require("./common/mail/mail.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(correlation_id_middleware_1.CorrelationIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            infra_module_1.InfraModule,
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            subscription_module_1.SubscriptionModule,
            billing_module_1.BillingModule,
            market_module_1.MarketModule,
            ingestion_module_1.IngestionModule,
            signal_module_1.SignalModule,
            portfolio_module_1.PortfolioModule,
            watchlist_module_1.WatchlistModule,
            alert_module_1.AlertModule,
            notification_module_1.NotificationModule,
            cms_module_1.CmsModule,
            websocket_module_1.WebsocketModule,
            admin_module_1.AdminModule,
            copy_trade_module_1.CopyTradeModule,
            research_module_1.ResearchModule,
            copilot_module_1.CopilotModule,
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('THROTTLE_TTL') || 60000,
                        limit: config.get('THROTTLE_LIMIT') || 60,
                    },
                ],
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map