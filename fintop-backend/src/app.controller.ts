import { Controller, Get, Post, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { exec } from 'child_process';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('deploy-webhook')
  @HttpCode(HttpStatus.OK)
  triggerAutoDeploy() {
    this.logger.log('🚀 [Auto-Deploy] Webhook received! Triggering production deployment...');

    exec('cd /var/www/fintop && git fetch --all && git reset --hard origin/main && bash deploy.sh', (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`❌ [Auto-Deploy Error]: ${error.message}`);
        return;
      }
      this.logger.log(`✅ [Auto-Deploy Complete]: ${stdout}`);
    });

    return {
      status: 'success',
      message: 'FinTop DATA Production Auto-Deploy triggered successfully!',
      timestamp: new Date().toISOString(),
    };
  }
}
