/**
 * Monitoring API Service
 *
 * Service untuk berkomunikasi dengan monitoring endpoints di backend.
 * Menangani fetching data dashboard, statistik pipeline, dan metrik sistem.
 */

import { api } from './api';

// Types
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
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
}

export interface RecentExecution {
  id: string;
  pipelineId: string;
  pipelineName: string;
  status: 'success' | 'failed' | 'running';
  executedAt: string;
  executionTime: number;
  processedItems: number;
  errors: number;
  errorMessage?: string;
}

export interface TopPipeline {
  id: string;
  name: string;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted: string;
  createdBy: string;
}

export interface ErrorTrend {
  date: string;
  errors: number;
  warnings: number;
}

export interface PerformanceTrend {
  timestamp: string;
  executionTime: number;
  throughput: number;
  successRate: number;
}

export interface MonitoringDashboardData {
  pipelineStats: PipelineExecutionStats;
  systemMetrics: SystemMetrics;
  recentExecutions: RecentExecution[];
  topPipelines: TopPipeline[];
  errorTrends: ErrorTrend[];
  performanceTrends: PerformanceTrend[];
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  uptime: number;
  memory: any;
  cpu: any;
  database: string;
  redis: string;
}

/**
 * Monitoring Service Class
 */
export class MonitoringService {
  /**
   * Get complete dashboard data
   */
  async getDashboardData(timeRange: string = '24h'): Promise<MonitoringDashboardData> {
    return api.get<MonitoringDashboardData>(`/monitoring/dashboard`, { timeRange });
  }

  /**
   * Get pipeline execution statistics
   */
  async getPipelineStats(startTime?: string): Promise<PipelineExecutionStats> {
    const params = startTime ? { startTime } : {};
    return api.get<PipelineExecutionStats>(`/monitoring/pipeline-stats`, params);
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    return api.get<SystemMetrics>(`/monitoring/system-metrics`);
  }

  /**
   * Get recent pipeline executions
   */
  async getRecentExecutions(limit: number = 10): Promise<RecentExecution[]> {
    return api.get<RecentExecution[]>(`/monitoring/recent-executions`, { limit });
  }

  /**
   * Get top performing pipelines
   */
  async getTopPipelines(limit: number = 5): Promise<TopPipeline[]> {
    return api.get<TopPipeline[]>(`/monitoring/top-pipelines`, { limit });
  }

  /**
   * Get error trends over time
   */
  async getErrorTrends(startTime?: string): Promise<ErrorTrend[]> {
    const params = startTime ? { startTime } : {};
    return api.get<ErrorTrend[]>(`/monitoring/error-trends`, params);
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(startTime?: string): Promise<PerformanceTrend[]> {
    const params = startTime ? { startTime } : {};
    return api.get<PerformanceTrend[]>(`/monitoring/performance-trends`, params);
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return api.get<SystemHealth>(`/monitoring/health`);
  }

  /**
   * Get system logs (admin only)
   */
  async getSystemLogs(filters?: {
    level?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): Promise<any> {
    return api.get(`/monitoring/logs`, filters);
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
