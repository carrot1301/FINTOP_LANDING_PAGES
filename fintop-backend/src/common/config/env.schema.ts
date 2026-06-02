import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, validateSync, MinLength } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvSchema {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(16, { message: 'JWT_SECRET must be at least 16 characters for production safety' })
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(16, { message: 'JWT_ACCESS_SECRET must be at least 16 characters' })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL: number = 60000;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number = 60;

  @IsNumber()
  @IsOptional()
  DB_POOL_MAX: number = 10;

  @IsNumber()
  @IsOptional()
  DB_TIMEOUT_MS: number = 15000;

  // ─────────────────────────────────────────────────────────────
  // PHASE-4B: EXTERNAL PROVIDERS SETTINGS (OPTIONAL FOR SANDBOX/DEV)
  // ─────────────────────────────────────────────────────────────
  @IsString()
  @IsOptional()
  WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  ZALOPAY_APP_ID?: string;

  @IsString()
  @IsOptional()
  ZALOPAY_KEY1?: string;

  @IsString()
  @IsOptional()
  ZALOPAY_KEY2?: string;

  @IsString()
  @IsOptional()
  VIETQR_CLIENT_KEY?: string;

  @IsString()
  @IsOptional()
  VIETQR_API_KEY?: string;

  @IsString()
  @IsOptional()
  TCBS_API_BASE_URL?: string;

  @IsString()
  @IsOptional()
  TCBS_API_KEY?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  AGENT_IPC_SECRET: string = 'fintop_agent_secure_secret_token_2026';

  @IsString()
  @IsOptional()
  AGENT_URL: string = 'http://127.0.0.1:8000';

  @IsString()
  @IsOptional()
  AWS_S3_BUCKET?: string;

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID?: string;

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvSchema {
  // Fail-fast: Block production startup with dangerous fallback secrets
  if (config.NODE_ENV === 'production') {
    const dangerousDefaults = ['secretKey', 'secret', 'changeme', 'password', '123456'];
    for (const key of ['JWT_SECRET', 'JWT_ACCESS_SECRET']) {
      const val = config[key] as string | undefined;
      if (!val || dangerousDefaults.includes(val.toLowerCase())) {
        throw new Error(`🚨 PRODUCTION BLOCKED: ${key} is missing or uses a dangerous default value. Set a strong, unique secret.`);
      }
    }
  }

  const validatedConfig = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
    throw new Error(`🚨 Environment validation failed: ${messages}`);
  }
  return validatedConfig;
}
