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
  Database,
  Search,
  History as HistoryIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { dataService, ImportHistoryItem, FilePreviewResult, ValidationResult } from '../services/data.service';
import { useToast } from '../context/ToastContext';

const DataImportPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { success, error: toastError, info, warning } = useToast();

  // State management
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'validate' | 'import'>('upload');
  const [uploadResult, setUploadResult] = useState<FilePreviewResult | null>(null);
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

    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      warning('Invalid File Type', 'Please select a CSV or Excel file');
      return;
    }

    if (file.size > maxSize) {
      warning('File Too Large', 'File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setUploadStep('upload');
    setUploadResult(null);
    setValidationResult(null);
    info('File Loaded', `"${file.name}" is ready for preview`);
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      info('Processing', 'Analyzing file structure and content...');
      const result = await dataService.uploadFileForPreview(selectedFile, {
        hasHeader: hasHeader,
        encoding,
        delimiter: separator,
        maxRows: 10,
      });
      setUploadResult(result);
      setUploadStep('preview');
      success('Processing Complete', 'Preview data generated successfully');
    } catch (error: any) {
      toastError('Preview Failed', error.message || 'System encountered an error during file analysis');
    } finally {
      setUploading(false);
    }
  };

  const handleValidate = async () => {
    if (!uploadResult) return;

    try {
      setValidating(true);
      info('Validation', 'Verifying data integrity and constraints...');
      const result = await dataService.validateData(uploadResult.fileId, validationRules);
      setValidationResult(result);
      setUploadStep('validate');
      if (result.isValid) {
        success('Validation Passed', 'Data conforms to all defined protocols');
      } else {
        warning('Validation Issues', 'Data contains inconsistencies that require attention');
      }
    } catch (error: any) {
      toastError('Validation Error', error.message || 'An unexpected protocol error occurred');
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!uploadResult || !selectedFile) return;

    try {
      setImporting(true);
      info('Initializing Import', 'Commencing data transmission sequence...');
      const uploadResponse = await api.uploadFile('/data/upload', selectedFile);
      const importId = uploadResponse.id;
      const result = await dataService.processImport(importId);
      success('Import Queued', `Sequence initialized successfully. Job ID: ${result.jobId}`);
      resetImport();
      loadImportHistory();
    } catch (error: any) {
      toastError('Import Failed', error.message || 'Data transmission was interrupted');
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
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 space-y-8 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Data Transmission
            </h1>
            <p className="text-slate-400 text-lg font-medium">Ingest and analyze external datasets into the system core</p>
          </div>

          <button
            onClick={resetImport}
            className="inline-flex items-center px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold transition-all transform hover:scale-105"
          >
            <Upload className="w-5 h-5 mr-3" />
            Initialize New Uplink
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Step Indicators */}
            <div className="flex items-center justify-between px-4">
              {['upload', 'preview', 'validate', 'import'].map((step, idx) => {
                const isActive = uploadStep === step;
                const isPast = ['upload', 'preview', 'validate', 'import'].indexOf(uploadStep) > idx;
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${isActive ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                      isPast ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                        'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                      {isPast ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < 3 && <div className={`w-8 h-0.5 mx-2 bg-slate-800 ${isPast ? 'bg-emerald-500/20' : ''}`}></div>}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Upload */}
            {uploadStep === 'upload' && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 animate-fadeInUp">
                <div
                  className={`relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 ${dragActive ? 'border-blue-400 bg-blue-500/10 scale-[1.02]' : 'border-white/10 hover:border-white/20'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="relative z-10 space-y-6">
                    <div className="relative inline-flex p-6 bg-slate-900 rounded-3xl border border-white/10 shadow-2xl">
                      <Upload className={`h-12 w-12 ${dragActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">Select Distribution File</h3>
                      <p className="text-slate-500 font-medium">Drag and drop or <span className="text-blue-400 hover:underline cursor-pointer"><label>browse nodes<input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} /></label></span></p>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      {['CSV', 'Excel', 'JSON'].map(ext => (
                        <span key={ext} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">{ext}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="backdrop-blur-md bg-slate-900/40 border border-white/10 rounded-3xl p-8 space-y-8 animate-fadeInUp">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-white/10">
                          <FileText className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{selectedFile.name}</h4>
                          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{formatFileSize(selectedFile.size)} • Protocol: {selectedFile.type.split('/')[1] || 'binary'}</p>
                        </div>
                      </div>
                      <button
                        onClick={handlePreview}
                        disabled={uploading}
                        className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-2xl hover:bg-blue-500 transition-all disabled:opacity-50"
                      >
                        {uploading ? <RefreshCw className="w-5 h-5 animate-spin mr-3" /> : <Play className="w-5 h-5 mr-3" />}
                        Execute Analysis
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Metadata Header</label>
                        <select value={hasHeader.toString()} onChange={(e) => setHasHeader(e.target.value === 'true')} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="true" className="bg-slate-900">Header Present</option>
                          <option value="false" className="bg-slate-900">Raw Data Stream</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Data Encoding</label>
                        <select value={encoding} onChange={(e) => setEncoding(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="utf8" className="bg-slate-900">Universal (UTF-8)</option>
                          <option value="latin1" className="bg-slate-900">Legacy (Latin-1)</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Field Segregation</label>
                        <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="," className="bg-slate-900">Comma (Default)</option>
                          <option value=";" className="bg-slate-900">Semicolon</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Preview */}
            {uploadStep === 'preview' && uploadResult && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 animate-fadeInUp">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter">Content Analysis</h3>
                  <div className="flex items-center space-x-2">
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <span className="text-blue-400 font-black tracking-widest">{uploadResult.rowCount.toLocaleString()} NODES</span>
                    </div>
                    <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <span className="text-purple-400 font-black tracking-widest">{uploadResult.columnCount} VECTORS</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          {uploadResult.columns.map((column, i) => <th key={i} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10">{column}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {uploadResult.preview.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            {uploadResult.columns.map((col, j) => <td key={j} className="px-6 py-4 text-sm text-slate-400 font-medium whitespace-nowrap">{row[col]?.toString() || ''}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button onClick={() => setUploadStep('upload')} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all">Abort Protocol</button>
                  <button onClick={() => setUploadStep('validate')} className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-2xl hover:scale-105 transition-all">Validate Sequence</button>
                </div>
              </div>
            )}

            {/* Step 3: Validate */}
            {uploadStep === 'validate' && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 animate-fadeInUp">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <h3 className="text-2xl font-black text-white">Integrity Protocol</h3>
                  <button onClick={() => setUploadStep('preview')} className="p-2 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Mandatory Vector Map</label>
                    <input
                      type="text"
                      value={validationRules.requiredColumns.join(', ')}
                      onChange={(e) => setValidationRules(prev => ({ ...prev, requiredColumns: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. unique_id, timestamp, payload..."
                    />
                  </div>

                  {validationResult && (
                    <div className={`p-8 rounded-[2rem] border-2 backdrop-blur-xl animate-scaleIn ${validationResult.isValid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-3 rounded-2xl ${validationResult.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {validationResult.isValid ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className={`text-xl font-black ${validationResult.isValid ? 'text-emerald-400' : 'text-red-400'}`}>{validationResult.isValid ? 'SYSTEM INTEGRITY VERIFIED' : 'INTEGRITY BREACH IDENTIFIED'}</h4>
                          <p className="text-sm font-medium text-slate-500">{validationResult.isValid ? 'All vectors conform to system architecture' : 'Protocol violations detected in data stream'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button onClick={() => setUploadStep('preview')} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all">Reverse Node</button>
                  <div className="flex items-center space-x-4">
                    <button onClick={handleValidate} disabled={validating} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black hover:bg-white/10 transition-all">
                      {validating ? 'Verifying...' : 'Initiate Scan'}
                    </button>
                    {validationResult?.isValid && (
                      <button onClick={() => setUploadStep('import')} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl hover:bg-indigo-500 transition-all animate-glow">
                        Begin Transmission
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Import */}
            {uploadStep === 'import' && uploadResult && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-12 space-y-10 text-center animate-fadeInUp">
                <div className="relative inline-flex p-8 bg-blue-500/10 rounded-[3rem] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                  <Database className="w-16 h-16 text-blue-400 animate-pulse" />
                </div>
                <div className="space-y-4 max-w-md mx-auto">
                  <h3 className="text-3xl font-black text-white">Final Synchronization</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Ready to distribute <span className="text-blue-400 font-black">{uploadResult.rowCount.toLocaleString()} records</span> from uplink node <span className="text-white italic">"{uploadResult.filename}"</span> into primary system storage.
                  </p>
                </div>
                <div className="flex justify-center items-center space-x-6">
                  <button onClick={() => setUploadStep('validate')} className="px-12 py-4 text-slate-500 font-black uppercase tracking-widest hover:text-white transition-all">Cancel Sequence</button>
                  <button onClick={handleImport} disabled={importing} className="px-16 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all">
                    {importing ? 'Synchronizing...' : 'Authorize Uplink'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white italic tracking-tighter">Transmission Logs</h3>
                <HistoryIcon className="w-5 h-5 text-slate-500" />
              </div>
              <div className="space-y-4">
                {importHistory.map((item) => (
                  <div key={item.id} className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors truncate max-w-[120px]">{item.name}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="text-slate-400">{item.totalRows} NODES</span>
                    </div>
                  </div>
                ))}
                {importHistory.length === 0 && !loadingHistory && (
                  <div className="py-12 text-center space-y-2">
                    <Database className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="text-[10px] font-black tracking-widest text-slate-600 uppercase">Log Empty</p>
                  </div>
                )}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
              <h3 className="text-xl font-black text-white italic tracking-tighter">System Directives</h3>
              <div className="space-y-4">
                <button onClick={resetImport} className="w-full flex items-center p-5 bg-blue-500/10 border border-blue-500/20 rounded-3xl group hover:bg-blue-500/20 transition-all">
                  <div className="p-3 bg-slate-900 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Initialize Uplink</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase">Primary Data Ingest</div>
                  </div>
                </button>
                <a
                  href="https://github.com/lukaririnki26/DataBuddy/blob/main/docs/database-setup.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center p-5 bg-purple-500/10 border border-purple-500/20 rounded-3xl group hover:bg-purple-500/20 transition-all text-left"
                >
                  <div className="p-3 bg-slate-900 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Fetch Blueprint</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase">Schema Template</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportPage;
