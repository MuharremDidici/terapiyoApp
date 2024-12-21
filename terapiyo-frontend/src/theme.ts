import { createTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    subtitle3: React.CSSProperties;
    body3: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    subtitle3?: React.CSSProperties;
    body3?: React.CSSProperties;
  }

  interface Palette {
    neutral: Palette['primary'];
  }

  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    subtitle3: true;
    body3: true;
  }
}

// Renk paleti
const colors = {
  primary: {
    main: '#3182CE',
    light: '#63B3ED',
    dark: '#2B6CB0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#805AD5',
    light: '#B794F4',
    dark: '#553C9A',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#38A169',
    light: '#68D391',
    dark: '#2F855A',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#DD6B20',
    light: '#F6AD55',
    dark: '#C05621',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#E53E3E',
    light: '#FC8181',
    dark: '#C53030',
    contrastText: '#FFFFFF',
  },
  neutral: {
    main: '#718096',
    light: '#A0AEC0',
    dark: '#4A5568',
    contrastText: '#FFFFFF',
  },
  text: {
    primary: '#1A365D',
    secondary: '#4A5568',
    disabled: '#A0AEC0',
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  divider: '#E2E8F0',
};

// Tipografi
const typography = {
  fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.75rem',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h4: {
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h5: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  subtitle1: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle3: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  body1: {
    fontSize: '1.125rem',
    lineHeight: 1.7,
  },
  body2: {
    fontSize: '1rem',
    lineHeight: 1.7,
  },
  body3: {
    fontSize: '0.875rem',
    lineHeight: 1.7,
  },
  button: {
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

// Bileşen stilleri
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      },
      contained: {
        boxShadow: '0 4px 6px rgba(49, 130, 206, 0.15)',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(49, 130, 206, 0.2)',
        },
      },
      outlined: {
        borderWidth: '2px',
        '&:hover': {
          borderWidth: '2px',
        },
      },
    },
    variants: [
      {
        props: { size: 'large' },
        style: {
          padding: '16px 32px',
          fontSize: '1.125rem',
        },
      },
      {
        props: { size: 'small' },
        style: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
      },
    ],
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: colors.primary.main,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${colors.primary.light}40`,
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        fontWeight: 500,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '20px',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: colors.divider,
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          color: colors.primary.dark,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
};

const theme = createTheme({
  palette: colors,
  typography,
  components,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 4px 6px rgba(0, 0, 0, 0.05)',
    '0 8px 12px rgba(0, 0, 0, 0.1)',
    '0 12px 24px rgba(0, 0, 0, 0.1)',
    '0 20px 40px rgba(0, 0, 0, 0.1)',
    ...Array(19).fill('none'), // MUI bekliyor
  ],
});

export default theme;
