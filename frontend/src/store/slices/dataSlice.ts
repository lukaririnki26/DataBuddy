import { createSlice } from '@reduxjs/toolkit';

interface DataState {
  datasets: any[];
  currentDataset: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DataState = {
  datasets: [],
  currentDataset: null,
  isLoading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
});

export default dataSlice.reducer;
