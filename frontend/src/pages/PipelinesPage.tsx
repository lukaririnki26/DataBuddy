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
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }`}>
    {isActive ? (
      <>
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </>
    ) : (
      <>
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </>
    )}
  </span>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{pipeline.name}</h3>
            <StatusBadge isActive={pipeline.isActive} />
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pipeline.description}</p>

          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              {pipeline.steps?.length || 0} steps
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(pipeline.updatedAt).toLocaleDateString()}
            </span>
            {pipeline.creator && (
              <span>by {pipeline.creator.firstName} {pipeline.creator.lastName}</span>
            )}
          </div>

          {pipeline.tags && pipeline.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {pipeline.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700"
                >
                  {tag}
                </span>
              ))}
              {pipeline.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{pipeline.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onExecute(pipeline.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Play className="w-4 h-4 mr-3" />
                  Execute Pipeline
                </button>

                <Link
                  to={`/pipelines/builder/${pipeline.id}`}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit Pipeline
                </Link>

                <button
                  onClick={() => {
                    onDuplicate(pipeline.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Duplicate
                </button>

                <Link
                  to={`/pipelines/${pipeline.id}`}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </Link>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this pipeline?')) {
                      onDelete(pipeline.id);
                      setMenuOpen(false);
                    }
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Pipeline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onExecute(pipeline.id)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Play className="w-4 h-4 mr-2" />
            Run
          </button>

          <Link
            to={`/pipelines/builder/${pipeline.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>

        <Link
          to={`/pipelines/${pipeline.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          View details →
        </Link>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pipelines</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage automated data processing workflows
          </p>
        </div>
        <Link
          to="/pipelines/builder"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Pipeline
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search pipelines..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Failed to load pipelines
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : pipelines.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pipelines found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first data pipeline.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <div className="mt-6">
              <Link
                to="/pipelines/builder"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Pipeline
              </Link>
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

      {/* Execution Modal/Overlay would go here */}
      {executingPipeline && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
              <p className="text-sm text-gray-600">Executing pipeline...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelinesPage;
