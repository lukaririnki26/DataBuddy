import React from 'react';
import { User, Mail, Shield } from 'lucide-react';

// Add futuristic animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

const UsersPage: React.FC = () => {
  // Mock data - in real app this would come from API
  const users = [
    {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'editor',
      isActive: true,
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'viewer',
      isActive: false,
      createdAt: '2024-02-01',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233B82F6%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10 space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-slate-400 text-lg">
              Manage user accounts and permissions
            </p>
          </div>

          <button className="backdrop-blur-md bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 font-medium">
            <User className="w-5 h-5 mr-2" />
            Add New User
          </button>
        </div>

        {/* Users Table */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">All Users</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">{users.filter(u => u.isActive).length} Active</span>
                </div>
                <div className="text-sm text-slate-400">
                  Total: {users.length} users
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="px-8 py-6 hover:bg-white/5 transition-all duration-300 group"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center backdrop-blur-sm border-2 ${
                        user.isActive
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                          : 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 border-slate-500/30'
                      }`}>
                        <span className="text-lg font-bold text-white">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      {user.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors">
                          {user.firstName} {user.lastName}
                        </p>
                        {!user.isActive && (
                          <div className="backdrop-blur-sm bg-slate-500/20 border border-slate-500/30 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                            Inactive
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <Mail className="h-4 w-4 mr-2 text-blue-400" />
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className={`backdrop-blur-sm border px-4 py-2 rounded-xl text-sm font-medium ${
                      user.role === 'admin'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : user.role === 'editor'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}>
                      <Shield className={`h-4 w-4 mr-2 inline ${
                        user.role === 'admin' ? 'text-red-400' :
                        user.role === 'editor' ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      {user.role}
                    </div>

                    <div className="text-sm text-slate-400">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex space-x-2">
                      <button className="backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 hover:scale-105 font-medium">
                        Edit
                      </button>
                      <button className={`backdrop-blur-md border px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 font-medium ${
                        user.isActive
                          ? 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20 text-red-300 hover:from-red-500/20 hover:to-red-600/20'
                          : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-300 hover:from-green-500/20 hover:to-emerald-500/20'
                      }`}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
