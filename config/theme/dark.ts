import { THEME_COLORS } from './colors';

// Dark Theme Configuration
export const DARK_THEME = {
  // Background Colors
  background: {
    primary: '#1e1f21', // Updated background-page
    secondary: '#2e2e30', // Updated for sidebar/header
    tertiary: '#334155',
    muted: '#475569',
    weak: '#1e1f21',
    weakHover: '#2a2b2d', // Hover effect for task rows
  },

  // Text Colors
  text: {
    primary: '#f8fafc',
    secondary: '#e2e8f0',
    muted: '#94a3b8',
    weak: '#64748b',
    inverse: '#1e1f21', // Updated to match new background
  },

  // Border Colors
  border: {
    default: '#424244', // Updated color-border
    muted: '#475569',
    focus: THEME_COLORS.primary[400],
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
    background: '#dc2626',
    text: '#ffffff',
  },

  // Warning Colors - Added for EmailInviteChip
  warning: {
    light: '#451a03', // Dark brown background for warning elements
    default: '#f59e0b', // Bright yellow-orange for borders and accents
  },

  // Search Colors - MISSING PROPERTIES ADDED
  search: {
    background: '#2e2e30',
    backgroundStrong: '#3a3a3c',
    backgroundActive: '#424244',
    text: '#f8fafc',
    placeholder: '#94a3b8',
    border: '#424244',
    focus: THEME_COLORS.primary[400],
  },

  // Dropdown Colors - MISSING PROPERTIES ADDED
  dropdown: {
    background: '#2e2e30',
    backgroundHover: '#3a3a3c',
    backgroundActive: '#424244',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#424244',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  },

  // Component Colors
  sidebar: {
    background: '#2e2e30', // Updated sidebar background
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#424244',
    hover: '#3a3a3c',
    active: '#424244',
    iconColor: '#94a3b8',
    iconActiveColor: '#f8fafc',
  },

  // Header Colors
  header: {
    background: '#2e2e30', // Updated sidebar background
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#424244',
    hover: '#3a3a3c',
    active: '#424244',
    iconColor: '#94a3b8',
    iconActiveColor: '#f8fafc',
  },

  // Input Colors
  input: {
    background: '#2e2e30',
    border: '#424244',
    focus: THEME_COLORS.primary[400],
    text: '#f8fafc',
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
      background: '#334155',
      hover: '#475569',
      text: '#e2e8f0',
      border: '#424244',
    },
    // Formatting toolbar buttons - MISSING PROPERTIES ADDED
    formatting: {
      background: 'transparent',
      backgroundHover: '#3a3a3c',
      backgroundSelected: '#424244',
      backgroundSelectedHover: '#475569',
      backgroundSelectedActive: '#52525b',
      text: '#94a3b8',
      textHover: '#f8fafc',
      iconSelected: '#f8fafc',
      border: '#424244',
      borderHover: '#52525b',
      borderSelected: '#6366f1',
      borderActive: '#4f46e5',
    },
  },

  // Card Colors
  card: {
    background: '#2e2e30',
    border: '#424244',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    hover: '#334155',
  },

  // Modal Colors
  modal: {
    background: '#2e2e30',
    overlay: 'rgba(0, 0, 0, 0.7)',
    border: '#424244',
  },

  // Table Colors
  table: {
    header: '#334155',
    row: '#2e2e30',
    rowHover: '#3a3a3c',
    border: '#424244',
  },
} as const;

// CSS Variables for Dark Theme
export const DARK_CSS_VARIABLES = {
  // Background
  'bg-primary': DARK_THEME.background.primary,
  'bg-secondary': DARK_THEME.background.secondary,
  'bg-tertiary': DARK_THEME.background.tertiary,
  'bg-muted': DARK_THEME.background.muted,

  // Text
  'text-primary': DARK_THEME.text.primary,
  'text-secondary': DARK_THEME.text.secondary,
  'text-muted': DARK_THEME.text.muted,
  'text-inverse': DARK_THEME.text.inverse,

  // Border
  'border-default': DARK_THEME.border.default,
  'border-muted': DARK_THEME.border.muted,
  'border-focus': DARK_THEME.border.focus,

  // Status
  'status-success': DARK_THEME.status.success,
  'status-warning': DARK_THEME.status.warning,
  'status-error': DARK_THEME.status.error,
  'status-info': DARK_THEME.status.info,
} as const;
