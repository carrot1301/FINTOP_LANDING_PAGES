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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let QueueConfigService = class QueueConfigService {
    configService;
    connection;
    constructor(configService) {
        this.configService = configService;
    }
    createSharedConfiguration() {
        const redisUrl = this.configService.get('REDIS_URL');
        if (!redisUrl) {
            throw new Error('REDIS_URL is not defined for Queue configuration');
        }
        this.connection = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: null,
        });
        return {
            connection: this.connection,
            defaultJobOptions: {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: {
                    count: 100,
                    age: 3600,
                },
                removeOnFail: {
                    count: 1000,
                    age: 86400 * 7,
                },
            },
        };
    }
    async onModuleDestroy() {
        if (this.connection) {
            try {
                await this.connection.quit();
            }
            catch (err) {
            }
        }
    }
};
exports.QueueConfigService = QueueConfigService;
exports.QueueConfigService = QueueConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueConfigService);
//# sourceMappingURL=queue.config.service.js.map