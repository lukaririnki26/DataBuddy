import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme, setLanguage } from '../store/slices/uiSlice';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../hooks/useTranslation';
import {
    Notifications as NotificationsIcon,
    Palette as PaletteIcon,
    Save as SaveIcon,
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

import { updateUserProfile } from '../store/slices/authSlice';

const SettingsPage: React.FC = () => {
    const { success, error } = useToast();
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch = useDispatch<any>();
    const ui = useSelector((state: RootState) => state.ui);
    const { user } = useSelector((state: RootState) => state.auth);

    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        pipelineAlerts: true,
        systemAnnouncements: true,
        theme: ui.theme,
        language: ui.language,
        dateFormat: 'YYYY-MM-DD',
    });

    // Load initial settings from User Profile and UI State
    useEffect(() => {
        if (user?.preferences) {
            setSettings(prev => ({
                ...prev,
                ...user.preferences,
                theme: ui.theme,
                language: ui.language
            }));
        }
    }, [user, ui.theme, ui.language]);

    const handleSettingChange = (setting: string, value: any) => {
        setSettings(prev => ({ ...prev, [setting]: value }));

        // Immediate preview for theme and language
        if (setting === 'theme') {
            dispatch(setTheme(value));
        }
        if (setting === 'language') {
            dispatch(setLanguage(value));
        }
    };

    const handleSaveSettings = async () => {
        try {
            // Dispatch UI changes
            dispatch(setTheme(settings.theme));
            dispatch(setLanguage(settings.language as any));

            // Save to Backend Profile
            await dispatch(updateUserProfile({
                preferences: {
                    emailNotifications: settings.emailNotifications,
                    pushNotifications: settings.pushNotifications,
                    pipelineAlerts: settings.pipelineAlerts,
                    systemAnnouncements: settings.systemAnnouncements,
                    dateFormat: settings.dateFormat
                }
            })).unwrap();

            success(t.settings.successTitle, t.settings.successMsg);
        } catch (err: any) {
            error('Save Failed', err.message || 'Could not save settings');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {/* Header */}
                <Box>
                    <Typography variant="h3" fontWeight="900" sx={{
                        background: `linear-gradient(to right, ${theme.palette.text.primary}, ${theme.palette.primary.light})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        mb: 1
                    }}>
                        {t.settings.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight="medium" sx={{ opacity: 0.7 }}>
                        {t.settings.subtitle}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
                        {/* Notifications */}
                        <Card>
                            <CardContent sx={{ p: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                                    <Box sx={{ p: 2, borderRadius: '1.5rem', bgcolor: alpha(theme.palette.warning.main, 0.1), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, color: theme.palette.warning.light }}>
                                        <NotificationsIcon />
                                    </Box>
                                    <Typography variant="h5" fontWeight="900" fontStyle="italic">{t.settings.notificationMatrix}</Typography>
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
                                            bgcolor: alpha(theme.palette.text.primary, 0.03),
                                            border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                                            transition: 'all 0.3s',
                                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06), borderColor: alpha(theme.palette.warning.main, 0.2) }
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
                                                        <Typography fontWeight="bold" sx={{ color: theme.palette.text.primary }}>{item.label}</Typography>
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
                            <Card>
                                <CardContent sx={{ p: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                                        <Box sx={{ p: 2, borderRadius: '1.5rem', bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${theme.palette.primary.main}33`, color: theme.palette.primary.light }}>
                                            <PaletteIcon />
                                        </Box>
                                        <Typography variant="h5" fontWeight="900" fontStyle="italic">{t.settings.interface}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="theme-select-label">{t.settings.theme}</InputLabel>
                                            <Select
                                                labelId="theme-select-label"
                                                value={settings.theme}
                                                onChange={(e) => handleSettingChange('theme', e.target.value)}
                                                label={t.settings.theme}
                                            >
                                                <MenuItem value="dark">{t.settings.themes.dark}</MenuItem>
                                                <MenuItem value="light">{t.settings.themes.light}</MenuItem>
                                                <MenuItem value="system">{t.settings.themes.system}</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth>
                                            <InputLabel id="language-select-label">{t.settings.language}</InputLabel>
                                            <Select
                                                labelId="language-select-label"
                                                value={settings.language}
                                                onChange={(e) => handleSettingChange('language', e.target.value)}
                                                label={t.settings.language}
                                            >
                                                <MenuItem value="en">{t.settings.languages.en}</MenuItem>
                                                <MenuItem value="id">{t.settings.languages.id}</MenuItem>
                                                <MenuItem value="es">{t.settings.languages.es}</MenuItem>
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
                            >
                                {t.settings.save}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default SettingsPage;
