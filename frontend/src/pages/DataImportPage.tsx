import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Play,
  X,
  Download,
  Database,
  RefreshCw,
  History as HistoryIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { dataService, ImportHistoryItem, FilePreviewResult, ValidationResult } from '../services/data.service';
import { useToast } from '../context/ToastContext';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha
} from '@mui/material';

const DataImportPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { success, error: toastError, info, warning } = useToast();
  const theme = useTheme();

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

  const getStatusColor = (status: string): { bgcolor: string; color: string; borderColor: string } => {
    switch (status) {
      case 'completed': return { bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.light, borderColor: alpha(theme.palette.success.main, 0.2) };
      case 'processing': return { bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.light, borderColor: alpha(theme.palette.info.main, 0.2) };
      case 'failed': return { bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.light, borderColor: alpha(theme.palette.error.main, 0.2) };
      default: return { bgcolor: alpha(theme.palette.grey[500], 0.1), color: theme.palette.grey[400], borderColor: alpha(theme.palette.grey[500], 0.2) };
    }
  };


  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.background.default,

    }}>
      {/* Background Ambience */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', top: '25%', right: '25%', width: 400, height: 400,
          bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '50%', filter: 'blur(100px)',
          animation: 'blob 7s infinite'
        }} />
        <Box sx={{
          position: 'absolute', bottom: '25%', left: '25%', width: 400, height: 400,
          bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: '50%', filter: 'blur(100px)',
          animation: 'blob 7s infinite 2s'
        }} />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 10, width: '100%', ml: 0, mr: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { lg: 'center' }, gap: 3, mb: 4 }}>
          <Box>
            <Typography variant="h3" fontWeight="900" sx={{
              background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              mb: 1
            }}>
              Neural Ingestion
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="medium" sx={{ opacity: 0.7 }}>
              Synchronizing external datasets into the system core architecture
            </Typography>
          </Box>

          <Button
            onClick={resetImport}
            variant="outlined"
            startIcon={<Upload size={20} />}
          >
            Initialize New Uplink
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Step Indicators */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
              {['upload', 'preview', 'validate', 'import'].map((step, idx) => {
                const isActive = uploadStep === step;
                const isPast = ['upload', 'preview', 'validate', 'import'].indexOf(uploadStep) > idx;
                return (
                  <Box key={step} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                      borderColor: isActive ? theme.palette.primary.main : isPast ? theme.palette.success.main : alpha(theme.palette.grey[700], 0.5),
                      bgcolor: isActive ? theme.palette.primary.main : isPast ? alpha(theme.palette.success.main, 0.2) : theme.palette.background.paper,
                      color: isActive || isPast ? 'white' : 'text.disabled',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '0.875rem'
                    }}>
                      {isPast ? <CheckCircle size={16} /> : idx + 1}
                    </Box>
                    {idx < 3 && <Box sx={{ width: 32, height: 2, mx: 1, bgcolor: isPast ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.grey[700], 0.3) }} />}
                  </Box>
                );
              })}
            </Box>

            {/* Step 1: Upload */}
            {uploadStep === 'upload' && (
              <Card>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    sx={{
                      border: '2px dashed',
                      borderColor: dragActive ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.1),
                      borderRadius: '2rem',
                      p: 8,
                      textAlign: 'center',
                      bgcolor: dragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      transition: 'all 0.3s',
                      '&:hover': { borderColor: alpha(theme.palette.common.white, 0.3) }
                    }}
                  >
                    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: '50%', display: 'inline-flex', mb: 3, boxShadow: 3 }}>
                      <Upload size={48} color={dragActive ? theme.palette.primary.main : theme.palette.text.secondary} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Select Distribution File</Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Drag and drop or <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                        <label>browse nodes<input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} hidden /></label>
                      </Box>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      {['CSV', 'Excel', 'JSON'].map(ext => (
                        <Chip key={ext} label={ext} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                      ))}
                    </Box>
                  </Box>

                  {selectedFile && (
                    <Card sx={{ borderRadius: '2rem', bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
                      <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, borderRadius: '1rem', bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                              <FileText size={32} color={theme.palette.info.light} />
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">{selectedFile.name}</Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {formatFileSize(selectedFile.size)} • Protocol: {selectedFile.type.split('/')[1] || 'binary'}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            onClick={handlePreview}
                            disabled={uploading}
                            variant="contained"
                            startIcon={uploading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                            sx={{ borderRadius: '1rem', fontWeight: 'bold' }}
                          >
                            Execute Analysis
                          </Button>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <TextField
                            select
                            label="Metadata Header"
                            value={hasHeader.toString()}
                            onChange={(e) => setHasHeader(e.target.value === 'true')}
                            fullWidth
                          >
                            <MenuItem value="true">Header Present</MenuItem>
                            <MenuItem value="false">Raw Data Stream</MenuItem>
                          </TextField>
                          <TextField
                            select
                            label="Data Encoding"
                            value={encoding}
                            onChange={(e) => setEncoding(e.target.value)}
                            fullWidth
                          >
                            <MenuItem value="utf8">Universal (UTF-8)</MenuItem>
                            <MenuItem value="latin1">Legacy (Latin-1)</MenuItem>
                          </TextField>
                          <TextField
                            select
                            label="Field Segregation"
                            value={separator}
                            onChange={(e) => setSeparator(e.target.value)}
                            fullWidth
                          >
                            <MenuItem value=",">Comma (Default)</MenuItem>
                            <MenuItem value=";">Semicolon</MenuItem>
                          </TextField>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Preview */}
            {uploadStep === 'preview' && uploadResult && (
              <Card sx={{
                borderRadius: '2.5rem',
                bgcolor: alpha(theme.palette.common.white, 0.05),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
              }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" fontStyle="italic">Content Analysis</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip label={`${uploadResult.rowCount.toLocaleString()} NODES`} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                      <Chip label={`${uploadResult.columnCount} VECTORS`} color="secondary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </Box>
                  </Box>

                  <TableContainer component={Paper} sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: '1.5rem', maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {uploadResult.columns.map((column, i) => (
                            <TableCell key={i} sx={{ bgcolor: theme.palette.background.paper }}><Typography variant="caption" fontWeight="bold">{column}</Typography></TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {uploadResult.preview.slice(0, 5).map((row, i) => (
                          <TableRow key={i}>
                            {uploadResult.columns.map((col, j) => (
                              <TableCell key={j} sx={{ color: 'text.secondary', borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>{row[col]?.toString() || ''}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                    <Button onClick={() => setUploadStep('upload')} color="inherit" sx={{ fontWeight: 'bold' }}>Abort Protocol</Button>
                    <Button onClick={() => setUploadStep('validate')} variant="contained" sx={{ borderRadius: '1rem', fontWeight: 'bold' }}>Validate Sequence</Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Validate */}
            {uploadStep === 'validate' && (
              <Card>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">Integrity Protocol</Typography>
                    <IconButton onClick={() => setUploadStep('preview')}><X size={20} /></IconButton>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Mandatory Vector Map</Typography>
                    <TextField
                      fullWidth
                      variant="filled"
                      value={validationRules.requiredColumns.join(', ')}
                      onChange={(e) => setValidationRules(prev => ({ ...prev, requiredColumns: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                      placeholder="e.g. unique_id, timestamp, payload..."
                    />
                  </Box>

                  {validationResult && (
                    <Card sx={{
                      borderRadius: '1.5rem',
                      bgcolor: validationResult.isValid ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05),
                      border: `1px solid ${validationResult.isValid ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`
                    }}>
                      <CardContent sx={{ p: 3, display: 'flex', gap: 3, alignItems: 'center' }}>
                        <Box sx={{
                          p: 1.5, borderRadius: '50%',
                          bgcolor: validationResult.isValid ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                          color: validationResult.isValid ? theme.palette.success.main : theme.palette.error.main
                        }}>
                          {validationResult.isValid ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color={validationResult.isValid ? 'success.main' : 'error.main'}>
                            {validationResult.isValid ? 'SYSTEM INTEGRITY VERIFIED' : 'INTEGRITY BREACH IDENTIFIED'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {validationResult.isValid ? 'All vectors conform to system architecture' : 'Protocol violations detected in data stream'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                    <Button onClick={() => setUploadStep('preview')} color="inherit" sx={{ fontWeight: 'bold' }}>Reverse Node</Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button onClick={handleValidate} disabled={validating} variant="outlined" sx={{ borderRadius: '1rem', fontWeight: 'bold' }}>
                        {validating ? 'Verifying...' : 'Initiate Scan'}
                      </Button>
                      {validationResult?.isValid && (
                        <Button onClick={() => setUploadStep('import')} variant="contained" sx={{ borderRadius: '1rem', fontWeight: 'bold' }}>
                          Begin Transmission
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Import */}
            {uploadStep === 'import' && uploadResult && (
              <Card>
                <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <Box sx={{ p: 4, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'inline-flex' }}>
                    <Database size={64} className="animate-pulse" color={theme.palette.primary.light} />
                  </Box>
                  <Box sx={{ maxWidth: 400 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Final Synchronization</Typography>
                    <Typography color="text.secondary">
                      Ready to distribute <Box component="span" fontWeight="bold" color="primary.main">{uploadResult.rowCount.toLocaleString()} records</Box> from uplink node <Box component="span" fontStyle="italic" color="text.primary">"{uploadResult.filename}"</Box> into primary system storage.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={() => setUploadStep('validate')} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel Sequence</Button>
                    <Button
                      onClick={handleImport}
                      disabled={importing}
                      variant="contained"
                      size="large"
                      sx={{ borderRadius: '2rem', px: 6, py: 1.5, fontWeight: 'bold', fontSize: '1.2rem' }}
                    >
                      {importing ? 'Synchronizing...' : 'Authorize Uplink'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Card sx={{
              borderRadius: '2.5rem',
              bgcolor: alpha(theme.palette.common.white, 0.05),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" fontStyle="italic">Transmission Logs</Typography>
                  <HistoryIcon size={20} color={theme.palette.text.secondary} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {importHistory.map((item) => {
                    const statusColors = getStatusColor(item.status);
                    return (
                      <Box key={item.id} sx={{ p: 2, borderRadius: '1rem', bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: 120 }}>{item.name}</Typography>
                          <Chip label={item.status} size="small" sx={{ ...statusColors, border: `1px solid ${statusColors.borderColor}`, height: 20, fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase' }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary">{new Date(item.createdAt).toLocaleDateString()}</Typography>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary">{item.totalRows} NODES</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  {importHistory.length === 0 && !loadingHistory && (
                    <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                      <Database size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <Typography variant="caption" fontWeight="bold" textTransform="uppercase">Log Empty</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{
              borderRadius: '2.5rem',
              bgcolor: alpha(theme.palette.common.white, 0.05),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
            }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold" fontStyle="italic" gutterBottom>System Directives</Typography>
                <Button
                  onClick={resetImport}
                  fullWidth
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    gap: 2,
                    p: 2
                  }}
                >
                  <Box sx={{ p: 1, borderRadius: '0.75rem', bgcolor: theme.palette.background.default, display: 'flex' }}>
                    <Upload size={20} color={theme.palette.primary.light} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">Initialize Uplink</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Primary Data Ingest</Typography>
                  </Box>
                </Button>
                <Button
                  component="a"
                  href="https://github.com/lukaririnki26/DataBuddy/blob/main/docs/database-setup.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    gap: 2,
                    p: 2
                  }}
                >
                  <Box sx={{ p: 1, borderRadius: '0.75rem', bgcolor: theme.palette.background.default, display: 'flex' }}>
                    <Download size={20} color={theme.palette.secondary.light} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">Fetch Blueprint</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Schema Template</Typography>
                  </Box>
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DataImportPage;
