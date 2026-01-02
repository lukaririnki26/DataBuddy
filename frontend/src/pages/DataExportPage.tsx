import React, { useState, useMemo } from 'react';
import {
    Download,
    Settings,
    FileJson,
    Table as TableIcon,
    FileText,
    Search,
    Filter,
    ChevronRight,
    Zap,
    Shield,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    MoreVertical,
    History,
    Database
} from 'lucide-react';
import { usePipelines } from '../hooks/usePipelines';
import { dataService, ExportHistoryItem } from '../services/data.service';
import { useToast } from '../context/ToastContext';

const DataExportPage: React.FC = () => {
    const { addToast } = useToast();
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

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent italic tracking-tight uppercase">
                        Signal Uplink
                    </h1>
                    <p className="text-slate-400 font-medium">Coordinate and authorize global data extraction protocols</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-bold italic tracking-tight">Transmission Config</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Output Designation</label>
                                    <input
                                        type="text"
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                        placeholder="nexus_data_manifest"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data Schema Format</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <FormatButton
                                            active={format === 'csv'}
                                            onClick={() => setFormat('csv')}
                                            label="CSV"
                                            icon={FileText}
                                        />
                                        <FormatButton
                                            active={format === 'xlsx'}
                                            onClick={() => setFormat('xlsx')}
                                            label="XLSX"
                                            icon={TableIcon}
                                        />
                                        <FormatButton
                                            active={format === 'json'}
                                            onClick={() => setFormat('json')}
                                            label="JSON"
                                            icon={FileJson}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-[1.5rem] space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Authorization Node</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">Selected Pipeline:</p>
                                        <p className="text-sm font-bold text-white truncate max-w-full italic">
                                            {selectedPipeline?.name || 'Awaiting Selection...'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleExport}
                                    disabled={!selectedPipelineId || isExporting}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 ${selectedPipelineId && !isExporting
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 hover:scale-[1.02] active:scale-95'
                                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    {isExporting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                                            Initializing Uplink...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            Authorize Extraction
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 grid grid-cols-2 gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Download className="w-16 h-16" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Global Exports</h4>
                                <div className="text-2xl font-black italic">1.2K+</div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Uptime Rate</h4>
                                <div className="text-2xl font-black italic text-emerald-400">99.9%</div>
                            </div>
                        </div>
                    </div>

                    {/* Selection & History Area */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Pipeline Selector */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-lg font-bold italic tracking-tight">Source Neural Pipeline</h3>
                                </div>
                                <div className="relative group min-w-[300px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search neural patterns..."
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pipelinesLoading ? (
                                    Array(4).fill(0).map((_, i) => (
                                        <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>
                                    ))
                                ) : (
                                    (pipelines || []).map((pipeline) => (
                                        <div
                                            key={pipeline.id}
                                            onClick={() => setSelectedPipelineId(pipeline.id)}
                                            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${selectedPipelineId === pipeline.id
                                                ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10'
                                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="space-y-1">
                                                    <h4 className={`text-sm font-bold tracking-tight italic ${selectedPipelineId === pipeline.id ? 'text-purple-300' : 'text-slate-200'}`}>
                                                        {pipeline.name}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pipeline.category}</p>
                                                </div>
                                                <div className={`p-2 rounded-xl transition-all ${selectedPipelineId === pipeline.id ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/5 text-slate-600'
                                                    }`}>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-1/4 -translate-y-1/4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                                                <Zap className="w-12 h-12" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Export History */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <History className="w-5 h-5 text-slate-400" />
                                <h3 className="text-lg font-bold italic tracking-tight">Transmission History</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-white/5">
                                            <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">manifest</th>
                                            <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">protocol</th>
                                            <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">status</th>
                                            <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">uplink time</th>
                                            <th className="pb-4 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {historyLoading ? (
                                            Array(3).fill(0).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={5} className="py-8"><div className="h-4 bg-white/5 rounded-full w-full"></div></td>
                                                </tr>
                                            ))
                                        ) : (
                                            exportHistory?.map((item) => (
                                                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                                    <td className="py-6 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-bold text-slate-200">{item.name || 'Unnamed Transmission'}</p>
                                                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                                                                    {(item.fileFormat || 'UNKNOWN').toUpperCase()} · {item.totalRows || 0} units
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Settings className="w-3.5 h-3.5 text-slate-500" />
                                                            <span className="text-xs font-bold italic text-slate-400">{item.destinationType || 'Standard'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            item.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                            {item.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : item.status === 'failed' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3 animate-pulse" />}
                                                            <span className="text-[10px] font-black uppercase tracking-wider">{item.status || 'Pending'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <span className="text-xs font-medium text-slate-500">
                                                            {item.createdAt ? `${new Date(item.createdAt).toLocaleDateString()} · ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 px-4 text-right">
                                                        {item.downloadUrl && (
                                                            <a
                                                                href={item.downloadUrl}
                                                                className="p-2.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all inline-block"
                                                                title="Download Manifest"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormatButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: any }> = ({ active, onClick, label, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all space-y-2 ${active
            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10'
            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/8 hover:text-slate-300'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
    </button>
);

export default DataExportPage;
