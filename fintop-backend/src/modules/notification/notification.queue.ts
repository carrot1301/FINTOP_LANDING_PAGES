import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface NotificationJob {
  userId: number;
  title: string;
  content: string;
}

@Injectable()
export class NotificationQueue {
  private readonly logger = new Logger(NotificationQueue.name);

  constructor(@InjectQueue('notifications') private readonly queue: Queue) {}

  async enqueue(job: NotificationJob) {
    this.logger.log(`Enqueuing notification for User ${job.userId}`);
    
    await this.queue.add('send-notification', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false, // Keep in failed jobs for DLQ
    });
  }
}

