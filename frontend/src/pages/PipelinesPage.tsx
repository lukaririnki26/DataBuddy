import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePipelines } from '../hooks/usePipelines';
import { pipelinesService } from '../services/pipelines.service';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Edit,
  Copy,
  Trash2,
  Eye,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Activity,
  Box as BoxIcon,
  Cpu,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Skeleton,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';

/**
 * Premium Status Badge Component
 */
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border"
      style={{
        backgroundColor: isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.text.secondary, 0.1),
        color: isActive ? theme.palette.success.light : theme.palette.text.secondary,
        borderColor: isActive ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.text.secondary, 0.2),
        boxShadow: isActive ? `0 0 15px ${alpha(theme.palette.success.main, 0.1)}` : 'none'
      }}
    >
      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: isActive ? theme.palette.success.light : theme.palette.text.secondary }}
      ></div>
      {isActive ? 'Active' : 'Draft'}
    </span>
  );
};

const PipelinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  const { pipelines, loading, refreshPipelines } = usePipelines();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const theme = useTheme();

  const filteredPipelines = useMemo(() => {
    return (pipelines || []).filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || p.status === filterType;
      return matchesSearch && matchesType;
    });
  }, [pipelines, searchQuery, filterType]);

  const handleExecute = async (id: string, name: string) => {
    info('Execution Initialized', `Starting pipeline execution for "${name}"`);
    try {
      const result = await pipelinesService.executePipeline(id, { inputData: [], parameters: {} });
      if (result.success) {
        success('Execution Success', `"${name}" processed ${result.processedItems} items successfully`);
      } else {
        toastError('Execution Error', `Failed to run "${name}"`);
      }
    } catch (err: any) {
      toastError('System Error', err.message || 'An unexpected error occurred during execution');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete blueprint "${name}"?`)) {
      try {
        await pipelinesService.deletePipeline(id);
        success('Blueprint Deleted', `"${name}" has been permanently removed`);
        refreshPipelines();
      } catch (err) {
        toastError('Delete Failed', 'Operational failure while clearing blueprint nodes');
      }
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.background.default,
      backgroundAttachment: 'fixed',
      color: 'text.primary',
      p: 4
    }}>
      {/* Background Ambience */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', top: 0, right: 0, width: 500, height: 500,
          bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '50%', filter: 'blur(100px)',
          animation: 'blob 7s infinite'
        }} />
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, width: 500, height: 500,
          bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: '50%', filter: 'blur(100px)',
          animation: 'blob 7s infinite 4s'
        }} />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 10, maxWidth: 'lg', mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { lg: 'center' }, gap: 3, mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
              Operational Blueprints
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="medium">
              Manage and monitor your intelligent data processing sequences
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={() => refreshPipelines()} sx={{ bgcolor: alpha(theme.palette.common.white, 0.05), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
              <RefreshCw size={20} />
            </IconButton>
            <Button
              component={Link}
              to="/pipelines/builder/new"
              variant="contained"
              startIcon={<Plus size={20} />}
              sx={{
                borderRadius: '16px',
                px: 3, py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Genesis Blueprint
            </Button>
          </Box>
        </Box>

        {/* Filters & Command Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          <TextField
            placeholder="Query blueprints by name or logic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="filled"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              disableUnderline: true,
              sx: { borderRadius: '2rem' }
            }}
            sx={{
              '& .MuiFilledInput-root': {
                borderRadius: '2rem',
                bgcolor: alpha(theme.palette.common.white, 0.05),
                '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
                '&.Mui-focused': { bgcolor: alpha(theme.palette.common.white, 0.1) }
              }
            }}
          />

          <Box sx={{
            display: 'flex',
            p: 0.5,
            bgcolor: alpha(theme.palette.common.white, 0.05),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            borderRadius: '2.5rem',
            overflow: 'hidden'
          }}>
            {['all', 'active', 'draft'].map((type) => (
              <Button
                key={type}
                onClick={() => setFilterType(type)}
                sx={{
                  borderRadius: '2rem',
                  px: 3,
                  color: filterType === type ? 'white' : 'text.secondary',
                  bgcolor: filterType === type ? theme.palette.primary.main : 'transparent',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: filterType === type ? theme.palette.primary.dark : alpha(theme.palette.common.white, 0.1) }
                }}
              >
                {type}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Pipelines Grid */}
        <Grid container spacing={4}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <Skeleton variant="rectangular" height={256} sx={{ borderRadius: '2.5rem', bgcolor: alpha(theme.palette.common.white, 0.05) }} />
              </Grid>
            ))
          ) : filteredPipelines.length > 0 ? (
            filteredPipelines.map((p) => (
              <Grid item xs={12} md={6} lg={4} key={p.id}>
                <Card sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '2.5rem',
                  bgcolor: alpha(theme.palette.common.white, 0.05),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 20px 50px rgba(0,0,0,0.3)`
                  }
                }}>
                  <CardContent sx={{ p: 4, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          p: 2,
                          borderRadius: '16px',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Cpu size={24} color={theme.palette.primary.light} />
                        </Box>
                        <StatusBadge isActive={p.status === 'active'} />
                      </Box>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <MoreVertical size={20} />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" fontWeight="900" gutterBottom noWrap title={p.name}>
                        {p.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.5em'
                      }}>
                        {p.description || 'No strategic description defined for this blueprint sequence.'}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 'auto' }}>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: alpha('#0f172a', 0.5), borderRadius: '16px', border: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>
                          <Typography variant="caption" display="block" color="text.secondary" fontWeight="900" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>Architecture</Typography>
                          <Typography variant="body2" fontWeight="bold">Modular {p.steps?.length || 0} Nodes</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: alpha('#0f172a', 0.5), borderRadius: '16px', border: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>
                          <Typography variant="caption" display="block" color="text.secondary" fontWeight="900" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>Last Sync</Typography>
                          <Typography variant="body2" fontWeight="bold">{new Date(p.updatedAt).toLocaleDateString()}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Command Bar Overlay - revealed on hover */}
                    <Box sx={{
                      position: 'absolute', inset: 'auto 0 0 0',
                      p: 3,
                      bgcolor: alpha('#0f172a', 0.9),
                      backdropFilter: 'blur(20px)',
                      borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transform: 'translateY(100%)',
                      transition: 'transform 0.3s',
                      '.MuiCard-root:hover &': { transform: 'translateY(0)' }
                    }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={() => handleExecute(p.id, p.name)} sx={{
                          bgcolor: theme.palette.success.main,
                          color: 'white',
                          '&:hover': { bgcolor: theme.palette.success.dark }
                        }}>
                          <Play size={20} />
                        </IconButton>
                        <Button
                          component={Link}
                          to={`/pipelines/builder/${p.id}`}
                          variant="outlined"
                          sx={{
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Configure
                        </Button>
                      </Box>
                      <IconButton onClick={() => handleDelete(p.id, p.name)} sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                      }}>
                        <Trash2 size={20} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{
                textAlign: 'center',
                py: 10,
                borderRadius: '3rem',
                border: `2px dashed ${alpha(theme.palette.common.white, 0.1)}`,
                bgcolor: alpha(theme.palette.common.white, 0.02)
              }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: alpha(theme.palette.primary.main, 0.2), filter: 'blur(40px)', borderRadius: '50%' }} />
                  <Activity size={80} color={theme.palette.text.secondary} style={{ position: 'relative' }} />
                </Box>
                <Typography variant="h4" fontWeight="900" gutterBottom>No Blueprints Identified</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 'sm', mx: 'auto' }}>
                  Your command center is ready. Initialize your first operational sequence to begin.
                </Typography>
                <Button
                  component={Link}
                  to="/pipelines/builder/new"
                  size="large"
                  variant="contained"
                  sx={{
                    borderRadius: '2rem',
                    px: 6, py: 2,
                    fontSize: '1.2rem',
                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  }}
                >
                  Initialize Command
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default PipelinesPage;
