// Theme Constants - Re-export from new config structure
// This file maintains backward compatibility while using the new Next.js 15 theme structure

// Re-export everything from the new theme config
export * from '../../config/theme';

// Legacy exports for backward compatibility
export {
  THEME_COLORS,
  AI_COPILOT_COLORS,
  SEMANTIC_COLORS,
  LIGHT_THEME,
  DARK_THEME,
  DEFAULT_THEME,
  CSS_VARIABLES,
  getTheme,
  getCSSVariables,
  COMPONENT_THEMES,
} from '../../config/theme';

// Legacy type exports
export type {
  ThemeConfig,
  Theme,
  ThemeMode,
  CSSVariables,
} from '../../config/theme';
