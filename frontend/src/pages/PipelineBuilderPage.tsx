import React, { useState, useEffect } from 'react';
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
  X,
  Database,
  RefreshCw,
  CheckCircle,
  GripVertical,
} from 'lucide-react';
import { usePipelines } from '../hooks/usePipelines';
import { pipelinesService } from '../services/pipelines.service';
import { useToast } from '../context/ToastContext';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';

const STEP_TYPES = [
  {
    type: 'read',
    name: 'Read Data',
    description: 'Read data from files (CSV, Excel, JSON)',
    icon: <Database size={20} />,
    color: 'info',
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
    icon: <RefreshCw size={20} />,
    color: 'secondary',
    category: 'Processing',
  },
  {
    type: 'validate',
    name: 'Validate Data',
    description: 'Validate data quality and constraints',
    icon: <CheckCircle size={20} />,
    color: 'success',
    category: 'Processing',
  },
  {
    type: 'write',
    name: 'Write Data',
    description: 'Write data to files or databases',
    icon: <Save size={20} />,
    color: 'warning',
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
  const { success, error: toastError, info } = useToast();
  const theme = useTheme();

  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showStepPalette, setShowStepPalette] = useState(false);

  const {
    createPipeline,
    updatePipeline,
    getPipeline,
  } = usePipelines();

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
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.background.default,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Dynamic Background */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', top: '25%', left: '25%', width: 400, height: 400,
          bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '50%', filter: 'blur(120px)',
          animation: 'blob 7s infinite'
        }} />
        <Box sx={{
          position: 'absolute', bottom: '25%', right: '25%', width: 400, height: 400,
          bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: '50%', filter: 'blur(120px)',
          animation: 'blob 7s infinite 2s'
        }} />
      </Box>

      {/* Header */}
      <Box sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.1), backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        px: 4, py: 2,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 10
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/pipelines')} sx={{ bgcolor: alpha(theme.palette.common.white, 0.05) }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{
              background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {id && id !== 'new' ? 'Pipeline Editor' : 'Pipeline Genesis'}
            </Typography>
            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Constructing Intelligent Workflows
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={executePipeline}
            disabled={steps.length === 0 || isExecuting}
            variant="outlined"
            startIcon={<Play size={16} className={isExecuting ? 'animate-spin' : ''} />}
            sx={{
              color: theme.palette.success.light,
              borderColor: alpha(theme.palette.success.main, 0.5),
              '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1), borderColor: theme.palette.success.main }
            }}
          >
            {isExecuting ? 'Processing...' : 'Execute'}
          </Button>
          <Button
            onClick={savePipeline}
            variant="contained"
            startIcon={<Save size={16} />}
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.dark})`
            }}
          >
            Save Blueprint
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        {/* Canvas */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
          <Box sx={{ maxWidth: 'md', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Config Panel */}
            <Card sx={{
              borderRadius: '2rem',
              bgcolor: alpha(theme.palette.common.white, 0.05),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
            }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ ml: 1, mb: 1, display: 'block' }}>Blueprint Name</Typography>
                    <TextField
                      fullWidth
                      value={pipelineName}
                      onChange={(e) => setPipelineName(e.target.value)}
                      placeholder="My Intelligent Pipeline"
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ ml: 1, mb: 1, display: 'block' }}>Strategy Description</Typography>
                    <TextField
                      fullWidth
                      value={pipelineDescription}
                      onChange={(e) => setPipelineDescription(e.target.value)}
                      placeholder="Defining the data transformation logic..."
                      variant="filled"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Steps */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Operations Sequence</Typography>
                <IconButton onClick={() => setShowStepPalette(true)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                  <Plus size={20} />
                </IconButton>
              </Box>

              {steps.length === 0 ? (
                <Box sx={{
                  border: `2px dashed ${alpha(theme.palette.common.white, 0.1)}`,
                  borderRadius: '2rem',
                  py: 10, textAlign: 'center',
                  bgcolor: alpha(theme.palette.common.white, 0.02)
                }}>
                  <Settings size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Sequence Empty</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>Begin your automation journey by adding your first operational step.</Typography>
                  <Button
                    onClick={() => setShowStepPalette(true)}
                    variant="outlined"
                    startIcon={<Plus size={16} />}
                  >
                    Add Initial Step
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {steps.map((step, index) => {
                    const template = STEP_TYPES.find(t => t.type === step.type);
                    const isSelected = selectedStep === step.id;
                    return (
                      <Card
                        key={step.id}
                        onClick={() => setSelectedStep(step.id)}
                        sx={{
                          borderRadius: '1.5rem',
                          cursor: 'pointer',
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.common.white, 0.05),
                          border: isSelected ? `1px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.common.white, 0.08) }
                        }}
                      >
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:last-child': { pb: 3 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{
                              width: 40, height: 40, borderRadius: '12px',
                              bgcolor: theme.palette.background.paper,
                              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '900', color: isSelected ? theme.palette.primary.main : 'text.secondary'
                            }}>
                              {String(index + 1).padStart(2, '0')}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.grey[900], 0.5), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
                                {template?.icon}
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold" color={isSelected ? 'primary.light' : 'text.primary'}>{step.name}</Typography>
                                <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>{template?.category} Operation</Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                              size="small"
                              sx={{ color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                            <IconButton size="small" sx={{ cursor: 'grab' }}>
                              <GripVertical size={20} />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Panel */}
        <Box sx={{
          width: 400,
          borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          bgcolor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(20px)',
          position: 'absolute', right: 0, top: 0, bottom: 0,
          transform: showStepPalette || selectedStepData ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex', flexDirection: 'column',
          p: 4
        }}>
          {showStepPalette ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" fontWeight="900" fontStyle="italic">Blueprint Palette</Typography>
                <IconButton onClick={() => setShowStepPalette(false)} size="small">
                  <X size={20} />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                {STEP_TYPES.map(type => (
                  <Card
                    key={type.type}
                    onClick={() => addStep(type.type)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: alpha(theme.palette.common.white, 0.05),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      borderRadius: '1.5rem',
                      '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1), transform: 'scale(1.02)' },
                      transition: 'all 0.2s'
                    }}
                  >
                    <CardContent sx={{ p: 2, display: 'flex', gap: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{
                        p: 2, borderRadius: '12px', bgcolor: theme.palette.background.default,
                        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                        color: `text.primary`
                      }}>
                        {type.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{type.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{type.description}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </>
          ) : selectedStepData ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" fontWeight="900" fontStyle="italic">Step Intelligence</Typography>
                <IconButton onClick={() => setSelectedStep(null)} size="small">
                  <X size={20} />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Operational Name</Typography>
                  <TextField
                    fullWidth
                    value={selectedStepData.name}
                    onChange={(e) => setSteps(steps.map(s => s.id === selectedStepData.id ? { ...s, name: e.target.value } : s))}
                    variant="filled"
                  />
                </Box>
                <Box sx={{ p: 3, borderRadius: '1.5rem', bgcolor: alpha(theme.palette.info.main, 0.1), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="info.light" gutterBottom>Neural Configuration</Typography>
                  <Typography variant="caption" color="text.secondary">Defining hardware and logic constraints for this specific operational node. Advanced variables will appear below.</Typography>
                </Box>
              </Box>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default PipelineBuilderPage;
