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
  FileText,
  Database,
  Zap,
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
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white shadow-lg transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo/Brand */}
      <div className={`flex items-center justify-center h-16 px-4 bg-indigo-600 border-b border-indigo-700 ${
        collapsed ? 'px-2' : ''
      }`}>
        <div className="flex items-center">
          <Database className={`text-white ${collapsed ? 'h-8 w-8' : 'h-8 w-8 mr-3'}`} />
          {!collapsed && (
            <h1 className="text-xl font-bold text-white">DataBuddy</h1>
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
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`flex-shrink-0 ${
                collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
              } ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer dengan system info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">System Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
