// Theme Type Definitions
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
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  badge: {
    background: string;
    text: string;
  };
  sidebar: {
    background: string;
    text: string;
    textMuted: string;
    border: string;
    hover: string;
    active: string;
    navigationIcon?: string;
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
    formatting?: {
      background: string;
      text: string;
      textHover: string;
      textSelected: string;
      icon: string;
      iconSelected: string;
      iconForeground: string;
      border: string;
      borderSelected: string;
      borderHover: string;
      borderActive: string;
      backgroundSelected: string;
      backgroundSelectedRgb: string;
      backgroundSelectedHover: string;
      backgroundSelectedActive: string;
      backgroundHover: string;
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
  warning?: {
    light: string;
    default: string;
  };
};

export type Theme = ThemeConfig;
export type ThemeMode = 'light' | 'dark';

export type CSSVariables = Record<string, string>;
