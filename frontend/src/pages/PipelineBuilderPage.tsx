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
  CheckCircle,
  XCircle,
  X,
  Database,
  Terminal,
  Filter,
  RefreshCw,
  Search,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { usePipelines } from '../hooks/usePipelines';
import { pipelinesService } from '../services/pipelines.service';
import { useToast } from '../context/ToastContext';

/**
 * Available pipeline step types with futuristic icons
 */
const STEP_TYPES = [
  {
    type: 'read',
    name: 'Read Data',
    description: 'Read data from files (CSV, Excel, JSON)',
    icon: <Database className="w-5 h-5" />,
    color: 'blue',
    category: 'Input',
    configSchema: {
      filePath: { type: 'string', required: true },
      fileType: { type: 'string', enum: ['csv', 'xlsx', 'json'], required: true },
    },
  },
  {
    type: 'transform',
    name: 'Transform Data',
    description: 'Transform and manipulate data columns',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'purple',
    category: 'Processing',
  },
  {
    type: 'validate',
    name: 'Validate Data',
    description: 'Validate data quality and constraints',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'emerald',
    category: 'Processing',
  },
  {
    type: 'write',
    name: 'Write Data',
    description: 'Write data to files or databases',
    icon: <Save className="w-5 h-5" />,
    color: 'indigo',
    category: 'Output',
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
  const { success, error: toastError, info } = useToast();

  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showStepPalette, setShowStepPalette] = useState(false);

  const {
    loading,
    createPipeline,
    updatePipeline,
    getPipeline,
  } = usePipelines();

  // Load existing pipeline
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
          toastError('Error', 'Failed to load pipeline configuration');
        }
      };
      loadPipeline();
    }
  }, [id, getPipeline, toastError]);

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
    success('Step Added', `${stepTemplate.name} has been added to the pipeline`);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    if (selectedStep === stepId) setSelectedStep(null);
    info('Step Removed', 'The step has been removed from your pipeline');
  };

  const savePipeline = async () => {
    if (!pipelineName.trim()) {
      toastError('Missing Information', 'Please provide a name for your pipeline');
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
        success('Pipeline Updated', 'Changes have been saved successfully');
      } else {
        await createPipeline(pipelineData);
        success('Pipeline Created', 'Your new pipeline is ready');
      }
      navigate('/pipelines');
    } catch (err) {
      toastError('Save Failed', 'Could not save pipeline configuration');
    }
  };

  const executePipeline = async () => {
    if (!id || id === 'new') {
      toastError('Execution Error', 'Please save the pipeline first');
      return;
    }

    setIsExecuting(true);
    info('Execution Started', 'Your pipeline is now processing data...');
    try {
      const result = await pipelinesService.executePipeline(id, { inputData: [], parameters: {} });
      if (result.success) {
        success('Execution Complete', `Processed ${result.processedItems} items successfully`);
      } else {
        toastError('Execution Error', result.errors.join(', '));
      }
    } catch (err: any) {
      toastError('Execution Failed', err.message || 'An unexpected error occurred');
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedStepData = selectedStep ? steps.find(step => step.id === selectedStep) : null;

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Futuristic Header */}
        <header className="backdrop-blur-xl bg-slate-900/60 border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/pipelines')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  {id && id !== 'new' ? 'Pipeline Editor' : 'Pipeline Genesis'}
                </h1>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Constructing Intelligent Workflows</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={executePipeline}
                disabled={steps.length === 0 || isExecuting}
                className="group relative inline-flex items-center px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-30"
              >
                <Play className={`w-4 h-4 mr-2 ${isExecuting ? 'animate-spin' : 'group-hover:scale-110'}`} />
                {isExecuting ? 'Processing...' : 'Execute'}
              </button>
              <button
                onClick={savePipeline}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all transform hover:scale-105"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Blueprint
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Configuration Panel */}
              <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Blueprint Name</label>
                    <input
                      type="text"
                      value={pipelineName}
                      onChange={(e) => setPipelineName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="My Intelligent Pipeline"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Strategy Description</label>
                    <input
                      type="text"
                      value={pipelineDescription}
                      onChange={(e) => setPipelineDescription(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Defining the data transformation logic..."
                    />
                  </div>
                </div>
              </section>

              {/* Pipeline Sequence */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-white">Operations Sequence</h3>
                  <button
                    onClick={() => setShowStepPalette(true)}
                    className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 transition-all group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                {steps.length === 0 ? (
                  <div className="backdrop-blur-sm bg-white/3 border-2 border-dashed border-white/10 rounded-[2.5rem] py-24 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                      <Settings className="w-16 h-16 text-slate-600 relative z-10 animate-pulse" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Sequence Empty</h4>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">Begin your automation journey by adding your first operational step.</p>
                    <button
                      onClick={() => setShowStepPalette(true)}
                      className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold border border-white/10 transition-all hover:scale-105"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Add Initial Step
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {steps.map((step, index) => {
                      const template = STEP_TYPES.find(t => t.type === step.type);
                      return (
                        <div
                          key={step.id}
                          onClick={() => setSelectedStep(step.id)}
                          className={`group relative backdrop-blur-md border rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden ${selectedStep === step.id
                              ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                              : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                            }`}
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center justify-center w-12 h-12 bg-slate-900 rounded-2xl border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                <span className={`text-sm font-black ${selectedStep === step.id ? 'text-blue-400' : 'text-slate-500'}`}>0{index + 1}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5`}>
                                  {template?.icon}
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">{step.name}</h4>
                                  <p className="text-xs font-bold uppercase tracking-tighter text-slate-500">{template?.category} Operation</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); removeStep(step.id); }} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="text-slate-600 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5" />
                              </div>
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

          {/* Right Panel: Step Palette / Configuration */}
          <aside className={`w-96 backdrop-blur-2xl bg-slate-900/40 border-l border-white/10 p-8 flex flex-col transition-all duration-500 ${showStepPalette || selectedStepData ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
            {showStepPalette ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white italic tracking-tighter">Blueprint Palette</h3>
                  <button onClick={() => setShowStepPalette(false)} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6 overflow-y-auto custom-scrollbar-mini pr-2">
                  {STEP_TYPES.map(type => (
                    <button
                      key={type.type}
                      onClick={() => addStep(type.type)}
                      className="w-full group text-left p-5 bg-white/3 border border-white/5 rounded-3xl hover:bg-white/8 hover:border-white/20 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 group-hover:text-blue-400 transition-colors">
                          {type.icon}
                        </div>
                        <div>
                          <h5 className="font-bold text-white mb-1">{type.name}</h5>
                          <p className="text-xs text-slate-500 leading-relaxed">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedStepData ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white italic tracking-tighter">Step Intelligence</h3>
                  <button onClick={() => setSelectedStep(null)} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-8 flex-1">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Operational Name</label>
                    <input
                      type="text"
                      value={selectedStepData.name}
                      onChange={(e) => setSteps(steps.map(s => s.id === selectedStepData.id ? { ...s, name: e.target.value } : s))}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                    <h5 className="text-sm font-bold text-blue-300 mb-2">Neural Configuration</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">Defining hardware and logic constraints for this specific operational node. Advanced variables will appear below.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </main>
      </div>
    </div>
  );
};

export default PipelineBuilderPage;
