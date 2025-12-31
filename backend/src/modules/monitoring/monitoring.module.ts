/**
 * Monitoring Module
 *
 * Modul untuk monitoring sistem DataBuddy yang mencakup:
 * - Tracking performa pipeline
 * - Metrik sistem dan resource usage
 * - Dashboard monitoring
 * - Health check endpoints
 * - Logging dan alerting
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

// Import entities yang dibutuhkan untuk monitoring
import { Pipeline } from '../../entities/pipeline.entity';
import { DataImport } from '../../entities/data-import.entity';
import { DataExport } from '../../entities/data-export.entity';
import { User } from '../../entities/user.entity';
import { Notification } from '../../entities/notification.entity';

@Module({
  imports: [
    // Register entities untuk akses database di monitoring service
    TypeOrmModule.forFeature([
      Pipeline,
      DataImport,
      DataExport,
      User,
      Notification,
    ]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService], // Export service agar bisa digunakan di module lain
})
export class MonitoringModule {}
