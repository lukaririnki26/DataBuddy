import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
    Notifications as NotificationsIcon,
    Palette as PaletteIcon,
    Language as LanguageIcon,
    Save as SaveIcon,
    Tune as TuneIcon,
    VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    Button,
    Divider,
    FormControl,
    InputLabel,
    Grid,
    useTheme
} from '@mui/material';

const SettingsPage: React.FC = () => {
    const { success } = useToast();
    const theme = useTheme();

    // Placeholder state for settings
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        pipelineAlerts: true,
        systemAnnouncements: true,
        theme: 'dark',
        language: 'en',
        dateFormat: 'YYYY-MM-DD',
    });

    const handleSettingChange = (setting: string, value: any) => {
        setSettings(prev => ({ ...prev, [setting]: value }));
    };

    const handleSaveSettings = () => {
        // In a real app, this would dispatch an action or call an API
        success('Settings Saved', 'System preferences updated successfully');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
            <div className="relative z-10 p-8 space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                        System Configuration
                    </h1>
                    <p className="text-slate-400 text-lg font-medium">
                        Customize application behavior and regional preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Notifications */}
                    <Card sx={{ height: '100%' }}>
                        <CardContent className="p-8 h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    <NotificationsIcon />
                                </div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter">
                                    Notification Matrix
                                </h3>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email' },
                                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time browser notifications for active tasks' },
                                    { key: 'pipelineAlerts', label: 'Pipeline Alerts', desc: 'Notify when pipeline execution fails or completes' },
                                    { key: 'systemAnnouncements', label: 'System Announcements', desc: 'Maintenance schedules and feature updates' }
                                ].map((item) => (
                                    <div key={item.key} className="p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={(settings as any)[item.key]}
                                                    onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.warning.light },
                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: theme.palette.warning.dark },
                                                    }}
                                                />
                                            }
                                            label={
                                                <div className="ml-2">
                                                    <Typography className="text-white font-bold">{item.label}</Typography>
                                                    <Typography variant="caption" className="text-slate-400">{item.desc}</Typography>
                                                </div>
                                            }
                                            className="w-full m-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance & Regional */}
                    <div className="flex flex-col gap-8">
                        <Card>
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                        <PaletteIcon />
                                    </div>
                                    <h3 className="text-xl font-black text-white italic tracking-tighter">
                                        Interface Customization
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    <FormControl fullWidth variant="filled" sx={{
                                        '& .MuiSelect-icon': { color: 'white' }
                                    }}>
                                        <InputLabel id="theme-select-label">Theme Preference</InputLabel>
                                        <Select
                                            labelId="theme-select-label"
                                            value={settings.theme}
                                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                                        // variant="filled" style handled by theme overrides
                                        >
                                            <MenuItem value="dark">Dark Mode (Default)</MenuItem>
                                            <MenuItem value="light">Light Mode</MenuItem>
                                            <MenuItem value="system">System Sync</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth variant="filled" sx={{
                                        '& .MuiSelect-icon': { color: 'white' }
                                    }}>
                                        <InputLabel id="language-select-label">Language / Region</InputLabel>
                                        <Select
                                            labelId="language-select-label"
                                            value={settings.language}
                                            onChange={(e) => handleSettingChange('language', e.target.value)}
                                        >
                                            <MenuItem value="en">English (US)</MenuItem>
                                            <MenuItem value="id">Bahasa Indonesia</MenuItem>
                                            <MenuItem value="es">Español</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </CardContent>
                        </Card>

                        <button
                            onClick={handleSaveSettings}
                            className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-sm"
                        >
                            <SaveIcon />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
