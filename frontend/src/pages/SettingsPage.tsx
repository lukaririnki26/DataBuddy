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
    FormControl,
    InputLabel,
    Grid,
    useTheme,
    alpha,
} from '@mui/material';

const SettingsPage: React.FC = () => {
    const { success } = useToast();
    const theme = useTheme();

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
        success('Settings Saved', 'System preferences updated successfully');
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
                        System Logic
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight="medium" sx={{ opacity: 0.7 }}>
                        Customize application behavior and regional protocols
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
                        {/* Notifications */}
                        <Card sx={{
                            height: '100%',
                            borderRadius: '2.5rem',
                            bgcolor: alpha(theme.palette.common.white, 0.03),
                            backdropFilter: 'blur(32px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}>
                            <CardContent sx={{ p: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                                    <Box sx={{ p: 2, borderRadius: '1.5rem', bgcolor: alpha(theme.palette.warning.main, 0.1), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, color: theme.palette.warning.light }}>
                                        <NotificationsIcon />
                                    </Box>
                                    <Typography variant="h5" fontWeight="900" fontStyle="italic">Notification Matrix</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {[
                                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email' },
                                        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time browser notifications for active tasks' },
                                        { key: 'pipelineAlerts', label: 'Pipeline Alerts', desc: 'Notify when pipeline execution fails or completes' },
                                        { key: 'systemAnnouncements', label: 'System Announcements', desc: 'Maintenance schedules and feature updates' }
                                    ].map((item) => (
                                        <Box key={item.key} sx={{
                                            p: 3, borderRadius: '1.5rem',
                                            bgcolor: alpha(theme.palette.common.white, 0.03),
                                            border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                                            transition: 'all 0.3s',
                                            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.06), borderColor: alpha(theme.palette.warning.main, 0.2) }
                                        }}>
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
                                                    <Box sx={{ ml: 2 }}>
                                                        <Typography fontWeight="bold" sx={{ color: 'white' }}>{item.label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                                                    </Box>
                                                }
                                                sx={{ width: '100%', m: 0 }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        {/* Appearance & Regional */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
                            <Card sx={{
                                borderRadius: '2.5rem',
                                bgcolor: alpha(theme.palette.common.white, 0.03),
                                backdropFilter: 'blur(32px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}>
                                <CardContent sx={{ p: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                                        <Box sx={{ p: 2, borderRadius: '1.5rem', bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, color: theme.palette.primary.light }}>
                                            <PaletteIcon />
                                        </Box>
                                        <Typography variant="h5" fontWeight="900" fontStyle="italic">Interface Customization</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <FormControl fullWidth variant="filled" sx={{ '& .MuiSelect-icon': { color: 'white' } }}>
                                            <InputLabel id="theme-select-label">Theme Preference</InputLabel>
                                            <Select
                                                labelId="theme-select-label"
                                                value={settings.theme}
                                                onChange={(e) => handleSettingChange('theme', e.target.value)}
                                            >
                                                <MenuItem value="dark">Dark Mode (Default)</MenuItem>
                                                <MenuItem value="light">Light Mode</MenuItem>
                                                <MenuItem value="system">System Sync</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth variant="filled" sx={{ '& .MuiSelect-icon': { color: 'white' } }}>
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
                                    </Box>
                                </CardContent>
                            </Card>

                            <Button
                                onClick={handleSaveSettings}
                                fullWidth
                                variant="contained"
                                startIcon={<SaveIcon />}
                                sx={{
                                    py: 2.5,
                                    borderRadius: '1.5rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.2em',
                                    fontSize: '0.75rem',
                                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 25px 50px ${alpha(theme.palette.primary.main, 0.3)}` }
                                }}
                            >
                                Authorize Logic Sync
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default SettingsPage;
