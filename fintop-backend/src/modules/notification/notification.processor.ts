import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationJob } from './notification.queue';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<NotificationJob, any, string>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} for User ${job.data.userId}`);
    await this.notificationService.createNotification(job.data.userId, job.data.title, job.data.content);
  }
}
