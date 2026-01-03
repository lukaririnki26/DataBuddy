import { createTheme, alpha, Theme } from '@mui/material/styles';

/**
 * Custom DataBuddy Premium Theme
 * Matches the System Command Center aesthetic (Nuclear Glassmorphism)
 */

export const getAppTheme = (mode: 'light' | 'dark'): Theme => {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
            primary: {
                main: '#3b82f6', // blue-500
                light: '#60a5fa', // blue-400
                dark: '#2563eb', // blue-600
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#a855f7', // purple-500
                light: '#c084fc', // purple-400
                dark: '#9333ea', // purple-600
                contrastText: '#ffffff',
            },
            background: {
                default: isDark ? '#0f172a' : '#f8fafc',
                paper: isDark ? '#1e293b' : '#ffffff',
            },
            text: {
                primary: isDark ? '#f8fafc' : '#0f172a',
                secondary: isDark ? '#94a3b8' : '#64748b',
            },
            success: {
                main: '#10b981',
                light: '#34d399',
                dark: '#059669',
                contrastText: '#ffffff',
            },
            warning: {
                main: '#f59e0b',
                light: '#fbbf24',
                dark: '#d97706',
                contrastText: '#ffffff',
            },
            error: {
                main: '#ef4444',
                light: '#f87171',
                dark: '#dc2626',
                contrastText: '#ffffff',
            },
            info: {
                main: '#06b6d4',
                light: '#22d3ee',
                dark: '#0891b2',
                contrastText: '#ffffff',
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em' },
            h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' },
            h3: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em' },
            h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em' },
            button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.025em' },
        },
        shape: {
            borderRadius: 16,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        backgroundImage: isDark
                            ? 'linear-gradient(to bottom right, #0f172a, rgba(49, 46, 129, 0.4), #0f172a)'
                            : 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #f8fafc)',
                        backgroundAttachment: 'fixed',
                        minHeight: '100vh',
                        transition: 'background-color 0.3s ease',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                        backdropFilter: 'blur(32px)',
                        borderRadius: '2.5rem',
                        border: isDark
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: isDark
                            ? '0 40px 100px -20px rgba(0,0,0,0.5)'
                            : '0 20px 50px -10px rgba(0,0,0,0.05)',
                        overflow: 'visible',
                        transition: 'all 0.3s ease-in-out',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '1.25rem',
                        padding: '12px 28px',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        letterSpacing: '0.05em',
                        boxShadow: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 10px 20px -5px ${alpha('#000000', 0.3)}`,
                        },
                    },
                    contained: {
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#ffffff',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        },
                    },
                },
            },
            MuiTextField: {
                defaultProps: { variant: 'standard' },
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-root': {
                            backgroundColor: isDark ? alpha('#ffffff', 0.05) : alpha('#000000', 0.03),
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1.25rem',
                            border: isDark
                                ? '1px solid rgba(255, 255, 255, 0.15)'
                                : '1px solid rgba(0, 0, 0, 0.1)',
                            padding: '10px 20px',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            '&:before, &:after': { display: 'none' },
                            '&:hover': {
                                backgroundColor: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.05),
                                borderColor: alpha('#3b82f6', 0.4),
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: isDark ? '#94a3b8' : '#64748b',
                            marginLeft: '12px',
                            transform: 'translate(0, -1.5rem) scale(1)',
                            '&.MuiInputLabel-shrink': { transform: 'translate(0, -1.5rem) scale(0.85)' },
                        },
                    },
                },
            },
            MuiSelect: {
                defaultProps: { variant: 'standard', disableUnderline: true },
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? alpha('#ffffff', 0.05) : alpha('#000000', 0.03),
                        backdropFilter: 'blur(12px)',
                        borderRadius: '1.25rem',
                        border: isDark
                            ? '1px solid rgba(255, 255, 255, 0.15)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                        padding: '10px 20px',
                        '& .MuiSelect-select': { color: isDark ? '#f8fafc' : '#0f172a' },
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                        borderRadius: '1.25rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        margin: '6px 8px',
                        borderRadius: '0.75rem',
                        color: isDark ? '#f8fafc' : '#0f172a',
                    },
                },
            },
        },
    });
};

const defaultTheme = getAppTheme('dark');
export default defaultTheme;
