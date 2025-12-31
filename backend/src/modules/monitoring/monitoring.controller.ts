/**
 * Monitoring Controller
 *
 * Controller untuk API monitoring yang menyediakan endpoint untuk
 * dashboard monitoring, statistik performa, dan health check sistem.
 * Semua endpoint memerlukan autentikasi dan beberapa memerlukan role admin.
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@ApiBearerAuth()
@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get monitoring dashboard data',
    description: 'Mengambil data lengkap untuk dashboard monitoring termasuk statistik pipeline, metrik sistem, dan tren performa'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        pipelineStats: {
          type: 'object',
          properties: {
            totalExecutions: { type: 'number' },
            successfulExecutions: { type: 'number' },
            failedExecutions: { type: 'number' },
            averageExecutionTime: { type: 'number' },
            totalProcessedItems: { type: 'number' },
            errorRate: { type: 'number' },
            throughputPerMinute: { type: 'number' },
          },
        },
        systemMetrics: {
          type: 'object',
          properties: {
            activePipelines: { type: 'number' },
            totalPipelines: { type: 'number' },
            totalUsers: { type: 'number' },
            totalImports: { type: 'number' },
            totalExports: { type: 'number' },
            systemUptime: { type: 'number' },
            memoryUsage: { type: 'object' },
            cpuUsage: { type: 'object' },
          },
        },
        recentExecutions: { type: 'array' },
        topPipelines: { type: 'array' },
        errorTrends: { type: 'array' },
        performanceTrends: { type: 'array' },
      },
    },
  })
  async getDashboardData(@Query('timeRange') timeRange: string = '24h') {
    return this.monitoringService.getDashboardData(timeRange);
  }

  @Get('pipeline-stats')
  @ApiOperation({
    summary: 'Get pipeline execution statistics',
    description: 'Mengambil statistik eksekusi pipeline dalam periode tertentu'
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline statistics retrieved successfully',
  })
  async getPipelineStats(@Query('startTime') startTime?: string) {
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.monitoringService.getPipelineExecutionStats(start);
  }

  @Get('system-metrics')
  @ApiOperation({
    summary: 'Get system metrics',
    description: 'Mengambil metrik sistem termasuk penggunaan resource dan status komponen'
  })
  @ApiResponse({
    status: 200,
    description: 'System metrics retrieved successfully',
  })
  async getSystemMetrics() {
    return this.monitoringService.getSystemMetrics();
  }

  @Get('recent-executions')
  @ApiOperation({
    summary: 'Get recent pipeline executions',
    description: 'Mengambil daftar eksekusi pipeline terbaru'
  })
  @ApiResponse({
    status: 200,
    description: 'Recent executions retrieved successfully',
  })
  async getRecentExecutions(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.monitoringService.getRecentExecutions(limitNum);
  }

  @Get('top-pipelines')
  @ApiOperation({
    summary: 'Get top performing pipelines',
    description: 'Mengambil pipeline dengan performa terbaik berdasarkan eksekusi dan success rate'
  })
  @ApiResponse({
    status: 200,
    description: 'Top pipelines retrieved successfully',
  })
  async getTopPipelines(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.monitoringService.getTopPipelines(limitNum);
  }

  @Get('error-trends')
  @ApiOperation({
    summary: 'Get error trends over time',
    description: 'Mengambil tren error dan peringatan dalam periode tertentu untuk analisis'
  })
  @ApiResponse({
    status: 200,
    description: 'Error trends retrieved successfully',
  })
  async getErrorTrends(@Query('startTime') startTime?: string) {
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.monitoringService.getErrorTrends(start);
  }

  @Get('performance-trends')
  @ApiOperation({
    summary: 'Get performance trends over time',
    description: 'Mengambil tren performa sistem termasuk execution time dan throughput'
  })
  @ApiResponse({
    status: 200,
    description: 'Performance trends retrieved successfully',
  })
  async getPerformanceTrends(@Query('startTime') startTime?: string) {
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.monitoringService.getPerformanceTrends(start);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Get system health status',
    description: 'Mengambil status kesehatan sistem untuk monitoring dan alerting'
  })
  @ApiResponse({
    status: 200,
    description: 'System health status retrieved successfully',
  })
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('logs')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get system logs (Admin only)',
    description: 'Mengambil log sistem untuk debugging dan troubleshooting (khusus admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'System logs retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemLogs(
    @Query('level') level?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('limit') limit?: string,
  ) {
    // TODO: Implement log retrieval from database/file system
    // Untuk sementara return dummy data
    return {
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Pipeline execution completed successfully',
          source: 'pipeline-runner',
        },
        {
          timestamp: new Date(Date.now() - 10000).toISOString(),
          level: 'error',
          message: 'Database connection timeout',
          source: 'database',
        },
      ],
      total: 2,
      filtered: 2,
    };
  }
}
