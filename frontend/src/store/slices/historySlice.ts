import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface PipelineExecution {
    id: string;
    pipelineId: string;
    userId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    durationMs?: number;
    inputSnapshot?: any;
    outputSnapshot?: any;
    logs?: any[];
    error?: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface HistoryState {
    executions: PipelineExecution[];
    currentExecution: PipelineExecution | null;
    loading: boolean;
    error: string | null;
}

const initialState: HistoryState = {
    executions: [],
    currentExecution: null,
    loading: false,
    error: null,
};

export const fetchPipelineHistory = createAsyncThunk(
    'history/fetchPipelineHistory',
    async (pipelineId: string, { rejectWithValue }) => {
        try {
            const data = await api.get(`/pipelines/${pipelineId}/history`);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
        }
    }
);

export const fetchExecutionDetails = createAsyncThunk(
    'history/fetchExecutionDetails',
    async (executionId: string, { rejectWithValue }) => {
        try {
            const data = await api.get(`/pipeline-executions/${executionId}`);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch details');
        }
    }
);

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        clearCurrentExecution: (state) => {
            state.currentExecution = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch History
        builder.addCase(fetchPipelineHistory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPipelineHistory.fulfilled, (state, action) => {
            state.loading = false;
            state.executions = action.payload;
        });
        builder.addCase(fetchPipelineHistory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Details
        builder.addCase(fetchExecutionDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchExecutionDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.currentExecution = action.payload;
        });
        builder.addCase(fetchExecutionDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearCurrentExecution } = historySlice.actions;
export default historySlice.reducer;
