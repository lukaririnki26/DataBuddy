/**
 * Redux Store Configuration
 *
 * Main Redux store configuration for DataBuddy application.
 * Combines all reducers and applies middleware.
 */

import { configureStore } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import pipelineReducer from './slices/pipelineSlice';
import dataReducer from './slices/dataSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/usersSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pipeline: pipelineReducer,
    data: dataReducer,
    ui: uiReducer,
    users: usersReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;