/**
 * Z-Index Scale - Professional approach
 * Used by companies like Airbnb, Stripe, etc.
 */

export const Z_INDEX = {
  // Base layer
  base: 1,
  
  // Content layers
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  overlay: 1300,
  popover: 1400,
  tooltip: 1500,
  
  // System layers
  notification: 2000,
  loading: 2100,
  
  // Critical layers
  modal_max: 9998,
  system_critical: 9999,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;