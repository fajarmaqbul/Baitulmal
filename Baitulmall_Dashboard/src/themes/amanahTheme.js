import { createTheme } from '@mui/material/styles';

/**
 * AMANAH CORPORATE THEME
 * 
 * Theme Context:
 * Internal Dashboard for Baitulmal (Zakat, Infak, Sedekah).
 * Used by auditors and amils for sensitive financial data.
 * 
 * Core Values:
 * - Amanah (Trustworthy)
 * - Transparansi (Clear, High Contrast)
 * - Keterbacaan Tinggi (Legibility)
 * - Minim Distraksi (Clean, Professional)
 */

const amanahTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0f766e', // Teal 700: Represents stability, growth, and Islamic finance identity vertically.
            light: '#115e59', // Teal 800
            dark: '#134e4a', // Teal 900
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#334155', // Slate 700: Neutral, professional secondary action color.
            light: '#475569', // Slate 600
            dark: '#1e293b', // Slate 800
            contrastText: '#ffffff',
        },
        background: {
            default: '#f1f5f9', // Slate 100: Soft grey to reduce eye strain during long audit sessions.
            paper: '#ffffff', // Pure white for clear data presentation.
        },
        text: {
            primary: '#0f172a', // Slate 900: High contrast for maximum legibility of numbers.
            secondary: '#64748b', // Slate 500: Clear hierarchy for labels.
            disabled: '#94a3b8', // Slate 400
        },
        error: {
            main: '#be123c', // Rose 700: Distinct but not aggressively neon red.
        },
        warning: {
            main: '#b45309', // Amber 700: Professional warning color, readable on white.
        },
        success: {
            main: '#15803d', // Green 700: Trustworthy functional green.
        },
        divider: '#e2e8f0', // Slate 200: Subtle separation.
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a' },
        h3: { fontWeight: 600, letterSpacing: '-0.025em', color: '#0f172a' },
        h4: { fontWeight: 600, letterSpacing: '-0.025em', color: '#1e293b' },
        h5: { fontWeight: 600, color: '#1e293b' },
        h6: { fontWeight: 600, color: '#334155' },
        subtitle1: { fontWeight: 500, color: '#334155' },
        subtitle2: { fontWeight: 500, color: '#64748b' },
        body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: '#0f172a' }, // Optimized for data reading
        body2: { fontSize: '0.875rem', lineHeight: 1.5, color: '#334155' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
        borderRadius: 6, // Conservative rounding. "Playful" uses 12+, "Brutal" uses 0. 6 is balanced/professional.
    },
    components: {
        // Buttons: Clear, clickable, honest actions.
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    padding: '8px 16px',
                    '&:hover': {
                        boxShadow: 'none',
                        backgroundColor: 'rgba(15, 118, 110, 0.08)', // Subtle hover
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: '#115e59', // Darker Teal
                    },
                },
            },
        },
        // Cards: Data containers. Minimalist.
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid #e2e8f0', // Visible boundary instead of reliance on shadow
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Very subtle depth
                },
            },
        },
        // Tables: The heart of the dashboard.
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #f1f5f9',
                    padding: '16px',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: '#f8fafc', // Slate 50
                    color: '#475569', // Slate 600
                },
            },
        },
        // TextFields: Inputs for audit data.
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& fieldset': {
                        borderColor: '#cbd5e1', // Slate 300
                    },
                    '&:hover fieldset': {
                        borderColor: '#94a3b8', // Slate 400
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#0f766e', // Primary Teal
                        borderWidth: '1px', // No thick aggressive borders
                    },
                },
            },
        },
        // AppBar: Professional header.
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: 'none',
                },
            },
        },
    },
});

export default amanahTheme;
