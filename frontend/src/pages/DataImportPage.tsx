import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings,
  Play,
  X,
  Download,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { dataService, ImportHistoryItem } from '../services/data.service';

interface FileUploadResult {
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  preview: any[];
}

interface ValidationResult {
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

// ImportHistoryItem interface moved to data.service.ts

const DataImportPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // State management
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'validate' | 'import'>('upload');
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);

  // Loading states
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form data
  const [hasHeader, setHasHeader] = useState(true);
  const [encoding, setEncoding] = useState('utf8');
  const [separator, setSeparator] = useState(',');
  const [validationRules, setValidationRules] = useState({
    requiredColumns: [] as string[],
    dataTypes: {} as Record<string, 'string' | 'number' | 'date' | 'boolean'>,
    customRules: [] as Array<{
      column: string;
      rule: string;
      message: string;
    }>,
  });

  // Load import history on component mount
  React.useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await dataService.getImportHistory(10);
      setImportHistory(history);
    } catch (error) {
      console.error('Failed to load import history:', error);
      // Fallback to empty array if API fails
      setImportHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Please select a CSV or Excel file');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setUploadStep('upload');
    setUploadResult(null);
    setValidationResult(null);
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const result = await dataService.uploadFileForPreview(selectedFile, {
        hasHeader: hasHeader,
        encoding,
        delimiter: separator,
        maxRows: 10, // Preview first 10 rows
      });

      setUploadResult(result);
      setUploadStep('preview');
    } catch (error: any) {
      alert(`Preview failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleValidate = async () => {
    if (!uploadResult) return;

    try {
      setValidating(true);

      const result = await dataService.validateData(uploadResult.fileId, validationRules);

      setValidationResult(result);
      setUploadStep('validate');
    } catch (error: any) {
      alert(`Validation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!uploadResult) return;

    try {
      setImporting(true);

      // Create import record first
      const importData = {
        name: uploadResult.filename,
        sourceType: 'file_upload',
        fileFormat: uploadResult.mimeType.includes('csv') ? 'csv' : 'xlsx',
        originalFileName: uploadResult.filename,
      };

      // Upload file first to get import ID
      const uploadResponse = await api.uploadFile('/data/upload', selectedFile!);
      const importId = uploadResponse.id;

      // Process import with pipeline (if available)
      const result = await dataService.processImport(importId);

      alert(`Import job queued successfully! Job ID: ${result.jobId}`);

      // Reset form
      setSelectedFile(null);
      setUploadResult(null);
      setValidationResult(null);
      setUploadStep('upload');

      // Reload history
      loadImportHistory();
    } catch (error: any) {
      alert(`Import failed: ${error.message || 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setValidationResult(null);
    setUploadStep('upload');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Settings className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload and import data from CSV or Excel files with validation and preview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Process */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: File Upload */}
          {uploadStep === 'upload' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  selectedFile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  1
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Upload Data File</h3>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Drag and drop your file here, or{' '}
                    <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports CSV and Excel files up to 50MB
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handlePreview}
                      disabled={uploading}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Processing...' : 'Preview'}
                    </button>
                  </div>

                  {/* File configuration options */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Has Header Row
                      </label>
                      <select
                        value={hasHeader.toString()}
                        onChange={(e) => setHasHeader(e.target.value === 'true')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Encoding
                      </label>
                      <select
                        value={encoding}
                        onChange={(e) => setEncoding(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="utf8">UTF-8</option>
                        <option value="latin1">Latin-1</option>
                        <option value="ascii">ASCII</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Separator
                      </label>
                      <select
                        value={separator}
                        onChange={(e) => setSeparator(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="\t">Tab</option>
                        <option value="|">Pipe (|)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Data Preview */}
          {uploadStep === 'preview' && uploadResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    2
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Data Preview</h3>
                </div>
                <button
                  onClick={() => setUploadStep('upload')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Found {uploadResult.rowCount} rows and {uploadResult.columnCount} columns
                </p>
              </div>

              {/* Data preview table */}
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {uploadResult.columns.map((column, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uploadResult.preview.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {uploadResult.columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap"
                          >
                            {row[column]?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setUploadStep('upload')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={() => setUploadStep('validate')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                >
                  Continue to Validation
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Data Validation */}
          {uploadStep === 'validate' && uploadResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    3
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Data Validation</h3>
                </div>
                <button
                  onClick={() => setUploadStep('preview')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Validation rules form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Columns (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={validationRules.requiredColumns.join(', ')}
                    onChange={(e) => setValidationRules(prev => ({
                      ...prev,
                      requiredColumns: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    placeholder="e.g., name, email, id"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Types
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {uploadResult.columns.map(column => (
                      <div key={column} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-32">{column}:</span>
                        <select
                          value={validationRules.dataTypes[column] || ''}
                          onChange={(e) => setValidationRules(prev => ({
                            ...prev,
                            dataTypes: {
                              ...prev.dataTypes,
                              [column]: e.target.value as 'string' | 'number' | 'date' | 'boolean'
                            }
                          }))}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Any</option>
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="boolean">Boolean</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation results */}
              {validationResult && (
                <div className="border-t pt-6">
                  <div className="flex items-center mb-4">
                    {validationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={`text-sm font-medium ${
                      validationResult.isValid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {validationResult.isValid ? 'Validation passed' : 'Validation failed'}
                    </span>
                  </div>

                  {validationResult.errors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-red-700 mb-2">Errors ({validationResult.errors.length})</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {validationResult.errors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            Row {error.row}, Column "{error.column}": {error.error}
                          </div>
                        ))}
                        {validationResult.errors.length > 10 && (
                          <div className="text-xs text-red-600">
                            ... and {validationResult.errors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-yellow-700 mb-2">Warnings ({validationResult.warnings.length})</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {validationResult.warnings.slice(0, 5).map((warning, index) => (
                          <div key={index} className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                            Row {warning.row}, Column "{warning.column}": {warning.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setUploadStep('preview')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                >
                  Back
                </button>
                <div className="space-x-2">
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {validating ? 'Validating...' : 'Validate'}
                  </button>
                  {validationResult?.isValid && (
                    <button
                      onClick={() => setUploadStep('import')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      Continue to Import
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Import Configuration */}
          {uploadStep === 'import' && uploadResult && validationResult?.isValid && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    4
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Import Configuration</h3>
                </div>
                <button
                  onClick={() => setUploadStep('validate')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Import Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">File:</span>
                      <span className="ml-2 font-medium">{uploadResult.filename}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rows:</span>
                      <span className="ml-2 font-medium">{uploadResult.rowCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Columns:</span>
                      <span className="ml-2 font-medium">{uploadResult.columnCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Validation:</span>
                      <span className="ml-2 font-medium text-green-600">Passed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Ready to import!</p>
                      <p className="mt-1">
                        Your data has been validated and is ready to be imported.
                        The import will be processed in the background and you will receive a notification when complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setUploadStep('validate')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Import
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Import History Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Import History</h3>

            {loadingHistory ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : importHistory.length > 0 ? (
              <div className="space-y-4">
                {importHistory.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className={`p-1 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.uploadedAt).toLocaleString()}
                        {item.rowCount && ` • ${item.rowCount.toLocaleString()} rows`}
                      </p>
                      {item.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{item.errorMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No imports yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your import history will appear here
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={resetImport}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Upload className="w-4 h-4 mr-3" />
                Start New Import
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                <Download className="w-4 h-4 mr-3" />
                Download Template
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                <Settings className="w-4 h-4 mr-3" />
                Import Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportPage;
