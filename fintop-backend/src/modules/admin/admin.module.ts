import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationModule } from '../notification/notification.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [NotificationModule],
  controllers: [AdminController, AgentController],
  providers: [AdminService, AgentService],
})
export class AdminModule {}
