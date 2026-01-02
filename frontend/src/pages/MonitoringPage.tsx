import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    Cpu,
    Database,
    Zap,
    Shield,
    RefreshCw,
    Clock,
    AlertCircle,
    CheckCircle,
    BarChart3,
    Terminal,
    Server,
    Network
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { useMonitoringDashboard, useSystemHealth } from '../hooks/useMonitoring';

const MonitoringPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const { data, loading, error, refetch } = useMonitoringDashboard(timeRange);
    const { health, loading: healthLoading } = useSystemHealth();

    const formatUptime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h`;
        return `${hours}h ${minutes % 60}m`;
    };

    const performanceData = useMemo(() => {
        if (!data?.performanceTrends) return [];
        return data.performanceTrends.map(t => ({
            time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            throughput: t.throughput,
            latency: t.executionTime,
            reliability: t.successRate * 100
        }));
    }, [data]);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Uplinking to Neural Monitoring...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent italic tracking-tight">
                            NEURAL MONITORING
                        </h1>
                        <p className="text-slate-400 font-medium">Real-time system health and performance architecture</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                            {['1h', '24h', '7d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${timeRange === range
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {range.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl transition-all group"
                        >
                            <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* Global Health Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <HealthCard
                        title="SYSTEM STATUS"
                        value={health?.status === 'healthy' ? 'OPERATIONAL' : 'DEGRADED'}
                        icon={Server}
                        color={health?.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}
                        loading={healthLoading}
                    />
                    <HealthCard
                        title="SYSTEM UPTIME"
                        value={formatUptime(health?.uptime || 0)}
                        icon={Clock}
                        color="text-blue-400"
                        loading={healthLoading}
                    />
                    <HealthCard
                        title="DATA THROUGHPUT"
                        value={`${data?.pipelineStats?.throughputPerMinute || 0} req/m`}
                        icon={Zap}
                        color="text-purple-400"
                        loading={loading}
                    />
                    <HealthCard
                        title="ERROR RATE"
                        value={`${(data?.pipelineStats?.errorRate || 0).toFixed(2)}%`}
                        icon={AlertCircle}
                        color={data?.pipelineStats?.errorRate && data.pipelineStats.errorRate > 5 ? 'text-red-400' : 'text-slate-300'}
                        loading={loading}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <BarChart3 className="w-8 h-8 text-white/5 group-hover:text-indigo-500/20 transition-colors" />
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold italic tracking-tight">Performance Topology</h3>
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Throughput
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div> Latency
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={performanceData}>
                                            <defs>
                                                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '16px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="throughput"
                                                stroke="#6366f1"
                                                fillOpacity={1}
                                                fill="url(#colorThroughput)"
                                                strokeWidth={3}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="latency"
                                                stroke="#a855f7"
                                                fillOpacity={1}
                                                fill="url(#colorLatency)"
                                                strokeWidth={3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Resource Allocation</h3>
                                <div className="space-y-4">
                                    <ResourceMetric label="CPU Clusters" value={health?.cpu?.user || 0} color="bg-indigo-500" />
                                    <ResourceMetric label="Neural Memory" value={(health?.memory?.heapUsed / health?.memory?.heapTotal * 100) || 0} color="bg-purple-500" />
                                </div>
                            </div>
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Database Synchrony</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Database className="w-5 h-5 text-indigo-400" />
                                        <span className="text-xs font-bold">Main Node</span>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase">Connected</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Network className="w-5 h-5 text-purple-400" />
                                        <span className="text-xs font-bold">Cache Layer</span>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase">Connected</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Neural Logs */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 flex flex-col max-h-[850px]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-bold italic tracking-tight">Neural Logs</h3>
                            </div>
                            <Activity className="w-4 h-4 text-slate-600 animate-pulse" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {data?.recentExecutions?.map((exec, idx) => (
                                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${exec.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {exec.status}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-medium">{new Date(exec.executedAt).toLocaleTimeString()}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-indigo-300 transition-colors">{exec.pipelineName}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-1">{exec.processedItems} units synthesized in {exec.executionTime}ms</p>
                                </div>
                            ))}

                            {(!data?.recentExecutions || data.recentExecutions.length === 0) && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 italic py-20">
                                    <Network className="w-12 h-12 mb-4 opacity-10" />
                                    <p className="text-xs font-black uppercase tracking-widest">No active logs detected</p>
                                </div>
                            )}
                        </div>

                        <Link to="/dashboard" className="w-full py-4 bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 transition-all hover:scale-[1.02] active:scale-95 text-center block">
                            Access History Matrix
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface HealthCardProps {
    title: string;
    value: string;
    icon: any;
    color: string;
    loading?: boolean;
}

const HealthCard: React.FC<HealthCardProps> = ({ title, value, icon: Icon, color, loading }) => (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 hover:bg-white/8 transition-all group">
        <div className="flex items-center justify-between">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="w-6 h-6 rounded-full border border-white/5 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`}></div>
            </div>
        </div>
        <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</h4>
            <div className={`text-xl font-bold tracking-tight ${loading ? 'opacity-20 animate-pulse' : ''}`}>{value}</div>
        </div>
    </div>
);

const ResourceMetric: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>{label}</span>
            <span className="text-white italic">{Math.round(value)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
                className={`h-full ${color} transition-all duration-1000 ease-out`}
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

export default MonitoringPage;
