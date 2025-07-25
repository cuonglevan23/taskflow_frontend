// Theme Constants - Centralized color and styling management
export const THEME_COLORS = {
  // Primary Colors
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info Colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// Semantic Color Mappings
export const SEMANTIC_COLORS = {
  // Task Type Colors
  task: THEME_COLORS.info[500],
  project: THEME_COLORS.success[500],
  message: '#8b5cf6', // Purple
  team: '#6366f1', // Indigo
  portfolio: THEME_COLORS.warning[500],
  goal: '#eab308', // Yellow
  invite: THEME_COLORS.secondary[500],
} as const;

// Light Theme
export const LIGHT_THEME = {
  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    muted: '#e2e8f0',
  },
  
  // Text Colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
    inverse: '#ffffff',
  },
  
  // Border Colors
  border: {
    default: '#e2e8f0',
    muted: '#f1f5f9',
    focus: THEME_COLORS.primary[500],
  },
  
  // Component Colors
  sidebar: {
    background: '#1e293b',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    border: '#334155',
    hover: '#334155',
    active: THEME_COLORS.primary[500],
  },
  
  header: {
    background: '#1e293b',
    text: '#e2e8f0',
    border: '#334155',
  },
  
  dropdown: {
    background: '#ffffff',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    hover: '#f8fafc',
  },
  
  button: {
    primary: {
      background: THEME_COLORS.primary[500],
      hover: THEME_COLORS.primary[600],
      text: '#ffffff',
    },
    secondary: {
      background: 'transparent',
      hover: '#f1f5f9',
      text: THEME_COLORS.secondary[700],
      border: THEME_COLORS.secondary[300],
    },
  },
} as const;

// Dark Theme
export const DARK_THEME = {
  // Background Colors
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    muted: '#475569',
  },
  
  // Text Colors
  text: {
    primary: '#f8fafc',
    secondary: '#e2e8f0',
    muted: '#94a3b8',
    inverse: '#0f172a',
  },
  
  // Border Colors
  border: {
    default: '#334155',
    muted: '#475569',
    focus: THEME_COLORS.primary[400],
  },
  
  // Component Colors
  sidebar: {
    background: '#0f172a',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    border: '#1e293b',
    hover: '#1e293b',
    active: THEME_COLORS.primary[500],
  },
  
  header: {
    background: '#0f172a',
    text: '#e2e8f0',
    border: '#1e293b',
  },
  
  dropdown: {
    background: '#1e293b',
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    hover: '#334155',
  },
  
  button: {
    primary: {
      background: THEME_COLORS.primary[500],
      hover: THEME_COLORS.primary[600],
      text: '#ffffff',
    },
    secondary: {
      background: 'transparent',
      hover: '#334155',
      text: THEME_COLORS.secondary[200],
      border: THEME_COLORS.secondary[600],
    },
  },
} as const;

// Theme Type
export type ThemeConfig = {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    default: string;
    muted: string;
    focus: string;
  };
  sidebar: {
    background: string;
    text: string;
    textMuted: string;
    border: string;
    hover: string;
    active: string;
  };
  header: {
    background: string;
    text: string;
    border: string;
  };
  dropdown: {
    background: string;
    border: string;
    shadow: string;
    hover: string;
  };
  button: {
    primary: {
      background: string;
      hover: string;
      text: string;
    };
    secondary: {
      background: string;
      hover: string;
      text: string;
      border: string;
    };
  };
};

export type Theme = ThemeConfig;
export type ThemeMode = 'light' | 'dark';

// Default Theme
export const DEFAULT_THEME = LIGHT_THEME;

// CSS Variables for Dynamic Theming
export const CSS_VARIABLES = {
  light: {
    '--color-primary': THEME_COLORS.primary[500],
    '--color-primary-hover': THEME_COLORS.primary[600],
    '--color-background-primary': LIGHT_THEME.background.primary,
    '--color-background-secondary': LIGHT_THEME.background.secondary,
    '--color-text-primary': LIGHT_THEME.text.primary,
    '--color-text-secondary': LIGHT_THEME.text.secondary,
    '--color-border-default': LIGHT_THEME.border.default,
    '--color-sidebar-bg': LIGHT_THEME.sidebar.background,
    '--color-sidebar-text': LIGHT_THEME.sidebar.text,
    '--color-header-bg': LIGHT_THEME.header.background,
    '--color-dropdown-bg': LIGHT_THEME.dropdown.background,
  },
  dark: {
    '--color-primary': THEME_COLORS.primary[500],
    '--color-primary-hover': THEME_COLORS.primary[600],
    '--color-background-primary': DARK_THEME.background.primary,
    '--color-background-secondary': DARK_THEME.background.secondary,
    '--color-text-primary': DARK_THEME.text.primary,
    '--color-text-secondary': DARK_THEME.text.secondary,
    '--color-border-default': DARK_THEME.border.default,
    '--color-sidebar-bg': DARK_THEME.sidebar.background,
    '--color-sidebar-text': DARK_THEME.sidebar.text,
    '--color-header-bg': DARK_THEME.header.background,
    '--color-dropdown-bg': DARK_THEME.dropdown.background,
  },
} as const;

// Helper Functions
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
};

export const getCSSVariables = (mode: ThemeMode) => {
  return CSS_VARIABLES[mode];
};

// Component Specific Themes
export const COMPONENT_THEMES = {
  createButton: {
    light: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      hover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      text: '#ffffff',
      shadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
      hoverShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)',
    },
    dark: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      hover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      text: '#ffffff',
      shadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)',
      hoverShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.5)',
    },
  },
} as const; 