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
  Box,
  Cpu,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

/**
 * Premium Status Badge Component
 */
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border ${isActive
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }`}>
    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
    {isActive ? 'Active' : 'Draft'}
  </span>
);

const PipelinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  const { pipelines, loading, refreshPipelines } = usePipelines();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

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
        toastError('Execution Error', `Failed to run "${name}": ${result.errors.join(', ')}`);
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
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Operational Blueprints
            </h1>
            <p className="text-slate-400 text-lg font-medium">Manage and monitor your intelligent data processing sequences</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => refreshPipelines()}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link
              to="/pipelines/builder/new"
              className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-3" />
              Genesis Blueprint
            </Link>
          </div>
        </div>

        {/* Filters & Command Bar */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Query blueprints by name or logic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
            />
          </div>

          <div className="flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden w-full md:w-auto">
            {['all', 'active', 'draft'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-8 py-3 rounded-[2rem] text-sm font-black uppercase tracking-wider transition-all ${filterType === type
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Pipelines Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : filteredPipelines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPipelines.map((p) => (
              <div
                key={p.id}
                className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              >
                {/* Blueprint Card Content */}
                <div className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <Cpu className="w-6 h-6 text-blue-400" />
                      </div>
                      <StatusBadge isActive={p.status === 'active'} />
                    </div>
                    <div className="relative">
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-200 transition-colors truncate">
                      {p.name}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed">
                      {p.description || 'No strategic description defined for this blueprint sequence.'}
                    </p>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Architecture</p>
                      <p className="text-white font-bold text-sm">Modular {p.steps?.length || 0} Nodes</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Last Sync</p>
                      <p className="text-white font-bold text-sm">{new Date(p.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Command Bar Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleExecute(p.id, p.name)}
                      className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/pipelines/builder/${p.id}`}
                      className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-bold"
                    >
                      Configure
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] py-32 text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full"></div>
              <Activity className="mx-auto h-24 w-24 text-slate-700 relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">No Blueprints Identified</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">Your command center is ready. Initialize your first operational sequence to begin.</p>
            <Link
              to="/pipelines/builder/new"
              className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all"
            >
              Initialize Command
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelinesPage;
