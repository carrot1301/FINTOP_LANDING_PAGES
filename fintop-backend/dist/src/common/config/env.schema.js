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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvSchema = exports.Environment = void 0;
exports.validateEnv = validateEnv;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var Environment;
(function (Environment) {
    Environment["Development"] = "development";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
})(Environment || (exports.Environment = Environment = {}));
class EnvSchema {
    NODE_ENV = Environment.Development;
    PORT = 3000;
    DATABASE_URL;
    REDIS_URL;
    JWT_SECRET;
    JWT_ACCESS_SECRET;
    CORS_ORIGIN;
    THROTTLE_TTL = 60000;
    THROTTLE_LIMIT = 60;
    DB_POOL_MAX = 10;
    DB_TIMEOUT_MS = 15000;
    WEBHOOK_SECRET;
    ZALOPAY_APP_ID;
    ZALOPAY_KEY1;
    ZALOPAY_KEY2;
    VIETQR_CLIENT_KEY;
    VIETQR_API_KEY;
    TCBS_API_BASE_URL;
    TCBS_API_KEY;
    SMTP_HOST;
    SMTP_PORT;
    SMTP_USER;
    SMTP_PASS;
    GEMINI_API_KEY;
    AGENT_IPC_SECRET = 'fintop_agent_secure_secret_token_2026';
    AGENT_URL = 'http://127.0.0.1:8000';
    AWS_S3_BUCKET;
    AWS_ACCESS_KEY_ID;
    AWS_SECRET_ACCESS_KEY;
}
exports.EnvSchema = EnvSchema;
__decorate([
    (0, class_validator_1.IsEnum)(Environment),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvSchema.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "DATABASE_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "REDIS_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(16, { message: 'JWT_SECRET must be at least 16 characters for production safety' }),
    __metadata("design:type", String)
], EnvSchema.prototype, "JWT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(16, { message: 'JWT_ACCESS_SECRET must be at least 16 characters' }),
    __metadata("design:type", String)
], EnvSchema.prototype, "JWT_ACCESS_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "CORS_ORIGIN", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvSchema.prototype, "THROTTLE_TTL", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvSchema.prototype, "THROTTLE_LIMIT", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvSchema.prototype, "DB_POOL_MAX", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvSchema.prototype, "DB_TIMEOUT_MS", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "WEBHOOK_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "ZALOPAY_APP_ID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "ZALOPAY_KEY1", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "ZALOPAY_KEY2", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "VIETQR_CLIENT_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "VIETQR_API_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "TCBS_API_BASE_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "TCBS_API_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "SMTP_HOST", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvSchema.prototype, "SMTP_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "SMTP_USER", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "SMTP_PASS", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "GEMINI_API_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "AGENT_IPC_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "AGENT_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "AWS_S3_BUCKET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "AWS_ACCESS_KEY_ID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvSchema.prototype, "AWS_SECRET_ACCESS_KEY", void 0);
function validateEnv(config) {
    if (config.NODE_ENV === 'production') {
        const dangerousDefaults = ['secretKey', 'secret', 'changeme', 'password', '123456'];
        for (const key of ['JWT_SECRET', 'JWT_ACCESS_SECRET']) {
            const val = config[key];
            if (!val || dangerousDefaults.includes(val.toLowerCase())) {
                throw new Error(`🚨 PRODUCTION BLOCKED: ${key} is missing or uses a dangerous default value. Set a strong, unique secret.`);
            }
        }
    }
    const validatedConfig = (0, class_transformer_1.plainToInstance)(EnvSchema, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, { skipMissingProperties: false });
    if (errors.length > 0) {
        const messages = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
        throw new Error(`🚨 Environment validation failed: ${messages}`);
    }
    return validatedConfig;
}
//# sourceMappingURL=env.schema.js.map