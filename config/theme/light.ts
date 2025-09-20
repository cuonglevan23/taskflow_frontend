import { THEME_COLORS } from './colors';

// Light Theme Configuration
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

  // Status Colors
  status: {
    success: THEME_COLORS.success[500],
    warning: THEME_COLORS.warning[500],
    error: THEME_COLORS.error[500],
    info: THEME_COLORS.info[500],
  },

  // Badge Colors
  badge: {
    background: '#ef4444',
    text: '#ffffff',
  },

  // Warning Colors - Added for consistency with dark theme
  warning: {
    light: '#fef3c7', // Light yellow background for warning elements
    default: '#f59e0b', // Orange for borders and accents
  },

  // Search Colors - MISSING PROPERTIES ADDED
  search: {
    background: '#ffffff',
    backgroundStrong: '#f1f5f9',
    backgroundActive: '#e2e8f0',
    text: '#1e1f21',
    placeholder: '#64748b',
    border: '#e2e8f0',
    focus: THEME_COLORS.primary[500],
  },

  // Dropdown Colors - MISSING PROPERTIES ADDED
  dropdown: {
    background: '#ffffff',
    backgroundHover: '#f1f5f9',
    backgroundActive: '#e2e8f0',
    text: '#1e1f21',
    textMuted: '#64748b',
    border: '#e2e8f0',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },

  // Component Colors
  sidebar: {
    background: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
    hover: '#f1f5f9',
    active: '#e2e8f0',
    iconColor: '#64748b',
    iconActiveColor: '#1e293b',
  },

  // Header Colors
  header: {
    background: '#ffffff',
    text: '#1e293b',
    border: '#e2e8f0',
  },

  // Input Colors
  input: {
    background: '#ffffff',
    border: '#e2e8f0',
    focus: THEME_COLORS.primary[500],
    text: '#1e293b',
    placeholder: '#94a3b8',
  },

  // Button Colors
  button: {
    primary: {
      background: THEME_COLORS.primary[600],
      hover: THEME_COLORS.primary[700],
      text: '#ffffff',
    },
    secondary: {
      background: '#f1f5f9',
      hover: '#e2e8f0',
      text: '#475569',
      border: '#e2e8f0',
    },
    // Formatting toolbar buttons - MISSING PROPERTIES ADDED
    formatting: {
      background: 'transparent',
      backgroundHover: '#f1f5f9',
      backgroundSelected: '#e2e8f0',
      backgroundSelectedHover: '#cbd5e1',
      backgroundSelectedActive: '#94a3b8',
      text: '#64748b',
      textHover: '#1e293b',
      iconSelected: '#1e293b',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
      borderSelected: '#6366f1',
      borderActive: '#4f46e5',
    },
  },

  // Card Colors
  card: {
    background: '#ffffff',
    border: '#e2e8f0',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    hover: '#f8fafc',
  },

  // Modal Colors
  modal: {
    background: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    border: '#e2e8f0',
  },

  // Table Colors
  table: {
    header: '#f8fafc',
    row: '#ffffff',
    rowHover: '#f1f5f9',
    border: '#e2e8f0',
  },
} as const;

// CSS Variables for Light Theme
export const LIGHT_CSS_VARIABLES = {
  // Background
  'bg-primary': LIGHT_THEME.background.primary,
  'bg-secondary': LIGHT_THEME.background.secondary,
  'bg-tertiary': LIGHT_THEME.background.tertiary,
  'bg-muted': LIGHT_THEME.background.muted,

  // Text
  'text-primary': LIGHT_THEME.text.primary,
  'text-secondary': LIGHT_THEME.text.secondary,
  'text-muted': LIGHT_THEME.text.muted,
  'text-inverse': LIGHT_THEME.text.inverse,

  // Border
  'border-default': LIGHT_THEME.border.default,
  'border-muted': LIGHT_THEME.border.muted,
  'border-focus': LIGHT_THEME.border.focus,

  // Status
  'status-success': LIGHT_THEME.status.success,
  'status-warning': LIGHT_THEME.status.warning,
  'status-error': LIGHT_THEME.status.error,
  'status-info': LIGHT_THEME.status.info,
} as const;
