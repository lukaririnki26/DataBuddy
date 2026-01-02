import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  Activity,
  Cpu,
  Globe,
  Zap
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'viewer' as const,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      success('Access Granted', 'Initializing secure session...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, success]);

  useEffect(() => {
    if (error) {
      toastError('Authentication Breach', error);
    }
  }, [error, toastError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      dispatch(registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden transition-all duration-1000">
      {/* Neural Network Background Efffect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl grid grid-cols-1 lg:max-w-none lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding & Stats */}
        <div className="hidden lg:flex flex-col space-y-12 max-w-md">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">
              <Zap className="w-3 h-3 mr-2" />
              Advanced Data Synthesis
            </div>
            <h1 className="text-6xl font-black text-white leading-tight">
              Control the <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Digital Pulse</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              DataBuddy: The next-generation infrastructure for autonomous data management and neural pipeline orchestration.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Uptime', value: '99.99%', icon: <Activity className="w-4 h-4" /> },
              { label: 'Latency', value: '0.4ms', icon: <Cpu className="w-4 h-4" /> },
              { label: 'Global Nodes', value: '1,240', icon: <Globe className="w-4 h-4" /> },
              { label: 'Encryption', value: 'AES-512', icon: <Shield className="w-4 h-4" /> }
            ].map(stat => (
              <div key={stat.label} className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full max-w-md mx-auto">
          {/* Logo Mobble */}
          <div className="lg:hidden text-center mb-12 animate-fadeInUp">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25">
              <Cpu className="text-white w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter">DATABUDDY</h2>
          </div>

          <div className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fadeInUp">
            {/* Header */}
            <div className="space-y-2 mb-10">
              <h2 className="text-3xl font-black text-white">{isLogin ? 'Access Identity' : 'Provision Protocol'}</h2>
              <p className="text-slate-500 font-medium">{isLogin ? 'Provide your verification tokens to proceed' : 'Create a new node in our global network'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                    <div className="relative">
                      <input
                        name="firstName"
                        type="text"
                        required={!isLogin}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                    <input
                      name="lastName"
                      type="text"
                      required={!isLogin}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Network Identity</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="name@matrix.net"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Access Cipher</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Operational Role</label>
                  <select
                    name="role"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="viewer" className="bg-slate-900">Viewer</option>
                    <option value="editor" className="bg-slate-900">Editor</option>
                    <option value="admin" className="bg-slate-900">Administrator</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white font-black text-lg shadow-2xl hover:shadow-blue-500/40 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
              >
                <div className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Initialize Uplink' : 'Activate Node'}
                      <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </form>

            <div className="mt-10 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all hover:tracking-[0.2em]"
              >
                {isLogin ? 'Register New Access Node' : 'Return to Verification Protocol'}
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
              Protocol: HTTPS • Status: SECURE • Version: 1.1.2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
