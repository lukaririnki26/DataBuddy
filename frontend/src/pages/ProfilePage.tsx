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
    Divider,
    useTheme,
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
        <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
            <div className="relative z-10 p-8 space-y-8 w-full">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <p className="text-slate-400 text-lg font-medium">
                        Manage your personal information and security settings
                    </p>
                </div>

                <Grid container spacing={4}>
                    {/* User Info Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                            <div className="absolute top-0 right-0 p-8 opacity-20 transition-opacity">
                                <ShieldIcon sx={{ fontSize: 120, color: 'white' }} />
                            </div>

                            <CardContent className="flex flex-col items-center space-y-6 relative z-10 p-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            bgcolor: 'transparent',
                                            border: `2px solid ${theme.palette.divider}`, // Use theme divider
                                            fontSize: '3rem',
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                                        }}
                                    >
                                        {user?.firstName?.charAt(0)}
                                    </Avatar>
                                </div>

                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {user?.firstName} {user?.lastName}
                                    </h2>
                                    <div className="flex items-center justify-center space-x-2 text-slate-400">
                                        <MailIcon sx={{ fontSize: 16 }} />
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                    <div className="pt-4">
                                        <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                                            {user?.role} Access
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Settings Forms */}
                    <Grid item xs={12} md={8}>
                        <div className="space-y-6">
                            {/* Profile Details */}
                            <Card>
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            <BadgeIcon />
                                        </div>
                                        <h3 className="text-xl font-black text-white italic tracking-tighter">
                                            Profile Details
                                        </h3>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="First Name"
                                                    fullWidth
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    variant="filled" // Theme override handles the style
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Last Name"
                                                    fullWidth
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    variant="filled" // Theme override handles the style
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Email Address"
                                                    fullWidth
                                                    value={user?.email}
                                                    disabled
                                                    variant="filled"
                                                    helperText="Email cannot be changed"
                                                // Minimal sx needed for disabled state specific tweak if theme component override isn't enough,
                                                // but let's try to rely on theme as much as possible.
                                                // Keeping disabling style minimal
                                                />
                                            </Grid>
                                        </Grid>
                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                            >
                                                <SaveIcon sx={{ fontSize: 20 }} />
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Security */}
                            <Card>
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <LockIcon />
                                        </div>
                                        <h3 className="text-xl font-black text-white italic tracking-tighter">
                                            Security Protocol
                                        </h3>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <TextField
                                            type="password"
                                            label="Current Password"
                                            fullWidth
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            variant="filled"
                                        />
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    type="password"
                                                    label="New Password"
                                                    fullWidth
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    variant="filled"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    type="password"
                                                    label="Confirm New Password"
                                                    fullWidth
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    variant="filled"
                                                />
                                            </Grid>
                                        </Grid>
                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                            >
                                                <LockIcon sx={{ fontSize: 20 }} />
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default ProfilePage;
