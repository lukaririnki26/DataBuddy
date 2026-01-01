/**
 * Landing Page Component
 *
 * Halaman landing utama DataBuddy dengan informasi produk dan call-to-action.
 * Menampilkan fitur-fitur utama dan navigasi ke halaman login.
 */

import React from 'react';

const LandingPage: React.FC = () => {
  console.log('LandingPage component is rendering at:', new Date().toISOString());
  React.useEffect(() => {
    console.log('LandingPage mounted successfully!');
    // Temporary alert to confirm JavaScript is working
    setTimeout(() => alert('Landing page loaded!'), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-2xl font-bold text-white">DataBuddy</h1>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Transform Data
              </span>
              <br />
              <span className="text-white">Into Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              DataBuddy is your AI-powered data management platform that automates workflows,
              ensures data quality, and delivers actionable insights through intelligent pipelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
              >
                Start Building Pipelines
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Pipelines</h3>
              <p className="text-gray-300 leading-relaxed">
                Build intelligent data processing workflows with drag-and-drop simplicity.
                Automate ETL processes, data validation, and transformation with AI assistance.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Analytics</h3>
              <p className="text-gray-300 leading-relaxed">
                Monitor pipeline performance, data quality metrics, and system health
                with beautiful dashboards and instant notifications.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Enterprise Security</h3>
              <p className="text-gray-300 leading-relaxed">
                Bank-grade security with role-based access control, audit logs,
                and encrypted data processing for compliance and peace of mind.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12 max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Revolutionize Your Data Workflow?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of data professionals who trust DataBuddy for their mission-critical operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => window.open('https://github.com', '_blank')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 DataBuddy. Built for the future of data management.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
