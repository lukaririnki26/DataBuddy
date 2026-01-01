import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
    isActive
      ? 'bg-green-500/20 text-green-300 border-green-500/30'
      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  }`}>
    {isActive ? (
      <>
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
        Active
      </>
    ) : (
      <>
        <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
        Inactive
      </>
    )}
  </div>
);

/**
 * Pipeline card component
 */
const PipelineCard: React.FC<{
  pipeline: any;
  onExecute: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ pipeline, onExecute, onDuplicate, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                {pipeline.name}
              </h3>
              <StatusBadge isActive={pipeline.isActive} />
            </div>

            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{pipeline.description}</p>

            <div className="flex items-center space-x-6 text-sm text-slate-500 mb-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>{pipeline.steps?.length || 0} steps</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{new Date(pipeline.updatedAt).toLocaleDateString()}</span>
              </div>
              {pipeline.creator && (
                <span className="text-slate-400">
                  by {pipeline.creator.firstName} {pipeline.creator.lastName}
                </span>
              )}
            </div>

            {pipeline.tags && pipeline.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pipeline.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="backdrop-blur-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 text-blue-200 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {pipeline.tags.length > 3 && (
                  <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                    +{pipeline.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-slate-900/90 border border-white/20 rounded-xl shadow-2xl z-20">
                <div className="py-2">
                  <button
                    onClick={() => {
                      onExecute(pipeline.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-blue-500/20 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-3 text-green-400" />
                    Execute Pipeline
                  </button>

                  <Link
                    to={`/pipelines/builder/${pipeline.id}`}
                    className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-blue-500/20 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit className="w-4 h-4 mr-3 text-blue-400" />
                    Edit Pipeline
                  </Link>

                  <button
                    onClick={() => {
                      onDuplicate(pipeline.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-blue-500/20 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-3 text-purple-400" />
                    Duplicate
                  </button>

                  <Link
                    to={`/pipelines/${pipeline.id}`}
                    className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-blue-500/20 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye className="w-4 h-4 mr-3 text-cyan-400" />
                    View Details
                  </Link>

                  <div className="border-t border-white/10 my-1"></div>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this pipeline?')) {
                        onDelete(pipeline.id);
                        setMenuOpen(false);
                      }
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-300 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Pipeline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="flex space-x-3">
            <button
              onClick={() => onExecute(pipeline.id)}
              className="backdrop-blur-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 hover:scale-105 font-medium"
            >
              <Play className="w-4 h-4 mr-2" />
              Run
            </button>

            <Link
              to={`/pipelines/builder/${pipeline.id}`}
              className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105 font-medium"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </div>

          <Link
            to={`/pipelines/${pipeline.id}`}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors flex items-center"
          >
            View details
            <span className="ml-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const PipelinesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [executingPipeline, setExecutingPipeline] = useState<string | null>(null);

  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    limit: 12,
  }), [searchQuery, statusFilter]);

  const {
    pipelines,
    loading,
    error,
    createPipeline,
    deletePipeline,
    duplicatePipeline,
  } = usePipelines(filters);

  const handleExecutePipeline = async (pipelineId: string) => {
    setExecutingPipeline(pipelineId);
    try {
      const result = await pipelinesService.executePipeline(pipelineId, {
        inputData: [],
        parameters: {},
      });

      if (result.success) {
        alert(`Pipeline executed successfully! Processed ${result.processedItems} items in ${result.executionTime}ms`);
      } else {
        alert(`Pipeline execution failed: ${result.errors.join(', ')}`);
      }
    } catch (err: any) {
      console.error('Failed to execute pipeline:', err);
      alert(`Pipeline execution failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExecutingPipeline(null);
    }
  };

  const handleDuplicatePipeline = async (pipelineId: string) => {
    try {
      await duplicatePipeline(pipelineId);
    } catch (err) {
      console.error('Failed to duplicate pipeline:', err);
    }
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    try {
      await deletePipeline(pipelineId);
    } catch (err) {
      console.error('Failed to delete pipeline:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366F1' fill-opacity='0.05'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      <div className="relative z-10 space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Data Pipelines
            </h1>
            <p className="text-slate-400 text-lg">
              Create and manage automated data processing workflows
            </p>
          </div>
          <Link
            to="/pipelines/builder"
            className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Pipeline
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 backdrop-blur-sm"
                  placeholder="Search pipelines..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 backdrop-blur-sm"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="active" className="bg-slate-800">Active Only</option>
                  <option value="inactive" className="bg-slate-800">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                    <div className="h-6 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-5 w-16 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="flex space-x-6">
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                    <div className="h-4 bg-slate-700 rounded w-20"></div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <div className="h-6 bg-slate-700 rounded-full w-12"></div>
                    <div className="h-6 bg-slate-700 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-2xl p-8">
            <div className="flex items-center">
              <div className="relative">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-lg animate-pulse"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-300">
                  Failed to load pipelines
                </h3>
                <p className="text-red-200 mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 backdrop-blur-md bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 font-medium"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          </div>
      ) : pipelines.length === 0 ? (
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-16 text-center">
          <div className="relative inline-block mb-6">
            <Settings className="mx-auto h-16 w-16 text-slate-500" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-3">No pipelines found</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by creating your first data pipeline to automate your data processing workflows.'
            }
          </p>

          {!searchQuery && statusFilter === 'all' && (
            <div className="space-y-4">
              <Link
                to="/pipelines/builder"
                className="inline-flex items-center backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-white px-8 py-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-medium"
              >
                <Plus className="w-6 h-6 mr-3" />
                Create Your First Pipeline
              </Link>

              <div className="text-sm text-slate-500">
                <p>Need inspiration? Check out our <span className="text-blue-400 hover:text-blue-300 cursor-pointer">pipeline templates</span></p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onExecute={handleExecutePipeline}
              onDuplicate={handleDuplicatePipeline}
              onDelete={handleDeletePipeline}
            />
          ))}
        </div>
      )}

        {/* Execution Modal */}
        {executingPipeline && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-blue-400 border-r-purple-400"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Executing Pipeline</h3>
                <p className="text-slate-400 mb-6">Processing your data pipeline... This may take a few moments.</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-green-400 font-medium">Running</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">Please do not close this window</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelinesPage;
