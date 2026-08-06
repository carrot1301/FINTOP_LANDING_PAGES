import { OnModuleDestroy } from '@nestjs/common';
import { SharedBullConfigurationFactory, BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
export declare class QueueConfigService implements SharedBullConfigurationFactory, OnModuleDestroy {
    private readonly configService;
    private connection?;
    constructor(configService: ConfigService);
    createSharedConfiguration(): BullRootModuleOptions;
    onModuleDestroy(): Promise<void>;
}
