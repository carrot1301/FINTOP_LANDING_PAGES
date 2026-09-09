"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const notification_service_1 = require("./notification.service");
const notification_queue_1 = require("./notification.queue");
const notification_processor_1 = require("./notification.processor");
const notification_controller_1 = require("./notification.controller");
const websocket_module_1 = require("../websocket/websocket.module");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'notifications',
            }),
            (0, common_1.forwardRef)(() => websocket_module_1.WebsocketModule),
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [notification_service_1.NotificationService, notification_queue_1.NotificationQueue, notification_processor_1.NotificationProcessor],
        exports: [notification_service_1.NotificationService, notification_queue_1.NotificationQueue],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map