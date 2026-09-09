import { Controller, Get, Post, HttpCode, HttpStatus, Logger, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('sitemap.xml')
  getSitemap(@Res() res: any) {
    const pathsToTry = [
      path.join(process.cwd(), '..', 'sitemap.xml'),
      path.join(process.cwd(), 'sitemap.xml'),
      path.join(process.cwd(), '..', 'fintop_frontend', 'sitemap.xml'),
    ];
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        return res.send(fs.readFileSync(p, 'utf-8'));
      }
    }
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://fintopdata.vn/</loc></url></urlset>`);
  }

  @Get('robots.txt')
  getRobots(@Res() res: any) {
    const pathsToTry = [
      path.join(process.cwd(), '..', 'robots.txt'),
      path.join(process.cwd(), 'robots.txt'),
    ];
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(fs.readFileSync(p, 'utf-8'));
      }
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send("User-agent: *\nAllow: /\nSitemap: https://fintopdata.vn/sitemap.xml\n");
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
