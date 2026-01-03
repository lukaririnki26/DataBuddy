/**
 * DataBuddy App Component
 *
 * Main application component that handles routing and layout.
 * Includes protected routes and navigation structure.
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { getCurrentUser, setLoading } from './store/slices/authSlice';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PipelinesPage from './pages/PipelinesPage';
import PipelineBuilderPage from './pages/PipelineBuilderPage';
import DataImportPage from './pages/DataImportPage';
import DataExportPage from './pages/DataExportPage';
import MonitoringPage from './pages/MonitoringPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => ({
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
  }));

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(getCurrentUser())
        .unwrap()
        .catch(() => {
          // Silent catch to ensure loading stops
        });
    } else {
      // Ensure loading is off if no token
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
              }
            />

            {/* Protected routes wrapped in persistent Layout */}
            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pipelines" element={<PipelinesPage />} />
              <Route path="/pipelines/builder/:id?" element={<PipelineBuilderPage />} />
              <Route path="/data/import" element={<DataImportPage />} />
              <Route path="/data/export" element={<DataExportPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin/users" element={<UsersPage />} />

              {/* Catch all route inside Layout */}
              <Route
                path="*"
                element={
                  <div className="min-h-[80vh] flex items-center justify-center relative">
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="text-center relative z-10">
                      <div className="mb-12">
                        <div className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent select-none mb-4">
                          404
                        </div>
                        <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mx-auto"></div>
                      </div>

                      <div className="mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--mui-palette-text-primary, #fff)' }}>
                          Page Not Found
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--mui-palette-text-secondary, #94a3b8)' }}>
                          The page you're looking for seems to have wandered off into the digital void.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                        <button
                          onClick={() => window.history.back()}
                          className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-2xl"
                        >
                          Go Back
                        </button>
                        <button
                          onClick={() => window.location.href = '/dashboard'}
                          className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                        >
                          Go to Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </SocketProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;