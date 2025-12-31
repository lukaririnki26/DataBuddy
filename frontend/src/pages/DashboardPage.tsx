import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Upload, Settings, Users, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useMonitoringDashboard, useNotificationStats } from '../hooks/useMonitoring';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Format number dengan K/M suffix untuk display
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format uptime dari milliseconds ke readable string
 */
const formatUptime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Format timestamp ke relative time
 */
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMs = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return time.toLocaleDateString();
};

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch real data dari API
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useMonitoringDashboard();
  const { stats: notificationStats } = useNotificationStats();
  const { notifications } = useNotifications({ limit: 5 });

  // Prepare stats cards data
  const stats = useMemo(() => {
    if (!dashboardData) return [];

    return [
      {
        name: 'Total Imports',
        value: formatNumber(dashboardData.systemMetrics.totalImports),
        icon: Upload,
        color: 'bg-blue-500',
        change: '+12%',
        changeType: 'positive' as const,
      },
      {
        name: 'Active Pipelines',
        value: dashboardData.systemMetrics.activePipelines.toString(),
        icon: Settings,
        color: 'bg-green-500',
        change: '+3',
        changeType: 'positive' as const,
      },
      {
        name: 'Data Processed',
        value: formatNumber(dashboardData.pipelineStats.totalProcessedItems),
        icon: TrendingUp,
        color: 'bg-purple-500',
        change: '+8.2%',
        changeType: 'positive' as const,
      },
      {
        name: 'Active Users',
        value: dashboardData.systemMetrics.totalUsers.toString(),
        icon: Users,
        color: 'bg-orange-500',
        change: '+2',
        changeType: 'positive' as const,
      },
    ];
  }, [dashboardData]);

  // Prepare recent activity dari notifications
  const recentActivity = useMemo(() => {
    if (!notifications) return [];

    return notifications.slice(0, 5).map(notification => ({
      id: notification.id,
      action: notification.title,
      message: notification.message,
      time: formatRelativeTime(notification.createdAt),
      type: notification.priority === 'HIGH' ? 'error' :
            notification.type.includes('FAILED') ? 'error' :
            notification.type.includes('COMPLETED') ? 'success' : 'info',
      icon: notification.type.includes('FAILED') ? AlertCircle :
            notification.type.includes('COMPLETED') ? CheckCircle : Clock,
    }));
  }, [notifications]);

  // Prepare chart data dari performance trends
  const chartData = useMemo(() => {
    if (!dashboardData?.performanceTrends) return [];

    // Group by day untuk chart
    const dailyData: Record<string, any> = {};

    dashboardData.performanceTrends.forEach(trend => {
      const date = new Date(trend.timestamp).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          name: new Date(date).toLocaleDateString('en-US', { month: 'short' }),
          executions: 0,
          avgExecutionTime: 0,
          throughput: 0,
          count: 0,
        };
      }

      dailyData[date].executions += 1;
      dailyData[date].avgExecutionTime += trend.executionTime;
      dailyData[date].throughput += trend.throughput;
      dailyData[date].count += 1;
    });

    return Object.values(dailyData).map((day: any) => ({
      ...day,
      avgExecutionTime: Math.round(day.avgExecutionTime / day.count),
      throughput: Math.round(day.throughput / day.count),
    }));
  }, [dashboardData?.performanceTrends]);

  // Prepare error trends chart
  const errorTrendData = useMemo(() => {
    if (!dashboardData?.errorTrends) return [];

    return dashboardData.errorTrends.map(trend => ({
      name: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      errors: trend.errors,
      warnings: trend.warnings,
    }));
  }, [dashboardData?.errorTrends]);

  // File types distribution (dummy data untuk sementara)
  const fileTypeData = [
    { name: 'CSV Files', value: 65, color: '#8884d8' },
    { name: 'Excel Files', value: 25, color: '#82ca9d' },
    { name: 'JSON Files', value: 10, color: '#ffc658' },
  ];

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
        </div>

        {/* Loading skeleton untuk stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
                  <div className="ml-4 flex-1">
                    <div className="bg-gray-200 h-4 w-20 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-6 w-16 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading skeleton untuk charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="bg-gray-200 h-6 w-48 mb-4 rounded"></div>
                <div className="bg-gray-200 h-64 w-full rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Failed to load dashboard data
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {dashboardError}
              </p>
              <button
                onClick={refetchDashboard}
                className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            System Uptime: {formatUptime(dashboardData?.systemMetrics.systemUptime || 0)}
          </div>
          <button
            onClick={refetchDashboard}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avgExecutionTime"
                stroke="#8884d8"
                name="Avg Execution Time (ms)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke="#82ca9d"
                name="Throughput (items/min)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Error & Warning Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errorTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errors" fill="#ef4444" name="Errors" />
              <Bar dataKey="warnings" fill="#f59e0b" name="Warnings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            {notificationStats && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {notificationStats.unread} unread
              </span>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length > 0 ? recentActivity.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-1 rounded-full mr-3 ${
                      activity.type === 'success' ? 'bg-green-100' :
                      activity.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        activity.type === 'success' ? 'text-green-600' :
                        activity.type === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.message}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          }) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Activity will appear here when pipelines run or data is processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
