import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import {
  Shield,
  Lock,
  Mail,
  Zap,
  Activity,
  Cpu,
  Globe
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  useTheme,
  Card,
  CardContent,
  MenuItem,
  InputAdornment,
  alpha
} from '@mui/material';

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
  const theme = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      success('Access Granted', 'Initializing secure session...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, success]);

  useEffect(() => {
    // Check for session expiry message from URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      toastError('Session Expired', 'Your secure session has timed out or is no longer valid. Please re-authenticate.');
      // Clear the param from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toastError]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      position: 'relative',
      overflow: 'hidden',
      background: theme.palette.background.default, // Use theme background
    }}>
      {/* Background Effects (kept for specific visual flare, could be moved to separate component) */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '50%', filter: 'blur(120px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: '50%', filter: 'blur(120px)' }} />
      </Box>

      <Grid container spacing={12} alignItems="center" sx={{ position: 'relative', zIndex: 10, maxWidth: 'lg' }}>
        {/* Left Side: Branding */}
        <Grid item xs={12} lg={6} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 2,
              py: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: '9999px',
              color: theme.palette.primary.light,
              typography: 'caption',
              fontWeight: 900,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              mb: 3
            }}>
              <Zap size={12} style={{ marginRight: 8 }} />
              Advanced Data Synthesis
            </Box>
            <Typography variant="h1" gutterBottom sx={{ lineHeight: 1.1 }}>
              Control the <Box component="span" sx={{
                background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Digital Pulse</Box>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8, maxWidth: 'sm' }}>
              DataBuddy: The next-generation infrastructure for autonomous data management and neural pipeline orchestration.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              { label: 'Uptime', value: '99.99%', icon: <Activity size={16} /> },
              { label: 'Latency', value: '0.4ms', icon: <Cpu size={16} /> },
              { label: 'Global Nodes', value: '1,240', icon: <Globe size={16} /> },
              { label: 'Encryption', value: 'AES-512', icon: <Shield size={16} /> }
            ].map((stat) => (
              <Grid item xs={6} key={stat.label}>
                <Card sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.4),
                  borderColor: theme.palette.divider,
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent>
                    <Box sx={{ color: theme.palette.primary.light, mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>{stat.value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Side: Auth Form */}
        <Grid item xs={12} lg={6}>
          <Box sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(32px)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '3rem',
            p: { xs: 4, md: 8 },
            boxShadow: theme.palette.mode === 'dark'
              ? '0 40px 100px -20px rgba(0,0,0,0.7)'
              : '0 20px 60px -10px rgba(0,0,0,0.05)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '3rem',
              padding: '1px',
              background: `linear-gradient(135deg, ${alpha(theme.palette.text.primary, 0.2)}, transparent, ${alpha(theme.palette.primary.main, 0.2)})`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none'
            }
          }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                {isLogin ? 'Neural Gateway' : 'Node Creation'}
              </Typography>
              <Typography color="text.secondary" fontWeight={500} sx={{ opacity: 0.7 }}>
                {isLogin ? 'Synchronize your unique signature' : 'Initialize a new intelligence unit'}
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {!isLogin && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>First Name</Typography>
                      <TextField
                        fullWidth
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>Last Name</Typography>
                      <TextField
                        fullWidth
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>Network Identity</Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    placeholder="name@matrix.net"
                    value={formData.email}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={18} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>Access Cipher</Typography>
                  <TextField
                    fullWidth
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} color={theme.palette.primary.light} style={{ opacity: 0.9, marginRight: 8 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.15)}`,
                        borderRadius: '1.25rem',
                        px: 2.5,
                        py: 1.25,
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                        transition: 'all 0.2s ease-in-out',
                        '& input::placeholder': {
                          color: alpha(theme.palette.text.primary, 0.5),
                          opacity: 1,
                        },
                        '&:hover': {
                          bgcolor: alpha(theme.palette.text.primary, 0.08),
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                        },
                        '&.Mui-focused': {
                          bgcolor: alpha(theme.palette.text.primary, 0.1),
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                        },
                      }
                    }}
                  />
                </Grid>

                {!isLogin && (
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>Operational Role</Typography>
                    <TextField
                      select
                      fullWidth
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          bgcolor: alpha(theme.palette.text.primary, 0.05),
                          backdropFilter: 'blur(12px)',
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.15)}`,
                          borderRadius: '1.25rem',
                          px: 2.5,
                          py: 1.25,
                          fontSize: '1rem',
                          color: theme.palette.text.primary,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.text.primary, 0.08),
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                          },
                          '&.Mui-focused': {
                            bgcolor: alpha(theme.palette.text.primary, 0.1),
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                          },
                          '& .MuiSelect-select': {
                            py: 0,
                            color: theme.palette.text.primary,
                          }
                        }
                      }}
                    >
                      <MenuItem value="viewer">Viewer</MenuItem>
                      <MenuItem value="editor">Editor</MenuItem>
                      <MenuItem value="admin">Administrator</MenuItem>
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    {isLoading ? 'Processing...' : (isLogin ? 'Initialize Uplink' : 'Activate Node')}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => setIsLogin(!isLogin)}
                sx={{
                  color: 'text.secondary',
                  typography: 'caption',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  '&:hover': { color: theme.palette.text.primary, letterSpacing: '0.2em' }
                }}
              >
                {isLogin ? 'Register New Access Node' : 'Return to Verification Protocol'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;
