/**
 * Pipelines API Service
 *
 * Service untuk berkomunikasi dengan pipelines endpoints di backend.
 * Menangani CRUD operations untuk pipelines dan eksekusi pipeline.
 */

import { api } from './api';

// Types
export interface PipelineStep {
  id: string;
  type: string;
  config: Record<string, any>;
  order: number;
  name?: string;
  description?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  steps: PipelineStep[];
  tags?: string[];
  category?: string;
}

export interface CreatePipelineDto {
  name: string;
  description: string;
  steps: Omit<PipelineStep, 'id'>[];
  tags?: string[];
  category?: string;
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  steps?: Omit<PipelineStep, 'id'>[];
  isActive?: boolean;
  tags?: string[];
  category?: string;
}

export interface ExecutePipelineDto {
  inputData?: any[];
  parameters?: Record<string, any>;
}

export interface PipelineExecutionResult {
  success: boolean;
  processedItems: number;
  errors: string[];
  warnings: string[];
  executionTime: number;
  metadata: Record<string, any>;
}

export interface PipelineStats {
  totalPipelines: number;
  activePipelines: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
}

/**
 * Pipelines Service Class
 */
export class PipelinesService {
  /**
   * Get all pipelines dengan filter dan pagination
   */
  async getPipelines(filters?: {
    search?: string;
    isActive?: boolean;
    category?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    pipelines: Pipeline[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<{
      pipelines: Pipeline[];
      total: number;
      page: number;
      limit: number;
    }>(`/pipelines?${params.toString()}`);

    return response;
  }

  /**
   * Get pipeline by ID
   */
  async getPipeline(id: string): Promise<Pipeline> {
    return api.get<Pipeline>(`/pipelines/${id}`);
  }

  /**
   * Create new pipeline
   */
  async createPipeline(pipelineData: CreatePipelineDto): Promise<Pipeline> {
    return api.post<Pipeline>('/pipelines', pipelineData);
  }

  /**
   * Update existing pipeline
   */
  async updatePipeline(id: string, pipelineData: UpdatePipelineDto): Promise<Pipeline> {
    return api.patch<Pipeline>(`/pipelines/${id}`, pipelineData);
  }

  /**
   * Delete pipeline
   */
  async deletePipeline(id: string): Promise<void> {
    return api.delete(`/pipelines/${id}`);
  }

  /**
   * Duplicate pipeline
   */
  async duplicatePipeline(id: string): Promise<Pipeline> {
    return api.post<Pipeline>(`/pipelines/${id}/duplicate`);
  }

  /**
   * Execute pipeline
   */
  async executePipeline(id: string, executionData: ExecutePipelineDto): Promise<PipelineExecutionResult> {
    return api.post<PipelineExecutionResult>(`/pipelines/${id}/execute`, executionData);
  }

  /**
   * Get pipeline execution history
   */
  async getPipelineExecutions(
    pipelineId: string,
    filters?: {
      status?: 'success' | 'failed' | 'running';
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return api.get<any[]>(`/pipelines/${pipelineId}/executions?${params.toString()}`);
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(): Promise<PipelineStats> {
    return api.get<PipelineStats>('/pipelines/stats');
  }

  /**
   * Validate pipeline configuration
   */
  async validatePipeline(pipelineData: CreatePipelineDto | UpdatePipelineDto): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return api.post('/pipelines/validate', pipelineData);
  }

  /**
   * Get pipeline templates
   */
  async getPipelineTemplates(): Promise<{
    templates: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      steps: Omit<PipelineStep, 'id'>[];
      tags: string[];
    }>;
  }> {
    return api.get('/pipelines/templates');
  }

  /**
   * Export pipeline configuration
   */
  async exportPipeline(id: string, format: 'json' | 'yaml' = 'json'): Promise<string> {
    const response = await api.get(`/pipelines/${id}/export?format=${format}`);
    return JSON.stringify(response, null, 2); // Return as formatted JSON string
  }

  /**
   * Import pipeline from configuration
   */
  async importPipeline(config: any): Promise<Pipeline> {
    return api.post('/pipelines/import', config);
  }

  /**
   * Get pipeline categories
   */
  async getCategories(): Promise<string[]> {
    return api.get<string[]>('/pipelines/categories');
  }

  /**
   * Get pipeline tags
   */
  async getTags(): Promise<string[]> {
    return api.get<string[]>('/pipelines/tags');
  }
}

// Export singleton instance
export const pipelinesService = new PipelinesService();
