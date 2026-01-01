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
  ArrowLeft,
  ArrowRight,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.03'%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10 space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Data Import
            </h1>
            <p className="text-slate-400 text-lg">
              Upload and import data from CSV or Excel files with validation and preview
            </p>
          </div>

          <button
            onClick={resetImport}
            className="backdrop-blur-md bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-white/20 text-slate-300 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-500/30 hover:to-slate-600/30 transition-all duration-300 hover:scale-105"
          >
            <Upload className="w-4 h-4 mr-2" />
            New Import
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import Process */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: File Upload */}
            {uploadStep === 'upload' && (
                <div>test</div>
              )}

            {/* upload step temporarily disabled */}
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold backdrop-blur-sm ${
                    selectedFile ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    1
                    {selectedFile && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-white">Upload Data File</h3>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-purple-500/10 scale-[1.02]'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* Glow effect when dragging */}
                  {dragActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl animate-pulse"></div>
                  )}

                  <div className="relative z-10">
                    <div className="relative inline-block mb-6">
                      <Upload className={`mx-auto h-16 w-16 ${dragActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      {dragActive && (
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg animate-pulse"></div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg text-slate-300">
                        Drag and drop your file here, or{' '}
                        <label className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold transition-colors">
                          browse files
                          <input
                            type="file"
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </p>
                      <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          CSV files
                        </span>
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                          Excel files
                        </span>
                        <span className="text-slate-400">Up to 50MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="mt-8">
                    <div className="backdrop-blur-md bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-white/20 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10">
                            <FileText className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white">{selectedFile.name}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span>{formatFileSize(selectedFile.size)}</span>
                              <span>•</span>
                              <span>{selectedFile.type}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handlePreview}
                          disabled={uploading}
                          className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {uploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview Data
                            </>
                          )}
                        </button>
                      </div>

                    {/* File configuration options */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Header Row
                        </label>
                        <select
                          value={hasHeader.toString()}
                          onChange={(e) => setHasHeader(e.target.value === 'true')}
                          className="block w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 backdrop-blur-sm"
                        >
                          <option value="true" className="bg-slate-800">Has header row</option>
                          <option value="false" className="bg-slate-800">No header row</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Encoding
                        </label>
                        <select
                          value={encoding}
                          onChange={(e) => setEncoding(e.target.value)}
                          className="block w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 backdrop-blur-sm"
                        >
                          <option value="utf8" className="bg-slate-800">UTF-8 (Recommended)</option>
                          <option value="latin1" className="bg-slate-800">Latin-1</option>
                          <option value="ascii" className="bg-slate-800">ASCII</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Separator
                        </label>
                        <select
                          value={separator}
                          onChange={(e) => setSeparator(e.target.value)}
                          className="block w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 backdrop-blur-sm"
                        >
                          <option value="," className="bg-slate-800">Comma (,)</option>
                          <option value=";" className="bg-slate-800">Semicolon (;)</option>
                          <option value="\t" className="bg-slate-800">Tab</option>
                          <option value="|" className="bg-slate-800">Pipe (|)</option>
                        </select>
                      </div>
                    </div>
                </div>
              )
            </div>
          )}

            {/* Step 2: Data Preview */}
            {uploadStep === 'preview' && uploadResult && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm">
                      2
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="ml-4 text-xl font-semibold text-white">Data Preview</h3>
                  </div>
                  <button
                    onClick={() => setUploadStep('upload')}
                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-300">{uploadResult.rowCount.toLocaleString()}</div>
                      <div className="text-sm text-blue-200">Total Rows</div>
                    </div>
                    <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-300">{uploadResult.columnCount}</div>
                      <div className="text-sm text-purple-200">Columns</div>
                    </div>
                    <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-300">{formatFileSize(uploadResult.preview.reduce((acc, row) => acc + JSON.stringify(row).length, 0))}</div>
                      <div className="text-sm text-green-200">Sample Size</div>
                    </div>
                  </div>
                </div>

                {/* Data preview table */}
                <div className="backdrop-blur-md bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
                        <tr>
                          {uploadResult.columns.map((column, index) => (
                            <th
                              key={index}
                              className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-white/10"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {uploadResult.preview.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                            {uploadResult.columns.map((column, colIndex) => (
                              <td
                                key={colIndex}
                                className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap"
                              >
                                <span className="font-mono bg-slate-800/50 px-2 py-1 rounded border border-white/10">
                                  {row[column]?.toString() || ''}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 py-3 bg-slate-800/30 border-t border-white/10">
                    <p className="text-xs text-slate-400 text-center">
                      Showing first 5 rows of {uploadResult.rowCount.toLocaleString()} total rows
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setUploadStep('upload')}
                    className="backdrop-blur-md bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-slate-500/30 text-slate-300 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-500/30 hover:to-slate-600/30 transition-all duration-300 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Upload
                  </button>
                  <button
                    onClick={() => setUploadStep('validate')}
                    className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105 font-medium"
                  >
                    Continue to Validation
                    <ArrowRight className="w-4 h-4 ml-2" />
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
          <div className="space-y-8">
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Import History</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>

              {loadingHistory ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="backdrop-blur-sm bg-slate-800/50 border border-white/10 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : importHistory.length > 0 ? (
                <div className="space-y-4">
                  {importHistory.map((item) => (
                    <div key={item.id} className="group backdrop-blur-md bg-gradient-to-r from-slate-800/30 to-slate-700/30 border border-white/10 rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-xl backdrop-blur-sm border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors truncate">
                            {item.filename}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                            <span>{new Date(item.uploadedAt).toLocaleString()}</span>
                            {item.rowCount && (
                              <>
                                <span>•</span>
                                <span>{item.rowCount.toLocaleString()} rows</span>
                              </>
                            )}
                          </div>
                          {item.errorMessage && (
                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <p className="text-xs text-red-300">{item.errorMessage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-6">
                    <FileText className="mx-auto h-16 w-16 text-slate-500" />
                    <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">No imports yet</h3>
                  <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                    Your import history will appear here once you start importing data files
                  </p>

                  <div className="inline-flex items-center text-sm text-blue-400">
                    <Info className="w-4 h-4 mr-2" />
                    Start by uploading a CSV or Excel file
                  </div>
                </div>
              )}
          </div>

            {/* Quick Actions */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={resetImport}
                  className="w-full group flex items-center backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Start New Import</span>
                </button>

                <button className="w-full group flex items-center backdrop-blur-md bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-300 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 hover:scale-105">
                  <Download className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Download Template</span>
                </button>

                <button className="w-full group flex items-center backdrop-blur-md bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-300 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 hover:scale-105">
                  <Settings className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Import Settings</span>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportPage;
