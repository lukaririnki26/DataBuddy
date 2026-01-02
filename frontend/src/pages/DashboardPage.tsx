import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Activity,
  Cpu,
  Zap,
  Database,
  Shield,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useMonitoringDashboard } from '../hooks/useMonitoring';
import { useNotifications } from '../hooks/useNotifications';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  Chip
} from '@mui/material';

const formatNumber = (num: number): string => {
  if (typeof num !== 'number') return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatUptime = (milliseconds: number): string => {
  if (!milliseconds || typeof milliseconds !== 'number') return '0m 0s';
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m ${seconds % 60}s`;
};

const formatRelativeTime = (timestamp: string): string => {
  if (!timestamp) return 'Unknown';
  try {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    if (isNaN(diffInMs)) return 'Invalid Date';
    const mins = Math.floor(diffInMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return time.toLocaleDateString();
  } catch (e) {
    return 'Date Error';
  }
};

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: dashboardData, loading, error, refetch } = useMonitoringDashboard();
  const { notifications } = useNotifications({ limit: 5 });
  const theme = useTheme();

  const stats = useMemo(() => {
    // Return default empty stats if data is missing to prevent crash
    if (!dashboardData) return [
      { name: 'Neural Imports', value: '0', icon: Database, color: theme.palette.info.light, bgcolor: alpha(theme.palette.info.main, 0.1), trend: '0%', href: '/data/import' },
      { name: 'Active Nodes', value: '0', icon: Cpu, color: theme.palette.success.light, bgcolor: alpha(theme.palette.success.main, 0.1), trend: '0 nodes', href: '/pipelines' },
      { name: 'Synthesized Data', value: '0', icon: Zap, color: theme.palette.secondary.light, bgcolor: alpha(theme.palette.secondary.main, 0.1), trend: '0%', href: '/monitoring' },
      { name: 'Verified Personnel', value: '0', icon: Shield, color: theme.palette.warning.light, bgcolor: alpha(theme.palette.warning.main, 0.1), trend: '0 units', href: '/admin/users' },
    ];

    return [
      { name: 'Neural Imports', value: formatNumber(dashboardData?.systemMetrics?.totalImports || 0), icon: Database, color: theme.palette.info.light, bgcolor: alpha(theme.palette.info.main, 0.1), trend: '+12.5%', href: '/data/import' },
      { name: 'Active Nodes', value: (dashboardData?.systemMetrics?.activePipelines || 0).toString(), icon: Cpu, color: theme.palette.success.light, bgcolor: alpha(theme.palette.success.main, 0.1), trend: '+3 nodes', href: '/pipelines' },
      { name: 'Synthesized Data', value: formatNumber(dashboardData?.pipelineStats?.totalProcessedItems || 0), icon: Zap, color: theme.palette.secondary.light, bgcolor: alpha(theme.palette.secondary.main, 0.1), trend: '+8.2%', href: '/monitoring' },
      { name: 'Verified Personnel', value: (dashboardData?.systemMetrics?.totalUsers || 0).toString(), icon: Shield, color: theme.palette.warning.light, bgcolor: alpha(theme.palette.warning.main, 0.1), trend: '+2 units', href: '/admin/users' },
    ];
  }, [dashboardData, theme]);

  const activities = useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return notifications.slice(0, 5).map(n => ({
      id: n.id,
      title: n.title || 'Untitled Notification',
      message: n.message || 'No details provided',
      time: formatRelativeTime(n.createdAt),
      status: (n.type || '').includes('COMPLETED') ? 'success' : (n.type || '').includes('FAILED') ? 'error' : 'info'
    }));
  }, [notifications]);

  if (loading && !dashboardData) return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={64} thickness={4} sx={{ color: theme.palette.primary.main, mb: 2 }} />
        <Typography variant="overline" color="text.secondary" fontWeight="900" letterSpacing={1.2}>
          Synchronizing Neural Dashboard...
        </Typography>
      </Box>
    </Box>
  );


  return (
    <Box sx={{ width: '100%', ml: 0, mr: 'auto' }}>
      {/* Header */}
      <Grid container spacing={3} alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Grid item>
          <Typography variant="h3" fontWeight="900" sx={{
            background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            System Command Center
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={500}>
            Monitoring global data orchestration and system health
          </Typography>
        </Grid>
        <Grid item>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{
              px: 3, py: 1.5,
              bgcolor: alpha(theme.palette.common.white, 0.05),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              borderRadius: '1rem',
              display: 'flex', alignItems: 'center', gap: 1.5
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.success.main, animation: 'pulse 2s infinite' }} />
              <Typography variant="caption" fontWeight="900" sx={{ letterSpacing: '0.1em', color: 'text.secondary', textTransform: 'uppercase' }}>
                Live Uptime: {formatUptime(dashboardData?.systemMetrics?.systemUptime || 0)}
              </Typography>
            </Box>
            <IconButton onClick={() => refetch()} sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: '1rem',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}>
              <RefreshCw size={20} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* Stats Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={6} xl={3} key={idx}>
            <Card
              component={Link}
              to={stat.href}
              sx={{
                display: 'block',
                textDecoration: 'none',
                height: '100%',
                p: 3,
                borderRadius: '2rem',
                bgcolor: alpha(theme.palette.common.white, 0.05),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scale(1.05)', bgcolor: alpha(theme.palette.common.white, 0.08) }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 2, borderRadius: '1.5rem', bgcolor: stat.bgcolor, color: stat.color }}>
                  <stat.icon size={24} />
                </Box>
                <Chip
                  label={stat.trend}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.light,
                    fontWeight: 900,
                    borderRadius: '999px',
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  }}
                />
              </Box>
              <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {stat.name}
              </Typography>
              <Typography variant="h3" fontWeight="900" sx={{ color: 'white', mt: 1 }}>
                {stat.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Main Chart Area */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            height: '100%',
            borderRadius: '2.5rem',
            bgcolor: alpha(theme.palette.common.white, 0.05),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            p: 2
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="900" fontStyle="italic">Performance Architecture</Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                    <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Throughput</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.secondary.main }} />
                    <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Latency</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData?.performanceTrends?.map(t => ({ name: new Date(t.timestamp).toLocaleTimeString(), throughput: t.throughput, latency: t.executionTime })) || []}>
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
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: theme.palette.background.default, border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, borderRadius: '16px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="throughput" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={3} />
                    <Area type="monotone" dataKey="latency" stroke={theme.palette.secondary.main} fillOpacity={1} fill="url(#colorLatency)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>

              <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 3, borderRadius: '1.5rem', bgcolor: alpha('#0f172a', 0.5), border: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>
                    <Typography variant="h4" fontWeight="900" color="primary.main" gutterBottom>98.2%</Typography>
                    <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Node Accuracy</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 3, borderRadius: '1.5rem', bgcolor: alpha('#0f172a', 0.5), border: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>
                    <Typography variant="h4" fontWeight="900" color="secondary.main" gutterBottom>0.12ms</Typography>
                    <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Synapse Delay</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            height: '100%',
            borderRadius: '2.5rem',
            bgcolor: alpha(theme.palette.common.white, 0.05),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
          }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="900" fontStyle="italic">Activity Stream</Typography>
                <Activity color={theme.palette.text.secondary} size={20} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
                {activities.map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{
                      mt: 1, width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      bgcolor: a.status === 'success' ? theme.palette.success.main : a.status === 'error' ? theme.palette.error.main : theme.palette.info.main,
                      boxShadow: `0 0 10px ${alpha(a.status === 'success' ? theme.palette.success.main : a.status === 'error' ? theme.palette.error.main : theme.palette.info.main, 0.5)}`
                    }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>{a.title}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1 }}>{a.message}</Typography>
                      <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>{a.time}</Typography>
                    </Box>
                  </Box>
                ))}
                {activities.length === 0 && (
                  <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Box sx={{
                      width: 48, height: 48, mx: 'auto', mb: 2,
                      bgcolor: theme.palette.background.paper, borderRadius: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Clock color={theme.palette.text.secondary} />
                    </Box>
                    <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Awaiting Signal...</Typography>
                  </Box>
                )}
              </Box>

              <Button
                component={Link}
                to="/monitoring"
                fullWidth
                sx={{
                  mt: 4, py: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.05),
                  color: 'text.secondary',
                  borderRadius: '1rem',
                  fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em',
                  '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1), color: 'white' }
                }}
              >
                Initialize Full log
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
