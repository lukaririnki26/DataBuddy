
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'editor' | 'viewer';
    status: 'active' | 'suspended';
    lastLogin?: string;
    createdAt: string;
}

interface UsersState {
    list: User[];
    loading: boolean;
    error: string | null;
    actionLoading: boolean; // For create/update/delete actions
    actionError: string | null;
}

const initialState: UsersState = {
    list: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const data = await api.get('/users');
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData: any, { rejectWithValue }) => {
        try {
            const data = await api.post('/users', userData);
            return data;
        } catch (error: any) {
            let errorMessage = 'Failed to create user';
            if (error.response?.data?.message) {
                errorMessage = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
            }
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const responseData = await api.patch(`/users/${id}`, data);
            return responseData;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearActionError: (state) => {
            state.actionError = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Users
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.list = action.payload;
        });
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create User
        builder.addCase(createUser.pending, (state) => {
            state.actionLoading = true;
            state.actionError = null;
        });
        builder.addCase(createUser.fulfilled, (state, action) => {
            state.actionLoading = false;
            state.list.push(action.payload);
        });
        builder.addCase(createUser.rejected, (state, action) => {
            state.actionLoading = false;
            state.actionError = action.payload as string;
        });

        // Update User
        builder.addCase(updateUser.pending, (state) => {
            state.actionLoading = true;
            state.actionError = null;
        });
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.actionLoading = false;
            const index = state.list.findIndex((u) => u.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
        });
        builder.addCase(updateUser.rejected, (state, action) => {
            state.actionLoading = false;
            state.actionError = action.payload as string;
        });

        // Delete User
        builder.addCase(deleteUser.pending, (state) => {
            state.actionLoading = true;
            state.actionError = null;
        });
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.actionLoading = false;
            state.list = state.list.filter((u) => u.id !== action.payload);
        });
        builder.addCase(deleteUser.rejected, (state, action) => {
            state.actionLoading = false;
            state.actionError = action.payload as string;
        });
    },
});

export const { clearActionError } = usersSlice.actions;
export default usersSlice.reducer;
