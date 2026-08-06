import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from './notification.service';
import { NotificationJob } from './notification.queue';
export declare class NotificationProcessor extends WorkerHost {
    private readonly notificationService;
    private readonly logger;
    constructor(notificationService: NotificationService);
    process(job: Job<NotificationJob, any, string>): Promise<any>;
}
