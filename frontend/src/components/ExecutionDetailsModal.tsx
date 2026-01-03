import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Chip,
    Divider,
} from '@mui/material';
import { PipelineExecution } from '../store/slices/historySlice';

interface ExecutionDetailsModalProps {
    open: boolean;
    onClose: () => void;
    execution: PipelineExecution | null;
}

const ExecutionDetailsModal: React.FC<ExecutionDetailsModalProps> = ({
    open,
    onClose,
    execution,
}) => {
    if (!execution) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Execution Details</Typography>
                    <Chip
                        label={execution.status.toUpperCase()}
                        color={
                            execution.status === 'completed'
                                ? 'success'
                                : execution.status === 'failed'
                                    ? 'error'
                                    : 'primary'
                        }
                        size="small"
                    />
                </Box>
                <Typography variant="caption" color="textSecondary">
                    ID: {execution.id} | Duration: {execution.durationMs}ms
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                            Input Data (Before)
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: '#f5f5f5',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: '400px',
                                border: '1px solid #e0e0e0',
                            }}
                        >
                            <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                {JSON.stringify(execution.inputSnapshot, null, 2)}
                            </pre>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                            Output Data (After)
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: '#f0f7ff',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: '400px',
                                border: '1px solid #bbdefb',
                            }}
                        >
                            <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                {JSON.stringify(execution.outputSnapshot, null, 2)}
                            </pre>
                        </Box>
                    </Grid>
                </Grid>

                {execution.error && (
                    <Box mt={3}>
                        <Typography variant="subtitle2" color="error" gutterBottom>
                            Error
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: '#ffebee',
                                p: 2,
                                borderRadius: 1,
                                border: '1px solid #ffcdd2',
                            }}
                        >
                            <Typography variant="body2" color="error">
                                {execution.error}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {execution.logs && execution.logs.length > 0 && (
                    <Box mt={3}>
                        <Typography variant="subtitle2" gutterBottom>
                            Execution Logs
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: '#263238',
                                color: '#fff',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: '200px',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                            }}
                        >
                            {execution.logs.map((log: any, index: number) => (
                                <div key={index}>
                                    <span style={{ color: '#90a4ae' }}>
                                        [{log.level?.toUpperCase() || 'INFO'}]
                                    </span>{' '}
                                    {log.message}
                                </div>
                            ))}
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExecutionDetailsModal;
