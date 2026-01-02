import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import {
  Upload,
  Settings,
  Users,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Cpu,
  Zap,
  Globe,
  Database,
  Terminal,
  Shield,
} from 'lucide-react';
import { useMonitoringDashboard } from '../hooks/useMonitoring';
import { useNotificationStats } from '../hooks/useNotifications';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Global Dashboard for System Command Center
 */

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatUptime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m ${seconds % 60}s`;
};

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMs = now.getTime() - time.getTime();
  const mins = Math.floor(diffInMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return time.toLocaleDateString();
};

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: dashboardData, loading, error, refetch } = useMonitoringDashboard();
  const { stats: notificationStats } = useNotificationStats();
  const { notifications } = useNotifications({ limit: 5 });

  const stats = useMemo(() => {
    if (!dashboardData) return [];
    return [
      { name: 'Neural Imports', value: formatNumber(dashboardData.systemMetrics.totalImports), icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12.5%', href: '/data/import' },
      { name: 'Active Nodes', value: dashboardData.systemMetrics.activePipelines.toString(), icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+3 nodes', href: '/pipelines' },
      { name: 'Synthesized Data', value: formatNumber(dashboardData.pipelineStats.totalProcessedItems), icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+8.2%', href: '/monitoring' },
      { name: 'Verified Personnel', value: dashboardData.systemMetrics.totalUsers.toString(), icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10', trend: '+2 units', href: '/admin/users' },
    ];
  }, [dashboardData]);

  const activities = useMemo(() => {
    if (!notifications) return [];
    return notifications.slice(0, 5).map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: formatRelativeTime(n.createdAt),
      status: n.type.includes('COMPLETED') ? 'success' : n.type.includes('FAILED') ? 'error' : 'info'
    }));
  }, [notifications]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] p-8 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Synchronizing Neural Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
      <div className="relative z-10 p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
              System Command Center
            </h1>
            <p className="text-slate-400 text-lg font-medium">Monitoring global data orchestration and system health</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-6 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Live Uptime: {formatUptime(dashboardData?.systemMetrics.systemUptime || 0)}</span>
            </div>
            <button onClick={() => refetch()} className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl transition-all">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <Link key={idx} to={stat.href} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4 hover:bg-white/8 transition-all hover:scale-105 group cursor-pointer block">
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{stat.trend}</div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.name}</h4>
                <div className="text-3xl font-black text-white group-hover:text-blue-200 transition-colors">{stat.value}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white italic tracking-tighter">Performance Architecture</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div> Throughput
                </div>
                <div className="flex items-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div> Latency
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.performanceTrends?.map(t => ({ name: new Date(t.timestamp).toLocaleTimeString(), throughput: t.throughput, latency: t.executionTime })) || []}>
                  <defs>
                    <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="throughput" stroke="#3b82f6" fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={3} />
                  <Area type="monotone" dataKey="latency" stroke="#a855f7" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5">
                <div className="text-blue-400 font-black text-2xl mb-1">98.2%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Accuracy</div>
              </div>
              <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5">
                <div className="text-purple-400 font-black text-2xl mb-1">0.12ms</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synapse Delay</div>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white italic tracking-tighter">Activity Stream</h3>
              <Activity className="w-5 h-5 text-slate-500" />
            </div>

            <div className="space-y-6">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.status === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : a.status === 'error' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">{a.title}</div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{a.message}</p>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{a.time}</div>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 text-slate-700" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Awaiting Signal...</p>
                </div>
              )}
            </div>

            <Link to="/monitoring" className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all text-center block">
              Initialize Full log
            </Link>
          </div>
        </div>

        {/* Global Network Visual */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[#0f172a]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233B82F6' fill-opacity='0.05'%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, opacity: 0.5 }}></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <h3 className="text-3xl font-black text-white tracking-tighter">Global Data Matrix</h3>
              <p className="text-slate-400 font-medium leading-relaxed">System is currently processing information across 12 distributed nodes with zero identified protocol breaches in the last 24 cycles.</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-xs font-black text-emerald-400 uppercase tracking-widest">
                  <Globe className="w-4 h-4 mr-2" /> 12 Active Hubs
                </div>
                <div className="flex items-center text-xs font-black text-blue-400 uppercase tracking-widest">
                  <Terminal className="w-4 h-4 mr-2" /> Safe Protocol
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse"></div>
              <div className="w-48 h-48 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center relative z-10">
                <div className="text-center">
                  <div className="text-4xl font-black text-white tracking-tighter">100%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
