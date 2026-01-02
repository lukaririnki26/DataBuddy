/**
 * Sidebar Component
 *
 * Navigation sidebar dengan menu items dan branding.
 * Responsive design yang bisa di-collapse pada mobile.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  BarChart3,
  Upload,
  Download,
  Settings,
  Users,
  Activity,
  Zap,
  Database,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse }) => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Data Import', href: '/data/import', icon: Upload },
    { name: 'Data Export', href: '/data/export', icon: Download },
    { name: 'Pipelines', href: '/pipelines', icon: Settings },
    { name: 'Pipeline Builder', href: '/pipelines/builder', icon: Zap },
    { name: 'Monitoring', href: '/monitoring', icon: Activity },
    { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0f172a] border-r border-white/10 shadow-2xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'
      }`}>
      {/* Logo/Brand */}
      <div className={`flex items-center justify-center h-20 px-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/10 ${collapsed ? 'px-2' : ''
        }`}>
        <div className="flex items-center">
          <div className="relative">
            <Database className={`text-indigo-400 ${collapsed ? 'h-8 w-8' : 'h-8 w-8 mr-3'}`} />
            <div className="absolute inset-0 bg-indigo-400/20 blur-lg rounded-full animate-pulse"></div>
          </div>
          {!collapsed && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DataBuddy
            </h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;

          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-white/20 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                } ${collapsed ? 'justify-center px-2' : 'mx-2'}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
                } ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer dengan system info */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="text-xs">
            <p className="font-medium text-slate-300 mb-2 uppercase tracking-wider">System Status</p>
            <div className="flex items-center space-x-2 backdrop-blur-md bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">All systems active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
