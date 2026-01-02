import { createTheme, alpha } from '@mui/material/styles';

/**
 * Custom DataBuddy Premium Theme
 * Matches the System Command Center aesthetic (Slate 900 + Glassmorphism)
 */

const theme = createTheme({
    palette: {
        mode: 'dark',
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
            default: '#0f172a', // slate-900
            paper: alpha('#ffffff', 0.05), // Glass effect base
        },
        text: {
            primary: '#f8fafc', // slate-50
            secondary: '#94a3b8', // slate-400
        },
        success: {
            main: '#10b981', // emerald-500
            light: '#34d399', // emerald-400
            dark: '#059669', // emerald-600
            contrastText: '#ffffff',
        },
        warning: {
            main: '#f59e0b', // amber-500
            light: '#fbbf24', // amber-400
            dark: '#d97706', // amber-600
            contrastText: '#ffffff',
        },
        error: {
            main: '#ef4444', // red-500
            light: '#f87171', // red-400
            dark: '#dc2626', // red-600
            contrastText: '#ffffff',
        },
        info: {
            main: '#06b6d4', // cyan-500
            light: '#22d3ee', // cyan-400
            dark: '#0891b2', // cyan-600
            contrastText: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.025em',
        },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#0f172a',
                    backgroundImage: 'linear-gradient(to bottom right, #0f172a, rgba(49, 46, 129, 0.4), #0f172a)',
                    backgroundAttachment: 'fixed',
                    minHeight: '100vh',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha('#ffffff', 0.05),
                    backdropFilter: 'blur(16px)',
                    borderRadius: '2.5rem', // 40px
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'none',
                    overflow: 'visible',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '1rem', // 16px
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        transform: 'scale(1.02)',
                    },
                    transition: 'all 0.2s ease-in-out',
                },
                contained: {
                    backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiFilledInput-root': {
                        backgroundColor: alpha('#ffffff', 0.05),
                        borderRadius: '1rem',
                        border: '1px solid transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: alpha('#ffffff', 0.08),
                        },
                        '&.Mui-focused': {
                            backgroundColor: alpha('#ffffff', 0.1),
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
                        },
                        '&:before, &:after': {
                            display: 'none',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#94a3b8',
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                filled: {
                    backgroundColor: alpha('#ffffff', 0.05),
                    borderRadius: '1rem',
                    '&:focus': {
                        backgroundColor: alpha('#ffffff', 0.1),
                        borderRadius: '1rem',
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1rem',
                    marginTop: '8px',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    margin: '4px',
                    borderRadius: '8px',
                    '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.1),
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha('#3b82f6', 0.2),
                        '&:hover': {
                            backgroundColor: alpha('#3b82f6', 0.3),
                        },
                    },
                },
            },
        },
    },
});

export default theme;
