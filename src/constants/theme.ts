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
    weak: '#fff',
    weakHover: '#f1f5f9',
  },
  
  // Text Colors
  text: {
    primary: '#1e1f21',
    secondary: '#475569',
    muted: '#64748b',
    weak: '#6d6e6f',
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

  search: {
    background: '#ffffff',
    backgroundStrong: '#f8fafc',
    backgroundActive: '#f1f5f9',
    text: '#0f172a',
    placeholder: '#64748b',
    border: '#e2e8f0',
    focus: '#0066cc',
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
      background: '#fff',
      hover: '#f9f8f8',
      active: '#f5f3f3',
      text: THEME_COLORS.secondary[700],
      border: THEME_COLORS.secondary[300],
    },
    tertiary: {
      background: 'rgba(55, 23, 23, .03)',
      hover: 'rgba(55, 23, 23, .05)',
      text: THEME_COLORS.secondary[700],
    },
    subtle: {
      background: 'transparent',
      hover: '#f9f8f8',
      text: THEME_COLORS.secondary[700],
    },
    success: {
      background: '#f0fdf4', // Light green background
      hover: '#dcfce7', // Lighter green on hover
      text: '#15803d', // Dark green text
      border: '#86efac', // Medium green border
      icon: '#16a34a', // Green icon color
    },
  },
} as const;

// Dark Theme
export const DARK_THEME = {
  // Background Colors
  background: {
    primary: '#1e1f21', // Updated background-page
    secondary: '#2e2e30', // Updated for sidebar/header
    tertiary: '#334155',
    muted: '#475569',
    weakHover: '#2a2b2d', // Hover effect for task rows
  },
  
  // Text Colors
  text: {
    primary: '#f8fafc',
    secondary: '#e2e8f0',
    muted: '#94a3b8',
    inverse: '#1e1f21', // Updated to match new background
  },
  
  // Border Colors
  border: {
    default: '#424244', // Updated color-border
    muted: '#475569',
    focus: THEME_COLORS.primary[400],
  },
  
  // Component Colors
  sidebar: {
    background: '#2e2e30', // Updated sidebar background
    text: '#f5f4f3', // Updated text color for sidebar
    textMuted: '#94a3b8',
    border: '#424244', // Updated border color
    hover: '#424244', // Updated hover color
    active: THEME_COLORS.primary[500],
    navigationIcon: '#a2a0a2', // Navigation icon color for dark mode
  },
  
  header: {
    background: '#2e2e30', // Updated header background
    text: '#e2e8f0',
    border: '#424244', // Updated border color
  },

  search: {
    background: '#3d3e40', // Navigation search background
    backgroundStrong: '#565557', // Navigation search background strong
    backgroundActive: '#1e1f21', // Navigation search background when clicked/active
    text: '#e2e8f0',
    placeholder: '#94a3b8',
    border: '#424244',
    focus: '#0066cc',
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
    success: {
      background: '#1d3733', // --color-success-background
      hover: '#4b8a73', // --color-button-success-border-pressedHover
      text: '#66a88b', // --color-success-text
      textHover: '#93c0aa', // --color-success-text-hover
      textStrong: '#ffffff', // --color-success-text-strong
      border: '#32695d', // --color-button-success-border-pressed
      borderHover: '#4b8a73', // --color-button-success-border-pressedHover
      icon: '#5da283', // --color-success-icon
      iconHover: '#74af93', // --color-success-icon-hover
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
    weak?: string;
    weakHover: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    weak?: string;
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
  search: {
    background: string;
    backgroundStrong: string;
    backgroundActive: string;
    text: string;
    placeholder: string;
    border: string;
    focus: string;
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
      active?: string;
      text: string;
      border: string;
    };
    tertiary?: {
      background: string;
      hover: string;
      text: string;
    };
    subtle?: {
      background: string;
      hover: string;
      text: string;
    };
    success: {
      background: string;
      hover: string;
      text: string;
      textHover?: string;
      textStrong?: string;
      border: string;
      borderHover?: string;
      icon: string;
      iconHover?: string;
    };
  };
  colors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    [key: string]: string | undefined;
  };
};

export type Theme = ThemeConfig;
export type ThemeMode = 'light' | 'dark';

// Default Theme
export const DEFAULT_THEME = DARK_THEME;

// CSS Variables for Dynamic Theming
export const CSS_VARIABLES = {
  light: {
    '--color-primary': THEME_COLORS.primary[500],
    '--color-primary-hover': THEME_COLORS.primary[600],
    '--color-background-primary': LIGHT_THEME.background.primary,
    '--color-background-secondary': LIGHT_THEME.background.secondary,
    '--color-background-weak': '#fff',
    '--color-text': '#1e1f21',
    '--color-text-weak': '#6d6e6f',
    '--color-text-primary': LIGHT_THEME.text.primary,
    '--color-text-secondary': LIGHT_THEME.text.secondary,
    '--color-border-default': LIGHT_THEME.border.default,
    '--color-sidebar-bg': LIGHT_THEME.sidebar.background,
    '--color-sidebar-text': LIGHT_THEME.sidebar.text,
    '--color-header-bg': LIGHT_THEME.header.background,
    '--color-dropdown-bg': LIGHT_THEME.dropdown.background,
    '--color-button-border-tertiary-hover-experimental': 'transparent',
    '--color-button-background-primary-disabled': '#fff',
    '--color-button-background-secondary': '#fff',
    '--color-button-background-secondary-hover': '#f9f8f8',
    '--color-button-background-secondary-active': '#f5f3f3',
    '--color-button-background-tertiary-experimental': 'rgba(55, 23, 23, .03)',
    '--color-button-background-tertiary-hover-experimental': 'rgba(55, 23, 23, .05)',
    '--color-button-background-subtle': 'transparent',
    '--color-button-background-subtle-pressed': '#dbe0fd',
    '--color-success-text': '#66a88b',
    '--color-button-success-border-pressed': '#32695d',
  },
  dark: {
    '--color-primary': THEME_COLORS.primary[500],
    '--color-primary-hover': THEME_COLORS.primary[600],
    '--color-background-primary': '#1e1f21', // Updated background-page
    '--color-background-secondary': '#2e2e30', // Updated for sidebar/header
    '--color-text-primary': DARK_THEME.text.primary,
    '--color-text-secondary': DARK_THEME.text.secondary,
    '--color-border-default': '#424244', // Updated color-border
    '--color-sidebar-bg': '#2e2e30', // Updated sidebar background
    '--color-sidebar-text': DARK_THEME.sidebar.text,
    '--color-header-bg': '#2e2e30', // Updated header background
    '--color-dropdown-bg': DARK_THEME.dropdown.background,
    '--color-navigation-search-background': '#3d3e40', // Navigation search background
    '--color-navigation-search-background-strong': '#565557', // Navigation search background strong
    '--color-success-text': '#66a88b',
    '--color-button-success-border-pressed': '#32695d',
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