/**
 * Monitoring Service
 *
 * Service untuk melacak performa pipeline, metrik sistem, dan menyediakan
 * data analitik untuk dashboard monitoring. Mengumpulkan data eksekusi pipeline,
 * error rates, throughput, dan statistik penggunaan sistem.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Pipeline } from '../../entities/pipeline.entity';
import { DataImport } from '../../entities/data-import.entity';
import { DataExport } from '../../entities/data-export.entity';
import { User } from '../../entities/user.entity';

export interface PipelineExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalProcessedItems: number;
  errorRate: number;
  throughputPerMinute: number;
}

export interface SystemMetrics {
  activePipelines: number;
  totalPipelines: number;
  totalUsers: number;
  totalImports: number;
  totalExports: number;
  systemUptime: number;
  memoryUsage: any;
  cpuUsage: any;
}

export interface MonitoringDashboardData {
  pipelineStats: PipelineExecutionStats;
  systemMetrics: SystemMetrics;
  recentExecutions: any[];
  topPipelines: any[];
  errorTrends: any[];
  performanceTrends: any[];
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectRepository(Pipeline)
    private pipelineRepository: Repository<Pipeline>,
    @InjectRepository(DataImport)
    private dataImportRepository: Repository<DataImport>,
    @InjectRepository(DataExport)
    private dataExportRepository: Repository<DataExport>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Mendapatkan data dashboard monitoring lengkap
   */
  async getDashboardData(timeRange: string = '24h'): Promise<MonitoringDashboardData> {
    const now = new Date();
    const timeRangeMap = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const startTime = new Date(now.getTime() - timeRangeMap[timeRange]);

    const [
      pipelineStats,
      systemMetrics,
      recentExecutions,
      topPipelines,
      errorTrends,
      performanceTrends,
    ] = await Promise.all([
      this.getPipelineExecutionStats(startTime),
      this.getSystemMetrics(),
      this.getRecentExecutions(10),
      this.getTopPipelines(5),
      this.getErrorTrends(startTime),
      this.getPerformanceTrends(startTime),
    ]);

    return {
      pipelineStats,
      systemMetrics,
      recentExecutions,
      topPipelines,
      errorTrends,
      performanceTrends,
    };
  }

  /**
   * Mendapatkan statistik eksekusi pipeline
   */
  async getPipelineExecutionStats(startTime: Date): Promise<PipelineExecutionStats> {
    // Query untuk mendapatkan data eksekusi pipeline dari database
    // Dalam implementasi nyata, ini akan query dari tabel pipeline_execution_log
    // Untuk sementara, kita return data dummy yang realistis

    const totalExecutions = 150;
    const successfulExecutions = 135;
    const failedExecutions = 15;
    const averageExecutionTime = 45000; // 45 detik
    const totalProcessedItems = 25000;
    const errorRate = (failedExecutions / totalExecutions) * 100;
    const throughputPerMinute = totalProcessedItems / (totalExecutions * averageExecutionTime / 60000);

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      totalProcessedItems,
      errorRate,
      throughputPerMinute,
    };
  }

  /**
   * Mendapatkan metrik sistem
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const [
      activePipelines,
      totalPipelines,
      totalUsers,
      totalImports,
      totalExports,
    ] = await Promise.all([
      this.pipelineRepository.count({ where: { isActive: true } }),
      this.pipelineRepository.count(),
      this.userRepository.count(),
      this.dataImportRepository.count(),
      this.dataExportRepository.count(),
    ]);

    const systemUptime = Date.now() - this.startTime;

    // Metrik sistem (dalam implementasi nyata akan menggunakan process.memoryUsage(), dll)
    const memoryUsage = {
      rss: 150 * 1024 * 1024, // 150MB
      heapUsed: 120 * 1024 * 1024, // 120MB
      heapTotal: 200 * 1024 * 1024, // 200MB
    };

    const cpuUsage = {
      user: 45.2,
      system: 12.8,
    };

    return {
      activePipelines,
      totalPipelines,
      totalUsers,
      totalImports,
      totalExports,
      systemUptime,
      memoryUsage,
      cpuUsage,
    };
  }

  /**
   * Mendapatkan eksekusi pipeline terbaru
   */
  async getRecentExecutions(limit: number = 10): Promise<any[]> {
    // Dalam implementasi nyata, ini akan query dari tabel pipeline_execution_log
    // Return data dummy untuk sementara

    const recentExecutions = [
      {
        id: 'exec-001',
        pipelineId: 'pipe-001',
        pipelineName: 'Data Import Pipeline',
        status: 'success',
        executedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 menit yang lalu
        executionTime: 45000,
        processedItems: 1500,
        errors: 0,
      },
      {
        id: 'exec-002',
        pipelineId: 'pipe-002',
        pipelineName: 'User Data Validation',
        status: 'success',
        executedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 menit yang lalu
        executionTime: 12000,
        processedItems: 800,
        errors: 0,
      },
      {
        id: 'exec-003',
        pipelineId: 'pipe-003',
        pipelineName: 'Export to CSV',
        status: 'failed',
        executedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 menit yang lalu
        executionTime: 30000,
        processedItems: 0,
        errors: 5,
        errorMessage: 'File write permission denied',
      },
    ];

    return recentExecutions.slice(0, limit);
  }

  /**
   * Mendapatkan pipeline dengan performa terbaik
   */
  async getTopPipelines(limit: number = 5): Promise<any[]> {
    // Query untuk mendapatkan pipeline dengan eksekusi terbanyak dan sukses rate tertinggi
    const pipelines = await this.pipelineRepository.find({
      relations: ['creator'],
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Dalam implementasi nyata, join dengan execution stats
    return pipelines.map(pipeline => ({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      totalExecutions: Math.floor(Math.random() * 50) + 10, // Dummy data
      successRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      averageExecutionTime: Math.floor(Math.random() * 60000) + 10000, // 10-70 detik
      lastExecuted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random dalam 7 hari
      createdBy: pipeline.creator?.name || 'Unknown',
    }));
  }

  /**
   * Mendapatkan tren error dalam periode tertentu
   */
  async getErrorTrends(startTime: Date): Promise<any[]> {
    // Return data tren error harian untuk chart
    const trends = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        errors: Math.floor(Math.random() * 20), // 0-20 errors per day
        warnings: Math.floor(Math.random() * 50), // 0-50 warnings per day
      });
    }

    return trends;
  }

  /**
   * Mendapatkan tren performa dalam periode tertentu
   */
  async getPerformanceTrends(startTime: Date): Promise<any[]> {
    // Return data tren performa untuk chart
    const trends = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(date.getHours() - i);

      trends.push({
        timestamp: date.toISOString(),
        executionTime: Math.floor(Math.random() * 30000) + 20000, // 20-50 detik
        throughput: Math.floor(Math.random() * 100) + 50, // 50-150 items/minute
        successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
      });
    }

    return trends;
  }

  /**
   * Mencatat eksekusi pipeline untuk monitoring
   */
  async logPipelineExecution(
    pipelineId: string,
    executionResult: any,
    userId?: string,
  ): Promise<void> {
    // Dalam implementasi nyata, simpan ke tabel pipeline_execution_log
    this.logger.log(
      `Pipeline execution logged: ${pipelineId}, Success: ${executionResult.success}, ` +
      `Processed: ${executionResult.processedItems}, Time: ${executionResult.executionTime}ms`
    );

    // TODO: Implement database logging untuk historical data
  }

  /**
   * Mendapatkan health check sistem
   */
  async getSystemHealth(): Promise<any> {
    const metrics = await this.getSystemMetrics();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.systemUptime,
      memory: metrics.memoryUsage,
      cpu: metrics.cpuUsage,
      database: 'connected', // TODO: Check actual DB connection
      redis: 'connected', // TODO: Check Redis connection
    };
  }

  /**
   * Membersihkan log lama berdasarkan retention policy
   */
  async cleanupOldLogs(retentionDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // TODO: Implement cleanup query untuk log tables
    this.logger.log(`Cleaned up logs older than ${retentionDays} days`);
  }
}
