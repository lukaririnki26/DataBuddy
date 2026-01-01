import { createSlice } from '@reduxjs/toolkit';

interface PipelineState {
  pipelines: any[];
  currentPipeline: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PipelineState = {
  pipelines: [],
  currentPipeline: null,
  isLoading: false,
  error: null,
};

const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState,
  reducers: {},
});

export default pipelineSlice.reducer;
