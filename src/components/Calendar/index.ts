/**
 * Simple Calendar System - Clean Export
 * Single component solution for easy maintenance
 */

// Main Calendar Component
export { default as SimpleCalendar } from './SimpleCalendar';
export { default as CalendarHeader } from './CalendarHeader';
export { default as TaskDetailPanel } from './TaskDetailPanel';
export type { UserRole } from './CalendarHeader';

// Legacy Components (only Calendar.tsx remains for backward compatibility)
export { default as Calendar } from './Calendar';

// Default export - use SimpleCalendar for new implementations
export { default } from './SimpleCalendar';