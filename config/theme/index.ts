// Main theme configuration file
export * from './colors';
export * from './light';
export * from './dark';
export * from './types';

import { LIGHT_THEME, LIGHT_CSS_VARIABLES } from './light';
import { DARK_THEME, DARK_CSS_VARIABLES } from './dark';
import { ThemeMode, Theme, CSSVariables } from './types';

// Default Theme
export const DEFAULT_THEME = DARK_THEME;

// CSS Variables for Dynamic Theming
export const CSS_VARIABLES = {
  light: LIGHT_CSS_VARIABLES,
  dark: DARK_CSS_VARIABLES,
} as const;

// Helper Functions
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
};

export const getCSSVariables = (mode: ThemeMode): CSSVariables => {
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
