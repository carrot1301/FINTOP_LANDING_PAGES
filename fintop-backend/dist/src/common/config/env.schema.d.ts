export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvSchema {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_ACCESS_SECRET: string;
    CORS_ORIGIN?: string;
    THROTTLE_TTL: number;
    THROTTLE_LIMIT: number;
    DB_POOL_MAX: number;
    DB_TIMEOUT_MS: number;
    WEBHOOK_SECRET?: string;
    ZALOPAY_APP_ID?: string;
    ZALOPAY_KEY1?: string;
    ZALOPAY_KEY2?: string;
    VIETQR_CLIENT_KEY?: string;
    VIETQR_API_KEY?: string;
    TCBS_API_BASE_URL?: string;
    TCBS_API_KEY?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: number;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    GEMINI_API_KEY?: string;
    AGENT_IPC_SECRET: string;
    AGENT_URL: string;
    AWS_S3_BUCKET?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
}
export declare function validateEnv(config: Record<string, unknown>): EnvSchema;
