/**
 * DataBuddy App Component
 *
 * Main application component that handles routing and layout.
 * Includes protected routes and navigation structure.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PipelinesPage from './pages/PipelinesPage';
import PipelineBuilderPage from './pages/PipelineBuilderPage';
import DataImportPage from './pages/DataImportPage';
import UsersPage from './pages/UsersPage';

// Layout wrapper component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: '240px', // Account for sidebar width
          marginTop: '64px', // Account for navbar height
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => ({
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
  }));

  console.log('App component - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

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

  console.log('Rendering routes - isAuthenticated:', isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={<LandingPage />}
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/pipelines"
        element={
          <PrivateRoute>
            <AppLayout>
              <PipelinesPage />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/pipelines/builder/:id?"
        element={
          <PrivateRoute>
            <AppLayout>
              <PipelineBuilderPage />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/data/import"
        element={
          <PrivateRoute>
            <AppLayout>
              <DataImportPage />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <AppLayout>
              <UsersPage />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={
          <PrivateRoute>
            <AppLayout>
              <div className="min-h-[80vh] flex items-center justify-center relative">
                {/* Animated background elements */}
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
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                      Page Not Found
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                      The page you're looking for seems to have wandered off into the digital void.
                      Don't worry, it happens to the best of us!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                    <button
                      onClick={() => window.history.back()}
                      className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25"
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Go Back
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Go to Dashboard
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      If you believe this is an error or you're lost, our support team is here to help.
                    </p>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300">
                      Contact Support →
                    </button>
                  </div>
                </div>
              </div>
            </AppLayout>
          </PrivateRoute>
        }
      />
    </Routes>
    </BrowserRouter>
  );
};

export default App;