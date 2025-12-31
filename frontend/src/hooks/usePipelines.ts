/**
 * Pipelines Hooks
 *
 * Custom hooks untuk mengelola pipelines dengan caching, pagination,
 * dan real-time updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { pipelinesService, Pipeline, CreatePipelineDto, UpdatePipelineDto, ExecutePipelineDto, PipelineExecutionResult } from '../services/pipelines.service';

/**
 * Hook untuk mendapatkan daftar pipelines dengan filter dan pagination
 */
export const usePipelines = (filters?: {
  search?: string;
  isActive?: boolean;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pipelinesService.getPipelines({
        ...filters,
        page: filters?.page || page,
      });
      setPipelines(response.pipelines);
      setTotal(response.total);
      setPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipelines');
      setPipelines([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  const createPipeline = useCallback(async (pipelineData: CreatePipelineDto) => {
    try {
      const newPipeline = await pipelinesService.createPipeline(pipelineData);
      setPipelines(prev => [newPipeline, ...prev]);
      setTotal(prev => prev + 1);
      return newPipeline;
    } catch (err) {
      throw err;
    }
  }, []);

  const updatePipeline = useCallback(async (id: string, pipelineData: UpdatePipelineDto) => {
    try {
      const updatedPipeline = await pipelinesService.updatePipeline(id, pipelineData);
      setPipelines(prev => prev.map(p => p.id === id ? updatedPipeline : p));
      return updatedPipeline;
    } catch (err) {
      throw err;
    }
  }, []);

  const deletePipeline = useCallback(async (id: string) => {
    try {
      await pipelinesService.deletePipeline(id);
      setPipelines(prev => prev.filter(p => p.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      throw err;
    }
  }, []);

  const duplicatePipeline = useCallback(async (id: string) => {
    try {
      const duplicatedPipeline = await pipelinesService.duplicatePipeline(id);
      setPipelines(prev => [duplicatedPipeline, ...prev]);
      setTotal(prev => prev + 1);
      return duplicatedPipeline;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    pipelines,
    total,
    page,
    loading,
    error,
    refetch: fetchPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    duplicatePipeline,
    setPage,
  };
};

/**
 * Hook untuk mendapatkan detail pipeline tertentu
 */
export const usePipeline = (id: string | undefined) => {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    if (!id) {
      setPipeline(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const pipelineData = await pipelinesService.getPipeline(id);
      setPipeline(pipelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline');
      setPipeline(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const updatePipeline = useCallback(async (pipelineData: UpdatePipelineDto) => {
    if (!id) throw new Error('Pipeline ID is required');

    try {
      const updatedPipeline = await pipelinesService.updatePipeline(id, pipelineData);
      setPipeline(updatedPipeline);
      return updatedPipeline;
    } catch (err) {
      throw err;
    }
  }, [id]);

  const executePipeline = useCallback(async (executionData: ExecutePipelineDto) => {
    if (!id) throw new Error('Pipeline ID is required');

    try {
      const result = await pipelinesService.executePipeline(id, executionData);
      return result;
    } catch (err) {
      throw err;
    }
  }, [id]);

  return {
    pipeline,
    loading,
    error,
    refetch: fetchPipeline,
    updatePipeline,
    executePipeline,
  };
};

/**
 * Hook untuk eksekusi pipeline dengan progress tracking
 */
export const usePipelineExecution = () => {
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);
  const [result, setResult] = useState<PipelineExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    pipelineId: string,
    executionData: ExecutePipelineDto,
    onProgress?: (progress: { current: number; total: number; message: string }) => void
  ) => {
    try {
      setExecuting(true);
      setProgress(null);
      setResult(null);
      setError(null);

      // Simulate progress updates (in real implementation, this would come from WebSocket)
      const simulateProgress = (step: number, total: number, message: string) => {
        setProgress({ current: step, total, message });
        onProgress?.({ current: step, total, message });
      };

      simulateProgress(0, 4, 'Initializing pipeline execution...');

      const executionResult = await pipelinesService.executePipeline(pipelineId, executionData);

      simulateProgress(1, 4, 'Pipeline execution started...');
      await new Promise(resolve => setTimeout(resolve, 500));

      simulateProgress(2, 4, 'Processing data...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      simulateProgress(3, 4, 'Finalizing results...');
      await new Promise(resolve => setTimeout(resolve, 500));

      simulateProgress(4, 4, 'Execution completed');

      setResult(executionResult);
      return executionResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pipeline execution failed');
      throw err;
    } finally {
      setExecuting(false);
      setTimeout(() => setProgress(null), 2000); // Clear progress after 2 seconds
    }
  }, []);

  return {
    executing,
    progress,
    result,
    error,
    execute,
  };
};

/**
 * Hook untuk mendapatkan pipeline templates
 */
export const usePipelineTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pipelinesService.getPipelineTemplates();
      setTemplates(response.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
  };
};
