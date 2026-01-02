import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateUser, changePassword } from '../store/slices/authSlice';
import { useToast } from '../context/ToastContext';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Save as SaveIcon,
    Badge as BadgeIcon,
    Mail as MailIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    useTheme,
    alpha,
} from '@mui/material';

const ProfilePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { success, error } = useToast();
    const theme = useTheme();

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(updateUser({ firstName, lastName })).unwrap();
            success('Profile Updated', 'Profile updated successfully');
        } catch (err: any) {
            error('Update Failed', err.message || 'Failed to update profile');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error('Validation Error', 'New passwords do not match');
            return;
        }

        try {
            await dispatch(changePassword(passwordData)).unwrap();
            success('Password Changed', 'Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            error('Change Failed', err.message || 'Failed to change password');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {/* Header */}
                <Box>
                    <Typography variant="h3" fontWeight="900" sx={{
                        background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.primary.light})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        mb: 1
                    }}>
                        Neural Identity
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight="medium" sx={{ opacity: 0.7 }}>
                        Manage your personal signature and security protocols
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* User Info Card */}
                    <Grid item xs={12} lg={4}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: '3rem',
                            bgcolor: alpha(theme.palette.common.white, 0.03),
                            backdropFilter: 'blur(32px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ position: 'absolute', top: 0, right: 0, p: 4, opacity: 0.05 }}>
                                <ShieldIcon sx={{ fontSize: 160 }} />
                            </Box>

                            <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative', zIndex: 10 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Box sx={{ position: 'absolute', inset: -10, bgcolor: theme.palette.primary.main, filter: 'blur(40px)', opacity: 0.2, borderRadius: '50%' }} />
                                    <Avatar
                                        sx={{
                                            width: 140,
                                            height: 140,
                                            fontSize: '3.5rem',
                                            fontWeight: 900,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            border: `4px solid ${alpha(theme.palette.common.white, 0.1)}`
                                        }}
                                    >
                                        {user?.firstName?.charAt(0)}
                                    </Avatar>
                                </Box>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="900" sx={{ color: 'white', mb: 1, letterSpacing: '-0.02em' }}>
                                        {user?.firstName} {user?.lastName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary', mb: 3 }}>
                                        <MailIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2" fontWeight="500">{user?.email}</Typography>
                                    </Box>
                                    <Chip
                                        label={`${user?.role} ACCESS`}
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.light,
                                            fontWeight: 900,
                                            letterSpacing: '0.1em',
                                            borderRadius: '999px',
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            px: 2
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Settings Forms */}
                    <Grid item xs={12} lg={8}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Profile Details */}
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.03),
                                backdropFilter: 'blur(32px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}>
                                <CardContent sx={{ p: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                                        <Box sx={{ p: 2, borderRadius: '1.5rem', bgcolor: alpha(theme.palette.secondary.main, 0.1), border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`, color: theme.palette.secondary.light }}>
                                            <BadgeIcon />
                                        </Box>
                                        <Typography variant="h5" fontWeight="900" fontStyle="italic">Registry Details</Typography>
                                    </Box>

                                    <form onSubmit={handleUpdateProfile}>
                                        <Grid container spacing={4}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField label="First Name" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} variant="filled" />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField label="Last Name" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} variant="filled" />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField label="Email Signature" fullWidth value={user?.email} disabled variant="filled" helperText="Identity identifier remains immutable" />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ borderRadius: '1.25rem', px: 4, py: 1.5, fontWeight: 900, letterSpacing: '0.1em' }}>
                                                Authorize Update
                                            </Button>
                                        </Box>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Security */}
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.03),
                                backdropFilter: 'blur(32px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}>
                                <CardContent sx={{ p: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                                        <Box sx={{ p: 2, borderRadius: '1.5rem', bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, color: theme.palette.error.light }}>
                                            <LockIcon />
                                        </Box>
                                        <Typography variant="h5" fontWeight="900" fontStyle="italic">Security Shield</Typography>
                                    </Box>

                                    <form onSubmit={handlePasswordChange}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <TextField type="password" label="Current Cipher" fullWidth value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} variant="filled" />
                                            <Grid container spacing={4}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField type="password" label="New Cipher" fullWidth value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} variant="filled" />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField type="password" label="Verify New Cipher" fullWidth value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} variant="filled" />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                            <Button type="submit" variant="contained" color="error" startIcon={<LockIcon />} sx={{ borderRadius: '1.25rem', px: 4, py: 1.5, fontWeight: 900, letterSpacing: '0.1em' }}>
                                                Rotate Cipher
                                            </Button>
                                        </Box>
                                    </form>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ProfilePage;
