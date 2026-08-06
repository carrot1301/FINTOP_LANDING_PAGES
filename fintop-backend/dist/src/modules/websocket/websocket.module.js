"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketModule = void 0;
const common_1 = require("@nestjs/common");
const market_gateway_1 = require("./market.gateway");
const signal_gateway_1 = require("./signal.gateway");
const notification_gateway_1 = require("./notification.gateway");
const socket_auth_guard_1 = require("./socket-auth.guard");
const notification_module_1 = require("../notification/notification.module");
const auth_module_1 = require("../auth/auth.module");
let WebsocketModule = class WebsocketModule {
};
exports.WebsocketModule = WebsocketModule;
exports.WebsocketModule = WebsocketModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => notification_module_1.NotificationModule), auth_module_1.AuthModule],
        providers: [
            market_gateway_1.MarketGateway,
            signal_gateway_1.SignalGateway,
            notification_gateway_1.NotificationGateway,
            socket_auth_guard_1.SocketAuthGuard,
        ],
        exports: [market_gateway_1.MarketGateway, signal_gateway_1.SignalGateway, notification_gateway_1.NotificationGateway],
    })
], WebsocketModule);
//# sourceMappingURL=websocket.module.js.map