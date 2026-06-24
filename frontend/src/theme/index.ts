import { createTheme } from '@mui/material/styles';
import { colors } from './tokens';
import { premium } from './premium';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrast,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },
    success: { main: colors.success.main, light: colors.success.light },
    warning: { main: colors.warning.main, light: colors.warning.light },
    error: { main: colors.error.main, light: colors.error.light },
    background: {
      default: premium.pageBg,
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[500],
    },
    divider: colors.neutral[200],
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: premium.displayFont, fontSize: '28px', fontWeight: 800, lineHeight: 1.25 },
    h2: { fontFamily: premium.displayFont, fontSize: '20px', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontFamily: premium.displayFont, fontSize: '16px', fontWeight: 700, lineHeight: 1.4 },
    body1: { fontSize: '14px', lineHeight: 1.5 },
    body2: { fontSize: '13px', lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: premium.primaryButtonGradient,
          boxShadow: '0 4px 18px rgba(37,99,235,0.3)',
          '&:hover': {
            background: premium.primaryButtonGradient,
            boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(148,163,184,0.22)',
          boxShadow: premium.cardShadow,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: colors.neutral[200] },
        head: {
          fontSize: '12px',
          fontWeight: 600,
          color: colors.neutral[500],
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
      },
    },
  },
});
