/**
 * Monitoring Hooks
 *
 * Custom hooks untuk fetching data monitoring dari backend.
 * Menangani loading states, error handling, dan caching.
 */

import { useState, useEffect, useCallback } from 'react';
import { monitoringService, MonitoringDashboardData, SystemHealth } from '../services/monitoring.service';

/**
 * Hook untuk mendapatkan data dashboard monitoring
 */
export const useMonitoringDashboard = (timeRange: string = '24h') => {
  const [data, setData] = useState<MonitoringDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await monitoringService.getDashboardData(timeRange);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook untuk mendapatkan health sistem
 */
export const useSystemHealth = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const healthData = await monitoringService.getSystemHealth();
      setHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    // Poll health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);

    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    refetch: fetchHealth,
  };
};

/**
 * Hook untuk mendapatkan statistik pipeline
 */
export const usePipelineStats = (startTime?: string) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pipelineStats = await monitoringService.getPipelineStats(startTime);
      setStats(pipelineStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [startTime]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

/**
 * Hook untuk mendapatkan eksekusi terbaru
 */
export const useRecentExecutions = (limit: number = 10) => {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const recentExecutions = await monitoringService.getRecentExecutions(limit);
      setExecutions(recentExecutions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent executions');
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  return {
    executions,
    loading,
    error,
    refetch: fetchExecutions,
  };
};
