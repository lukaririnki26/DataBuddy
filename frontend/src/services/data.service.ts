/**
 * Data Service
 *
 * Service untuk mengelola operasi data di frontend DataBuddy termasuk:
 * - Import history
 * - Export history
 * - File upload dan validation
 * - Data preview dan processing
 */

import { api } from './api';

// Types
export interface ImportHistoryItem {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  sourceType: string;
  fileFormat: string;
  originalFileName?: string;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  skippedRows: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ExportHistoryItem {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  destinationType: string;
  fileFormat: string;
  outputFileName?: string;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export interface FilePreviewResult {
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  preview: any[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    column: string;
    value: any;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    column: string;
    message: string;
  }>;
}

/**
 * Data Service Class
 */
class DataService {
  /**
   * Get import history untuk user tertentu
   */
  async getImportHistory(limit: number = 20): Promise<ImportHistoryItem[]> {
    try {
      const response = await api.get(`/data/imports?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch import history:', error);
      throw error;
    }
  }

  /**
   * Get export history untuk user tertentu
   */
  async getExportHistory(limit: number = 20): Promise<ExportHistoryItem[]> {
    try {
      const response = await api.get(`/data/exports?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      throw error;
    }
  }

  /**
   * Upload file untuk preview
   */
  async uploadFileForPreview(
    file: File,
    options: {
      hasHeader?: boolean;
      encoding?: string;
      delimiter?: string;
      maxRows?: number;
    } = {},
    onProgress?: (progress: number) => void
  ): Promise<FilePreviewResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add options sebagai query parameters atau body
      const queryParams = new URLSearchParams();
      if (options.hasHeader !== undefined) queryParams.append('hasHeader', options.hasHeader.toString());
      if (options.encoding) queryParams.append('encoding', options.encoding);
      if (options.delimiter) queryParams.append('delimiter', options.delimiter);
      if (options.maxRows) queryParams.append('maxRows', options.maxRows.toString());

      const response = await api.uploadFile(
        `/data/preview?${queryParams.toString()}`,
        file,
        onProgress
      );
      return response;
    } catch (error) {
      console.error('Failed to upload file for preview:', error);
      throw error;
    }
  }

  /**
   * Validate data sebelum import
   */
  async validateData(
    fileId: string,
    validationRules: {
      requiredColumns?: string[];
      dataTypes?: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
      customRules?: Array<{
        column: string;
        rule: string;
        message: string;
      }>;
    }
  ): Promise<ValidationResult> {
    try {
      const response = await api.post('/data/validate', {
        fileId,
        validationRules,
      });
      return response;
    } catch (error) {
      console.error('Failed to validate data:', error);
      throw error;
    }
  }

  /**
   * Process import dengan pipeline
   */
  async processImport(
    importId: string,
    pipelineId?: string
  ): Promise<{ import: ImportHistoryItem; jobId: string }> {
    try {
      const response = await api.post(`/data/imports/${importId}/process`, {
        pipelineId,
      });
      return response;
    } catch (error) {
      console.error('Failed to process import:', error);
      throw error;
    }
  }

  /**
   * Export data menggunakan pipeline
   */
  async exportData(
    pipelineId: string,
    options: {
      format: 'csv' | 'xlsx' | 'json';
      filename: string;
      filters?: Record<string, any>;
    }
  ): Promise<{ jobId: string; estimatedCompletion: Date }> {
    try {
      const response = await api.post('/data/export', {
        pipelineId,
        ...options,
      });
      return response;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Download exported file
   */
  async downloadExportFile(filename: string): Promise<Blob> {
    try {
      const response = await api.get(`/data/exports/${filename}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error('Failed to download export file:', error);
      throw error;
    }
  }

  /**
   * Delete import record
   */
  async deleteImport(importId: string): Promise<void> {
    try {
      await api.delete(`/data/imports/${importId}`);
    } catch (error) {
      console.error('Failed to delete import:', error);
      throw error;
    }
  }

  /**
   * Get import details
   */
  async getImportDetails(importId: string): Promise<ImportHistoryItem> {
    try {
      const response = await api.get(`/data/imports/${importId}`);
      return response;
    } catch (error) {
      console.error('Failed to get import details:', error);
      throw error;
    }
  }

  /**
   * Get export details
   */
  async getExportDetails(exportId: string): Promise<ExportHistoryItem> {
    try {
      const response = await api.get(`/data/exports/${exportId}`);
      return response;
    } catch (error) {
      console.error('Failed to get export details:', error);
      throw error;
    }
  }

  /**
   * Get data preview dari file yang sudah diupload
   */
  async getDataPreview(
    importId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    data: any[];
    totalRows: number;
    columns: string[];
  }> {
    try {
      const response = await api.get(`/data/imports/${importId}/preview`, {
        params: options,
      });
      return response;
    } catch (error) {
      console.error('Failed to get data preview:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const dataService = new DataService();

// Export default
export default dataService;
