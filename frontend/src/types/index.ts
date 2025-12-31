export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  steps: PipelineStep[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface PipelineStep {
  id: string;
  type: 'read' | 'transform' | 'validate' | 'write' | 'export';
  config: Record<string, any>;
  order: number;
}

export interface DataImport {
  id: string;
  filename: string;
  fileType: 'csv' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  errors: string[];
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
