import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
} from '@mui/material';
import { Visibility, Refresh } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchPipelineHistory, PipelineExecution } from '../store/slices/historySlice';
import ExecutionDetailsModal from '../components/ExecutionDetailsModal';

interface PipelineHistoryProps {
    pipelineId: string;
}

const PipelineHistory: React.FC<PipelineHistoryProps> = ({ pipelineId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { executions, loading } = useSelector((state: RootState) => state.history);
    const [selectedExecution, setSelectedExecution] = useState<PipelineExecution | null>(null);

    useEffect(() => {
        if (pipelineId) {
            dispatch(fetchPipelineHistory(pipelineId));
        }
    }, [dispatch, pipelineId]);

    const handleViewDetails = (execution: PipelineExecution) => {
        setSelectedExecution(execution);
    };

    const handleCloseModal = () => {
        setSelectedExecution(null);
    };

    return (
        <Box mt={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Execution History</Typography>
                <Button
                    startIcon={<Refresh />}
                    onClick={() => dispatch(fetchPipelineHistory(pipelineId))}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Triggered By</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {executions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="textSecondary" py={2}>
                                        No execution history found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            executions.map((exec) => (
                                <TableRow key={exec.id}>
                                    <TableCell>
                                        <Chip
                                            label={exec.status}
                                            size="small"
                                            color={
                                                exec.status === 'completed'
                                                    ? 'success'
                                                    : exec.status === 'failed'
                                                        ? 'error'
                                                        : 'primary'
                                            }
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(exec.startTime).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {exec.durationMs ? `${exec.durationMs}ms` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {exec.user ? `${exec.user.firstName} ${exec.user.lastName}` : 'System'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewDetails(exec)}
                                            color="primary"
                                        >
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ExecutionDetailsModal
                open={!!selectedExecution}
                onClose={handleCloseModal}
                execution={selectedExecution}
            />
        </Box>
    );
};

export default PipelineHistory;
