import React, { useState, useMemo } from 'react';
import {
    Download,
    Settings,
    FileJson,
    Table as TableIcon,
    FileText,
    Search,
    ChevronRight,
    Zap,
    Shield,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    History,
    Database
} from 'lucide-react';
import { usePipelines } from '../hooks/usePipelines';
import { dataService, ExportHistoryItem } from '../services/data.service';
import { useToast } from '../context/ToastContext';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    alpha,
    Grid,
    LinearProgress
} from '@mui/material';

const DataExportPage: React.FC = () => {
    const { addToast } = useToast();
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
    const [format, setFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');
    const [isExporting, setIsExporting] = useState(false);
    const [filename, setFilename] = useState('');

    // Memoize filters to avoid infinite render loop in usePipelines hook
    const filters = useMemo(() => ({ search }), [search]);
    const { pipelines = [], loading: pipelinesLoading } = usePipelines(filters);

    const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    // Fetch export history
    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                setHistoryLoading(true);
                const history = await dataService.getExportHistory(10);
                setExportHistory(history);
            } catch (err) {
                console.error('Failed to fetch export history', err);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleExport = async () => {
        if (!selectedPipelineId) {
            addToast('Please select a pipeline to initiate export.', 'warning');
            return;
        }

        try {
            setIsExporting(true);
            const result = await dataService.exportData(selectedPipelineId, {
                format,
                filename: filename || `export_${new Date().toISOString().split('T')[0]}`,
            });

            addToast(`Signal Uplink initiated. Job ID: ${result.jobId}`, 'success');

            // Refresh history
            const updatedHistory = await dataService.getExportHistory(10);
            setExportHistory(updatedHistory);
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Uplink failed. Please verify protocol.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const selectedPipeline = useMemo(() =>
        pipelines.find(p => p.id === selectedPipelineId),
        [pipelines, selectedPipelineId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return { bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.light, borderColor: alpha(theme.palette.success.main, 0.2) };
            case 'failed': return { bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.light, borderColor: alpha(theme.palette.error.main, 0.2) };
            default: return { bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.light, borderColor: alpha(theme.palette.info.main, 0.2) };
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: theme.palette.background.default,
        }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {/* Header */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h3" fontWeight="900" sx={{
                        background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em'
                    }}>
                        Signal Uplink
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight="medium" sx={{ opacity: 0.7 }}>
                        Coordinate and authorize global data extraction protocols
                    </Typography>
                </Box>

                <Grid container spacing={5}>
                    {/* Configuration Panel */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.03),
                                backdropFilter: 'blur(32px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}>
                                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Settings size={20} color={theme.palette.primary.light} />
                                        <Typography variant="h6" fontWeight="bold" fontStyle="italic">Transmission Config</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Box>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', mb: 1 }}>Output Designation</Typography>
                                            <TextField
                                                fullWidth
                                                variant="filled"
                                                value={filename}
                                                onChange={(e) => setFilename(e.target.value)}
                                                placeholder="nexus_data_manifest"
                                            />
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', mb: 1 }}>Data Schema Format</Typography>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <FormatButton active={format === 'csv'} onClick={() => setFormat('csv')} label="CSV" icon={FileText} />
                                                <FormatButton active={format === 'xlsx'} onClick={() => setFormat('xlsx')} label="XLSX" icon={TableIcon} />
                                                <FormatButton active={format === 'json'} onClick={() => setFormat('json')} label="JSON" icon={FileJson} />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        p: 3, borderRadius: '1.5rem',
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        display: 'flex', flexDirection: 'column', gap: 1
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Shield size={16} color={theme.palette.primary.light} />
                                            <Typography variant="caption" fontWeight="900" sx={{ color: theme.palette.primary.light, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Authorization Node</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="medium">Selected Pipeline:</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ fontStyle: 'italic' }}>
                                            {selectedPipeline?.name || 'Awaiting Selection...'}
                                        </Typography>
                                    </Box>

                                    <Button
                                        onClick={handleExport}
                                        disabled={!selectedPipelineId || isExporting}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        startIcon={isExporting ? <RefreshCw className="animate-spin" /> : <Zap />}
                                        sx={{
                                            py: 2.5,
                                            borderRadius: '1.5rem',
                                            fontWeight: 900,
                                            letterSpacing: '0.2em',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {isExporting ? 'Initializing Uplink...' : 'Authorize Extraction'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.05),
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <CardContent sx={{ p: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                    <Box sx={{ position: 'absolute', top: 0, right: 0, p: 3, opacity: 0.05 }}>
                                        <Download size={64} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Global Exports</Typography>
                                        <Typography variant="h4" fontWeight="900" fontStyle="italic">1.2K+</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Uptime Rate</Typography>
                                        <Typography variant="h4" fontWeight="900" fontStyle="italic" color="success.main">99.9%</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>

                    {/* Selection & History Area */}
                    <Grid item xs={12} lg={8}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {/* Pipeline Selector */}
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.05),
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
                            }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 3, mb: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Database size={20} color={theme.palette.secondary.light} />
                                            <Typography variant="h6" fontWeight="bold" fontStyle="italic">Source Neural Pipeline</Typography>
                                        </Box>
                                        <TextField
                                            placeholder="Search neural patterns..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            variant="filled"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search size={16} />
                                                    </InputAdornment>
                                                ),
                                                disableUnderline: true,
                                                sx: { borderRadius: '1rem', bgcolor: alpha(theme.palette.background.default, 0.5) }
                                            }}
                                            sx={{ minWidth: 300, '& .MuiFilledInput-root': { bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                                        />
                                    </Box>

                                    <Grid container spacing={2}>
                                        {pipelinesLoading ? (
                                            Array.from(new Array(4)).map((_, i) => (
                                                <Grid item xs={12} md={6} key={i}>
                                                    <Box sx={{ height: 100, bgcolor: alpha(theme.palette.common.white, 0.05), borderRadius: '1.5rem' }} />
                                                </Grid>
                                            ))
                                        ) : (
                                            (pipelines || []).map((pipeline) => (
                                                <Grid item xs={12} md={6} key={pipeline.id}>
                                                    <Box
                                                        onClick={() => setSelectedPipelineId(pipeline.id)}
                                                        sx={{
                                                            p: 3, borderRadius: '1.5rem',
                                                            border: '1px solid',
                                                            borderColor: selectedPipelineId === pipeline.id ? theme.palette.secondary.main : alpha(theme.palette.common.white, 0.1),
                                                            bgcolor: selectedPipelineId === pipeline.id ? alpha(theme.palette.secondary.main, 0.05) : alpha(theme.palette.common.white, 0.05),
                                                            cursor: 'pointer',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                bgcolor: selectedPipelineId === pipeline.id ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.common.white, 0.08),
                                                                borderColor: selectedPipelineId === pipeline.id ? theme.palette.secondary.main : alpha(theme.palette.common.white, 0.2)
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="bold" fontStyle="italic" sx={{ color: selectedPipelineId === pipeline.id ? theme.palette.secondary.light : 'text.primary', mb: 0.5 }}>
                                                                    {pipeline.name}
                                                                </Typography>
                                                                <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                                    {pipeline.category}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{
                                                                p: 1, borderRadius: '0.75rem',
                                                                bgcolor: selectedPipelineId === pipeline.id ? theme.palette.secondary.main : alpha(theme.palette.common.white, 0.05),
                                                                color: selectedPipelineId === pipeline.id ? 'white' : 'text.secondary'
                                                            }}>
                                                                <ChevronRight size={16} />
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ position: 'absolute', top: -10, right: -10, p: 2, opacity: 0.05, transform: 'rotate(12deg)' }}>
                                                            <Zap size={64} />
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Export History */}
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.05),
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
                            }}>
                                <CardContent sx={{ p: 4, overflowX: 'auto' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                        <History size={20} color={theme.palette.text.secondary} />
                                        <Typography variant="h6" fontWeight="bold" fontStyle="italic">Transmission History</Typography>
                                    </Box>

                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ '& th': { borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.05)}` } }}>
                                                    <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>manifest</Typography></TableCell>
                                                    <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>protocol</Typography></TableCell>
                                                    <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>status</Typography></TableCell>
                                                    <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>uplink time</Typography></TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {historyLoading ? (
                                                    Array.from(new Array(3)).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell><LinearProgress /></TableCell>
                                                            <TableCell><LinearProgress /></TableCell>
                                                            <TableCell><LinearProgress /></TableCell>
                                                            <TableCell><LinearProgress /></TableCell>
                                                            <TableCell><LinearProgress /></TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    exportHistory?.map((item) => (
                                                        <TableRow key={item.id} hover sx={{ '& td': { borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.05)}` } }}>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <Box sx={{ p: 1, borderRadius: '0.5rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.light }}>
                                                                        <FileText size={16} />
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">{item.name || 'Unnamed Transmission'}</Typography>
                                                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', fontSize: '0.625rem' }}>
                                                                            {(item.fileFormat || 'UNKNOWN').toUpperCase()} · {item.totalRows || 0} units
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Settings size={14} color={theme.palette.text.secondary} />
                                                                    <Typography variant="caption" fontWeight="bold" fontStyle="italic" color="text.secondary">{item.destinationType || 'Standard'}</Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    icon={item.status === 'completed' ? <CheckCircle size={12} /> : item.status === 'failed' ? <AlertCircle size={12} /> : <Clock size={12} />}
                                                                    label={item.status || 'Pending'}
                                                                    size="small"
                                                                    sx={{
                                                                        ...getStatusColor(item.status || ''),
                                                                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.625rem', height: 24,
                                                                        border: '1px solid',
                                                                        '& .MuiChip-icon': { color: 'inherit' }
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                                                    {item.createdAt ? `${new Date(item.createdAt).toLocaleDateString()} · ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {item.downloadUrl && (
                                                                    <IconButton href={item.downloadUrl} size="small" sx={{ color: 'text.secondary', '&:hover': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
                                                                        <Download size={16} />
                                                                    </IconButton>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

const FormatButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: any }> = ({ active, onClick, label, icon: Icon }) => {
    const theme = useTheme();
    return (
        <Button
            onClick={onClick}
            sx={{
                flex: 1,
                display: 'flex', flexDirection: 'column', gap: 1, py: 2,
                borderRadius: '1rem',
                border: '1px solid',
                borderColor: active ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.1),
                bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.common.white, 0.05),
                color: active ? theme.palette.primary.light : 'text.secondary',
                '&:hover': {
                    bgcolor: active ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.common.white, 0.08),
                    color: active ? theme.palette.primary.light : 'text.primary'
                }
            }}
        >
            <Icon size={20} />
            <Typography variant="caption" fontWeight="900" sx={{ letterSpacing: '0.1em' }}>{label}</Typography>
        </Button>
    );
};

export default DataExportPage;
