/**
 * Synchronized Animation System
 * Ensures consistent timing across all UI components
 */

export const ANIMATIONS = {
  // No animations - instant response
  dropdown: {
    duration: '',
    easing: '',
    enter: '',
    exit: '',
  },
  
  // No animations for items
  item: {
    duration: '', 
    easing: '',
    hover: '',
  },
  
  // No animations for buttons
  button: {
    duration: '',
    easing: '',
    hover: '',
  },

  // No animations for modals
  modal: {
    duration: '',
    easing: '',
    enter: '',
    exit: '',
  },
} as const;

// No animation helper functions - completely static
export const getDropdownClasses = () => '';

export const getItemClasses = () => '';

export const getButtonClasses = () => '';