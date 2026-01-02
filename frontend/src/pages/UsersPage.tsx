import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Clock,
  History,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  useTheme,
  alpha
} from '@mui/material';

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
  const { info } = useToast();
  const theme = useTheme();
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
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    switch (role) {
      case 'admin': color = 'secondary'; break;
      case 'editor': color = 'primary'; break;
      default: color = 'default';
    }

    return (
      <Chip
        label={role}
        size="small"
        color={color}
        variant="outlined"
        sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.625rem', height: 24 }}
      />
    );
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
    }}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 3, mb: 4 }}>
          <Box>
            <Typography variant="h3" fontWeight="900" sx={{
              background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              mb: 1
            }}>
              Personnel Control
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="medium" sx={{ opacity: 0.7 }}>
              Manage access protocols and user authorizations
            </Typography>
          </Box>

          <Button
            onClick={() => info('Registration', 'Personnel creation is currently handled via Genesis Protocol')}
            variant="contained"
            startIcon={<UserPlus size={20} />}
            sx={{
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '1rem',
              fontWeight: 'bold',
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
            }}
          >
            Provision User
          </Button>
        </Box>

        <Box sx={{ mb: 4, maxWidth: 600 }}>
          <TextField
            placeholder="Search personnel by identity or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="filled"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              disableUnderline: true,
              sx: { borderRadius: '1.5rem' }
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{
          borderRadius: '2.5rem',
          bgcolor: alpha(theme.palette.common.white, 0.03),
          backdropFilter: 'blur(32px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, bgcolor: alpha(theme.palette.common.white, 0.02) } }}>
                <TableCell sx={{ pl: 4, py: 3 }}><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Identity</Typography></TableCell>
                <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Authorization</Typography></TableCell>
                <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Status</Typography></TableCell>
                <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Last Active</Typography></TableCell>
                <TableCell align="right" sx={{ pr: 4 }}><Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover sx={{ '& td': { borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }, '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.05) } }}>
                  <TableCell sx={{ pl: 4, py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.dark, color: theme.palette.primary.light, fontWeight: 'bold' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white' }}>{user.firstName} {user.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: user.status === 'active' ? theme.palette.success.main : theme.palette.error.main, ml: 1 }} />}
                      label={user.status}
                      size="small"
                      sx={{
                        bgcolor: user.status === 'active' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                        color: user.status === 'active' ? theme.palette.success.light : theme.palette.error.main,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: '0.625rem',
                        height: 24,
                        pl: 0.5
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <History size={14} />
                      <Typography variant="caption">{new Date(user.lastLogin).toLocaleDateString()}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'white', bgcolor: alpha(theme.palette.common.white, 0.1) } }}><Edit2 size={16} /></IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) } }}><Trash2 size={16} /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default UsersPage;
