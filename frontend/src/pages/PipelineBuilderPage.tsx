import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Save,
  Play,
  ArrowLeft,
  Plus,
  Settings,
  Trash2,
  Copy,
  Move,
  Eye,
  EyeOff,
} from 'lucide-react';
import { usePipelines } from '../hooks/usePipelines';

/**
 * Available pipeline step types
 */
const STEP_TYPES = [
  {
    type: 'read',
    name: 'Read Data',
    description: 'Read data from files (CSV, Excel, JSON)',
    icon: '📁',
    category: 'Input',
    configSchema: {
      filePath: { type: 'string', required: true },
      fileType: { type: 'string', enum: ['csv', 'xlsx', 'json'], required: true },
      options: { type: 'object' },
    },
  },
  {
    type: 'transform',
    name: 'Transform Data',
    description: 'Transform and manipulate data columns',
    icon: '🔄',
    category: 'Processing',
    configSchema: {
      operations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['rename', 'remove_column', 'add_column', 'filter', 'map', 'clean'] },
            params: { type: 'object' },
          },
        },
      },
    },
  },
  {
    type: 'validate',
    name: 'Validate Data',
    description: 'Validate data quality and constraints',
    icon: '✅',
    category: 'Processing',
    configSchema: {
      rules: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['required', 'email', 'phone', 'date', 'number', 'regex'] },
            column: { type: 'string' },
            params: { type: 'object' },
          },
        },
      },
    },
  },
  {
    type: 'write',
    name: 'Write Data',
    description: 'Write data to files or databases',
    icon: '💾',
    category: 'Output',
    configSchema: {
      target: { type: 'string', enum: ['file', 'database', 'api'], required: true },
      format: { type: 'string', enum: ['csv', 'xlsx', 'json'] },
      destination: { type: 'string', required: true },
      options: { type: 'object' },
    },
  },
  {
    type: 'export',
    name: 'Export Data',
    description: 'Export processed data to various formats',
    icon: '📤',
    category: 'Output',
    configSchema: {
      format: { type: 'string', enum: ['csv', 'xlsx', 'json'], required: true },
      destination: { type: 'string', required: true },
      options: { type: 'object' },
    },
  },
];

interface PipelineStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  order: number;
  isEnabled: boolean;
}

const PipelineBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showStepPalette, setShowStepPalette] = useState(false);

  const {
    pipelines,
    loading,
    error,
    createPipeline,
    updatePipeline,
    getPipeline,
  } = usePipelines();

  // Load existing pipeline if editing
  useEffect(() => {
    if (id && id !== 'new') {
      const loadPipeline = async () => {
        try {
          const pipeline = await getPipeline(id);
          setPipelineName(pipeline.name);
          setPipelineDescription(pipeline.description || '');
          setSteps(pipeline.steps?.map(step => ({
            id: step.id,
            type: step.type,
            name: step.name || `${step.type} step`,
            config: step.config || {},
            order: step.order,
            isEnabled: step.isActive !== false,
          })) || []);
        } catch (err) {
          console.error('Failed to load pipeline:', err);
        }
      };
      loadPipeline();
    }
  }, [id, getPipeline]);

  const addStep = (stepType: string) => {
    const stepTemplate = STEP_TYPES.find(s => s.type === stepType);
    if (!stepTemplate) return;

    const newStep: PipelineStep = {
      id: `step_${Date.now()}`,
      type: stepType,
      name: `${stepTemplate.name} ${steps.length + 1}`,
      config: {},
      order: steps.length,
      isEnabled: true,
    };

    setSteps([...steps, newStep]);
    setSelectedStep(newStep.id);
    setShowStepPalette(false);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  const updateStep = (stepId: string, updates: Partial<PipelineStep>) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];

    // Update order values
    newSteps.forEach((step, index) => {
      step.order = index;
    });

    setSteps(newSteps);
  };

  const savePipeline = async () => {
    if (!pipelineName.trim()) {
      alert('Pipeline name is required');
      return;
    }

    try {
      const pipelineData = {
        name: pipelineName,
        description: pipelineDescription,
        steps: steps.map(step => ({
          type: step.type,
          name: step.name,
          config: step.config,
          order: step.order,
          isActive: step.isEnabled,
        })),
      };

      if (id && id !== 'new') {
        await updatePipeline(id, pipelineData);
      } else {
        await createPipeline(pipelineData);
      }

      navigate('/pipelines');
    } catch (err) {
      console.error('Failed to save pipeline:', err);
      alert('Failed to save pipeline');
    }
  };

  const executePipeline = async () => {
    setIsExecuting(true);
    try {
      // TODO: Implement pipeline execution
      alert('Pipeline execution not yet implemented');
    } catch (err) {
      console.error('Failed to execute pipeline:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedStepData = selectedStep ? steps.find(step => step.id === selectedStep) : null;
  const selectedStepTemplate = selectedStepData ? STEP_TYPES.find(s => s.type === selectedStepData.type) : null;

  const groupedStepTypes = useMemo(() => {
    const groups: Record<string, typeof STEP_TYPES> = {};
    STEP_TYPES.forEach(step => {
      if (!groups[step.category]) {
        groups[step.category] = [];
      }
      groups[step.category].push(step);
    });
    return groups;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/pipelines')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id && id !== 'new' ? 'Edit Pipeline' : 'Create Pipeline'}
              </h1>
              <p className="text-sm text-gray-600">
                Build a data processing pipeline with modular steps
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={executePipeline}
              disabled={steps.length === 0 || isExecuting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </button>
            <button
              onClick={savePipeline}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Pipeline
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Pipeline Canvas */}
        <div className="flex-1 p-6">
          {/* Pipeline Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pipeline Name *
                </label>
                <input
                  type="text"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  placeholder="Enter pipeline name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={pipelineDescription}
                  onChange={(e) => setPipelineDescription(e.target.value)}
                  placeholder="Enter pipeline description"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Pipeline Steps</h3>
                <button
                  onClick={() => setShowStepPalette(!showStepPalette)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </button>
              </div>
            </div>

            <div className="p-6">
              {steps.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No steps added</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your first step to start building the pipeline
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowStepPalette(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Step
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const stepTemplate = STEP_TYPES.find(s => s.type === step.type);
                    return (
                      <div
                        key={step.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedStep === step.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedStep(step.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                              <span className="text-sm font-medium text-indigo-600">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{stepTemplate?.icon}</span>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {step.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {stepTemplate?.name}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStep(step.id, { isEnabled: !step.isEnabled });
                              }}
                              className={`p-1 rounded ${
                                step.isEnabled
                                  ? 'text-green-600 hover:bg-green-100'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {step.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(step.id, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Move className="w-4 h-4 rotate-180" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(step.id, 'down');
                              }}
                              disabled={index === steps.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Move className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStep(step.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Palette */}
        {showStepPalette && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Step</h3>
              <button
                onClick={() => setShowStepPalette(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedStepTypes).map(([category, steps]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
                  <div className="space-y-2">
                    {steps.map((stepType) => (
                      <button
                        key={stepType.type}
                        onClick={() => addStep(stepType.type)}
                        className="w-full text-left p-3 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{stepType.icon}</span>
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {stepType.name}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {stepType.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Configuration */}
        {selectedStepData && selectedStepTemplate && (
          <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Configure Step</h3>
              <button
                onClick={() => setSelectedStep(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Name
                </label>
                <input
                  type="text"
                  value={selectedStepData.name}
                  onChange={(e) => updateStep(selectedStepData.id, { name: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Type
                </label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <span className="text-lg">{selectedStepTemplate.icon}</span>
                  <span className="text-sm text-gray-900">{selectedStepTemplate.name}</span>
                </div>
              </div>

              {/* Configuration fields would go here based on step type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration
                </label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    Configuration options for {selectedStepTemplate.name} will be available here.
                  </p>
                  {/* TODO: Add dynamic configuration form based on step type */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineBuilderPage;
