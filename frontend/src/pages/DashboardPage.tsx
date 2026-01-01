import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Upload, Settings, Users, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useMonitoringDashboard } from '../hooks/useMonitoring';
import { useNotificationStats } from '../hooks/useNotifications';
import { useNotifications } from '../hooks/useNotifications';

// Add futuristic animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10 space-y-8 p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-slate-400 text-lg">
              Your data management command center
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <div className="text-sm text-slate-300">
                <span className="text-cyan-400">●</span> System Uptime: {formatUptime(dashboardData?.systemMetrics.systemUptime || 0)}
              </div>
            </div>
            <button
              onClick={refetchDashboard}
              className="backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="group relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-cyan-500/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color.replace('bg-', 'from-').replace('-500', '-500/20')} to-${stat.color.replace('bg-', '').replace('-500', '-600/20')} backdrop-blur-sm border border-white/10`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      stat.changeType === 'positive'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {stat.change}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500">
                      from last month
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-cyan-500/10 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Pipeline Performance Trends</h3>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span className="text-sm text-slate-400">Execution Time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                  <span className="text-sm text-slate-400">Throughput</span>
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="executionTimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgExecutionTime"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#a855f7', strokeWidth: 2, fill: 'white' }}
                    name="Avg Execution Time (ms)"
                  />
                  <Line
                    type="monotone"
                    dataKey="throughput"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: 'white' }}
                    name="Throughput (items/min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-cyan-500/10 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">System Health Overview</h3>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-sm text-slate-400">Errors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-slate-400">Warnings</span>
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorTrendData}>
                  <defs>
                    <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="warningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar
                    dataKey="errors"
                    fill="url(#errorsGradient)"
                    name="Errors"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="warnings"
                    fill="url(#warningsGradient)"
                    name="Warnings"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
              {notificationStats && notificationStats.unread > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="backdrop-blur-md bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-medium border border-red-500/30">
                    {notificationStats.unread} unread
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="px-6 py-4 hover:bg-white/5 transition-all duration-300 group"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.4s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`relative p-3 rounded-xl backdrop-blur-sm border border-white/20 ${
                        activity.type === 'success' ? 'bg-green-500/20' :
                        activity.type === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          activity.type === 'success' ? 'text-green-400' :
                          activity.type === 'error' ? 'text-red-400' : 'text-blue-400'
                        }`} />

                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-xl ${
                          activity.type === 'success' ? 'bg-green-400/20' :
                          activity.type === 'error' ? 'bg-red-400/20' : 'bg-blue-400/20'
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md`}></div>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{activity.message}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">{activity.time}</p>
                      {activity.type === 'error' && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                            Attention Required
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="px-6 py-12 text-center">
                <div className="relative inline-block">
                  <Clock className="mx-auto h-16 w-16 text-slate-500" />
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-white">No recent activity</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                  Activity will appear here when pipelines run or data is processed. Start by creating your first pipeline!
                </p>
                <div className="mt-6">
                  <button className="backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20 text-white px-6 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300 hover:scale-105">
                    Create Pipeline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
