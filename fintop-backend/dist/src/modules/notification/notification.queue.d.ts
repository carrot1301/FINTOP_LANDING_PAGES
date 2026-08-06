import { Queue } from 'bullmq';
export interface NotificationJob {
    userId: number;
    title: string;
    content: string;
}
export declare class NotificationQueue {
    private readonly queue;
    private readonly logger;
    constructor(queue: Queue);
    enqueue(job: NotificationJob): Promise<void>;
}
