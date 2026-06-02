import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  controllers: [BlogController, ReportController],
  providers: [BlogService, ReportService],
  exports: [BlogService, ReportService],
})
export class CmsModule {}

