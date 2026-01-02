import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  Mail,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'suspended';
  lastLogin: string;
}

const UsersPage: React.FC = () => {
  const { success, error: toastError, info } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@databuddy.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      lastLogin: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'editor@databuddy.com',
      firstName: 'Editor',
      lastName: 'User',
      role: 'editor',
      status: 'active',
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      email: 'viewer@databuddy.com',
      firstName: 'Viewer',
      lastName: 'User',
      role: 'viewer',
      status: 'suspended',
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const getRoleBadge = (role: string) => {
    const configs = {
      admin: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
      editor: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
      viewer: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
    };
    const config = configs[role as keyof typeof configs] || configs.viewer;
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
      <div className="relative z-10 p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Personnel Control
            </h1>
            <p className="text-slate-400 text-lg font-medium">Manage access protocols and user authorizations</p>
          </div>

          <button
            onClick={() => info('Registration', 'Personnel creation is currently handled via Genesis Protocol')}
            className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all"
          >
            <UserPlus className="w-5 h-5 mr-3" />
            Provision User
          </button>
        </div>

        <div className="relative group max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search personnel by identity or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
          />
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Authorization</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Last Active</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-white/5 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-blue-400 font-bold shadow-xl">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="text-white font-bold group-hover:text-blue-200 transition-colors">{user.firstName} {user.lastName}</div>
                        <div className="text-slate-500 text-xs font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{getRoleBadge(user.role)}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center ${user.status === 'active' ? 'text-emerald-400' : 'text-red-400'} text-xs font-bold`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center text-slate-400 text-xs font-medium">
                      <History className="w-3.5 h-3.5 mr-2" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-3 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-3 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simple History icon replacement since I forgot to import it
const History = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default UsersPage;
