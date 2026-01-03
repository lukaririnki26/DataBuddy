
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Clock,
  History,
  X,
  Check
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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchUsers, createUser, updateUser, deleteUser, User } from '../store/slices/usersSlice';

const UsersPage: React.FC = () => {
  const { success, error } = useToast();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { list: users, loading } = useSelector((state: RootState) => state.users);

  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer',
    status: 'active' as 'active' | 'suspended'
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'viewer',
      status: 'active'
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setOpenModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'create') {
        if (!formData.password || formData.password.length < 8) {
          error('Validation Error', 'Password must be at least 8 characters');
          return;
        }
        await dispatch(createUser(formData)).unwrap();
        success('User Created', 'New user has been successfully added');
      } else {
        // Update user
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          status: formData.status
        };

        await dispatch(updateUser({ id: selectedUser!.id, data: updateData })).unwrap();
        success('User Updated', 'User details have been updated');
      }
      setOpenModal(false);
    } catch (err: any) {
      error('Operation Failed', typeof err === 'string' ? err : 'Failed to save user');
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUser(userToDelete.id)).unwrap();
      success('User Deleted', 'User has been removed from the system');
      setOpenDeleteDialog(false);
    } catch (err: any) {
      error('Delete Failed', typeof err === 'string' ? err : 'Could not delete user');
    }
  };

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
            onClick={handleOpenCreate}
            variant="contained"
            startIcon={<UserPlus size={20} />}
          >
            Provision User
          </Button>
        </Box>

        <Box sx={{ mb: 4, maxWidth: 600 }}>
          <TextField
            placeholder="Search personnel by identity or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {loading && users.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 4, py: 3 }}><Typography variant="caption" fontWeight="900" color="text.secondary">Identity</Typography></TableCell>
                  <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary">Authorization</Typography></TableCell>
                  <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary">Status</Typography></TableCell>
                  <TableCell><Typography variant="caption" fontWeight="900" color="text.secondary">Created</Typography></TableCell>
                  <TableCell align="right" sx={{ pr: 4 }}><Typography variant="caption" fontWeight="900" color="text.secondary">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
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
                        <Clock size={14} />
                        <Typography variant="caption">{new Date(user.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleOpenEdit(user)}><Edit2 size={16} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(user)}><Trash2 size={16} /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No personnel records found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {modalMode === 'create' ? 'Provision New Personnel' : 'Edit Personnel Record'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                fullWidth
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Box>
            <TextField
              label="Email Identity"
              fullWidth
              value={formData.email}
              disabled={modalMode === 'edit'} // Email usually distinct
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            {/* Only show Password field if creating */}
            {modalMode === 'create' && (
              <TextField
                label="Initial Cipher (Password)"
                type="password"
                fullWidth
                helperText="Must be at least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Authorization Role</InputLabel>
              <Select
                value={formData.role}
                label="Authorization Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {modalMode === 'create' ? 'Provision' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 900, color: theme.palette.error.main }}>
          Revoke Authorization?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete authorization for <strong>{userToDelete?.email}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Revoke Permanently
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default UsersPage;
