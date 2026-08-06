export declare const appConfig: (() => {
    env: string;
    port: number;
    databaseUrl: string | undefined;
    redisUrl: string | undefined;
    jwtSecret: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string;
    port: number;
    databaseUrl: string | undefined;
    redisUrl: string | undefined;
    jwtSecret: string | undefined;
}>;
