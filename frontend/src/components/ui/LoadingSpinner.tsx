import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Futuristic spinner */}
      <div className="relative">
        <div className={`animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-400 ${sizeClasses[size]}`}></div>
        <div className={`absolute inset-0 animate-spin rounded-full border-2 border-transparent border-b-pink-400 border-l-cyan-400 ${sizeClasses[size]}`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 animate-pulse"></div>
      </div>

      {/* Loading text with typing effect */}
      <div className="text-center">
        {message ? (
          <p className="text-white text-lg font-medium">{message}</p>
        ) : (
          <div className="flex items-center space-x-1">
            <span className="text-cyan-400 font-mono text-sm">LOADING</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-4 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
