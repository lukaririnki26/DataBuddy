import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    Cpu,
    Database,
    Zap,
    RefreshCw,
    Clock,
    AlertCircle,
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
} from 'recharts';
import { useMonitoringDashboard, useSystemHealth } from '../hooks/useMonitoring';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    IconButton,
    Chip,
    LinearProgress,
    useTheme,
    alpha,
    CircularProgress
} from '@mui/material';

const MonitoringPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const { data, loading, error, refetch } = useMonitoringDashboard(timeRange);
    const { health, loading: healthLoading } = useSystemHealth();
    const theme = useTheme();

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
            <Box sx={{
                minHeight: '100vh',
                bgcolor: theme.palette.background.default,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main, mb: 2 }} />
                    <Typography variant="overline" color="text.secondary" fontWeight="900" letterSpacing={1.2}>
                        Uplinking to Neural Monitoring...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: theme.palette.background.default,
        }}>
            <Box sx={{ width: '100%' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 3, mb: 6 }}>
                    <Box>
                        <Typography variant="h3" fontWeight="900" sx={{
                            background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                            mb: 0.5
                        }}>
                            Neural Monitoring
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" fontWeight="medium" sx={{ opacity: 0.7 }}>
                            Real-time system health and performance architecture
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.1), p: 0.5, borderRadius: '1rem', display: 'flex', gap: 0.5 }}>
                            {['1h', '24h', '7d'].map((range) => (
                                <Button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    size="small"
                                    sx={{
                                        minWidth: 0,
                                        px: 2,
                                        borderRadius: '0.75rem',
                                        color: timeRange === range ? 'white' : 'text.secondary',
                                        bgcolor: timeRange === range ? theme.palette.primary.main : 'transparent',
                                        fontWeight: 'bold',
                                        '&:hover': { bgcolor: timeRange === range ? theme.palette.primary.dark : alpha(theme.palette.common.white, 0.05) }
                                    }}
                                >
                                    {range}
                                </Button>
                            ))}
                        </Box>
                        <IconButton
                            onClick={() => refetch()}
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.light,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                borderRadius: '1rem',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                        >
                            <RefreshCw size={20} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Global Health Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} lg={3}>
                        <HealthCard
                            title="SYSTEM STATUS"
                            value={health?.status === 'healthy' ? 'OPERATIONAL' : 'DEGRADED'}
                            icon={Server}
                            color={health?.status === 'healthy' ? theme.palette.success.main : theme.palette.warning.main}
                            loading={healthLoading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <HealthCard
                            title="SYSTEM UPTIME"
                            value={formatUptime(health?.uptime || 0)}
                            icon={Clock}
                            color={theme.palette.info.main}
                            loading={healthLoading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <HealthCard
                            title="DATA THROUGHPUT"
                            value={`${data?.pipelineStats?.throughputPerMinute || 0} req/m`}
                            icon={Zap}
                            color={theme.palette.secondary.main}
                            loading={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <HealthCard
                            title="ERROR RATE"
                            value={`${(data?.pipelineStats?.errorRate || 0).toFixed(2)}%`}
                            icon={AlertCircle}
                            color={data?.pipelineStats?.errorRate && data.pipelineStats.errorRate > 5 ? theme.palette.error.main : theme.palette.text.disabled}
                            loading={loading}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={4}>
                    {/* Main Chart Area */}
                    <Grid item xs={12} lg={8}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.03),
                                backdropFilter: 'blur(32px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                overflow: 'visible'
                            }}>
                                <CardContent sx={{ p: 4, position: 'relative' }}>
                                    <Box sx={{ position: 'absolute', top: 0, right: 0, p: 4 }}>
                                        <BarChart3 className="w-8 h-8 text-white/5" />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                        <Typography variant="h5" fontWeight="900" fontStyle="italic">Performance Topology</Typography>
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main, boxShadow: `0 0 10px ${theme.palette.primary.main}` }} />
                                                <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Throughput</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.secondary.main, boxShadow: `0 0 10px ${theme.palette.secondary.main}` }} />
                                                <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Latency</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ height: 350, width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={performanceData}>
                                                <defs>
                                                    <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.common.white, 0.05)} vertical={false} />
                                                <XAxis dataKey="time" stroke={alpha(theme.palette.common.white, 0.3)} fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke={alpha(theme.palette.common.white, 0.3)} fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: theme.palette.background.default,
                                                        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                                                        borderRadius: '16px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="throughput" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={3} />
                                                <Area type="monotone" dataKey="latency" stroke={theme.palette.secondary.main} fillOpacity={1} fill="url(#colorLatency)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{
                                        borderRadius: '2rem',
                                        bgcolor: alpha(theme.palette.common.white, 0.03),
                                        backdropFilter: 'blur(32px)',
                                        border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase', mb: 3, display: 'block' }}>Resource Allocation</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <ResourceMetric label="CPU Clusters" value={health?.cpu?.user || 0} color={theme.palette.primary.main} />
                                                <ResourceMetric label="Neural Memory" value={(health?.memory?.heapUsed / health?.memory?.heapTotal * 100) || 0} color={theme.palette.secondary.main} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{
                                        borderRadius: '2rem',
                                        bgcolor: alpha(theme.palette.common.white, 0.03),
                                        backdropFilter: 'blur(32px)',
                                        border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase', mb: 3, display: 'block' }}>Database Synchrony</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Database size={16} color={theme.palette.primary.light} />
                                                        <Typography variant="caption" fontWeight="900">Main Node</Typography>
                                                    </Box>
                                                    <Chip label="Connected" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.light, fontWeight: 900, fontSize: '0.625rem', height: 20 }} />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Network size={16} color={theme.palette.secondary.light} />
                                                        <Typography variant="caption" fontWeight="900">Cache Layer</Typography>
                                                    </Box>
                                                    <Chip label="Connected" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.light, fontWeight: 900, fontSize: '0.625rem', height: 20 }} />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Neural Logs */}
                    <Grid item xs={12} lg={4}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: '2.5rem',
                            bgcolor: alpha(theme.palette.common.white, 0.03),
                            backdropFilter: 'blur(32px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Terminal size={20} color={theme.palette.primary.light} />
                                        <Typography variant="h5" fontWeight="900" fontStyle="italic">Neural Logs</Typography>
                                    </Box>
                                    <Activity size={16} color={theme.palette.text.secondary} />
                                </Box>

                                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {data?.recentExecutions?.map((exec, idx) => (
                                        <Box key={idx} sx={{
                                            p: 2, borderRadius: '1rem',
                                            bgcolor: alpha(theme.palette.common.white, 0.05),
                                            border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                                            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.08) },
                                            transition: 'all 0.2s'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Chip
                                                    label={exec.status}
                                                    size="small"
                                                    sx={{
                                                        height: 20, fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase',
                                                        bgcolor: exec.status === 'success' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                                        color: exec.status === 'success' ? theme.palette.success.light : theme.palette.error.light,
                                                        border: `1px solid ${exec.status === 'success' ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary" fontWeight="medium">{new Date(exec.executedAt).toLocaleTimeString()}</Typography>
                                            </Box>
                                            <Typography variant="subtitle2" color="text.primary" fontWeight="bold" gutterBottom>{exec.pipelineName}</Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                                {exec.processedItems} units synthesized in {exec.executionTime}ms
                                            </Typography>
                                        </Box>
                                    ))}

                                    {(!data?.recentExecutions || data.recentExecutions.length === 0) && (
                                        <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                                            <Network size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                            <Typography variant="caption" fontWeight="900" textTransform="uppercase">No active logs detected</Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Button
                                    component={Link}
                                    to="/dashboard"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 4, py: 1.5,
                                        borderRadius: '1rem',
                                        fontWeight: 900, letterSpacing: '0.1em', fontSize: '0.625rem',
                                        bgcolor: theme.palette.primary.main,
                                        '&:hover': { bgcolor: theme.palette.primary.dark }
                                    }}
                                >
                                    Access History Matrix
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

interface HealthCardProps {
    title: string;
    value: string;
    icon: any;
    color: string;
    loading?: boolean;
}

const HealthCard: React.FC<HealthCardProps> = ({ title, value, icon: Icon, color, loading }) => {
    const theme = useTheme();
    return (
        <Card sx={{
            borderRadius: '2rem',
            bgcolor: alpha(theme.palette.common.white, 0.03),
            backdropFilter: 'blur(32px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.06),
                transform: 'translateY(-4px)',
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)'
            }
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        p: 1.5, borderRadius: '1rem',
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                        color: color
                    }}>
                        <Icon size={20} />
                    </Box>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, animation: 'pulse 2s infinite' }} />
                    </Box>
                </Box>
                <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mb: 0.5, opacity: 0.7 }}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight="900" sx={{ opacity: loading ? 0.3 : 1, color: 'white' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

const ResourceMetric: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
    const theme = useTheme();
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ color: 'white' }}>{Math.round(value)}%</Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                    height: 6,
                    borderRadius: '999px',
                    bgcolor: alpha(theme.palette.common.white, 0.05),
                    '& .MuiLinearProgress-bar': {
                        bgcolor: color,
                        borderRadius: '999px'
                    }
                }}
            />
        </Box>
    );
};

export default MonitoringPage;
