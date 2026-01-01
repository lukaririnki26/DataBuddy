import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-16 px-8 ${className}`}>
      {/* Icon with glow effect */}
      {Icon && (
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6 inline-block">
            <Icon className="h-16 w-16 text-cyan-400" />
          </div>
        </div>
      )}

      {/* Title with gradient */}
      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed mb-8">
        {description}
      </p>

      {/* Action button */}
      {action && (
        <div className="flex justify-center">
          <button
            onClick={action.onClick}
            className={`group inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              action.variant === 'secondary'
                ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:shadow-cyan-500/25'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-cyan-500/25'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500`}
          >
            <span className="mr-3 group-hover:translate-x-1 transition-transform duration-300">
              {action.variant === 'secondary' ? '→' : '✨'}
            </span>
            {action.label}
          </button>
        </div>
      )}

      {/* Decorative elements */}
      <div className="mt-12 flex justify-center space-x-4">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default EmptyState;
