// Calendar-specific TypeScript interfaces to replace any types

import type { EventInfo, DateClickInfo, DropInfo, ResizeInfo } from './common';

// FullCalendar event object
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  classNames?: string[];
  extendedProps?: Record<string, unknown>;
}

// Calendar view types
export type CalendarView = 
  | 'dayGridMonth' 
  | 'dayGridWeek' 
  | 'dayGridDay'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek'
  | 'listMonth'
  | 'multiMonthYear';

// Calendar configuration
export interface CalendarConfig {
  initialView: CalendarView;
  headerToolbar?: {
    left?: string;
    center?: string;
    right?: string;
  };
  height?: string | number;
  aspectRatio?: number;
  editable?: boolean;
  selectable?: boolean;
  selectMirror?: boolean;
  dayMaxEvents?: boolean | number;
  weekends?: boolean;
  nowIndicator?: boolean;
  businessHours?: {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
  };
}

// Calendar event handlers
export interface CalendarEventHandlers {
  onEventClick?: (info: EventInfo) => void;
  onDateClick?: (info: DateClickInfo) => void;
  onEventDrop?: (info: DropInfo) => void;
  onEventResize?: (info: ResizeInfo) => void;
  onSelect?: (info: {
    start: Date;
    end: Date;
    startStr: string;
    endStr: string;
    allDay: boolean;
  }) => void;
}

// Calendar props
export interface CalendarProps extends CalendarConfig, CalendarEventHandlers {
  events: CalendarEvent[];
  loading?: boolean;
  className?: string;
}

// Simple calendar task
export interface SimpleCalendarTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  assignee?: string;
  avatar?: string;
}

// Simple calendar props
export interface SimpleCalendarProps {
  tasks?: SimpleCalendarTask[];
  onTaskClick?: (task: SimpleCalendarTask) => void;
  onTaskDrop?: (task: SimpleCalendarTask, newDate: Date) => void;
  onDateClick?: (date: Date) => void;
  height?: string;
  className?: string;
}

// Calendar state
export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedTask: SimpleCalendarTask | null;
  isPanelOpen: boolean;
}

// Calendar navigation
export interface CalendarNavigation {
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

// Calendar filter options
export interface CalendarFilters {
  showCompleted?: boolean;
  showOverdue?: boolean;
  assigneeFilter?: string[];
  priorityFilter?: string[];
  projectFilter?: string[];
}

// Calendar theme
export interface CalendarTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  text: string;
  border: string;
}