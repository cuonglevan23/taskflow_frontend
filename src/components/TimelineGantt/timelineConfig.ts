import { CalendarOptions } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';

export const TIMELINE_CONFIG = {
  // Time range constants
  DATE_RANGE: {
    START: '2025-07-01',
    END: '2025-09-30'
  },
  
  // Layout constants
  LAYOUT: {
    RESOURCE_AREA_WIDTH: 200,
    SLOT_MIN_WIDTH: 80,
    MIN_HEIGHT: 600
  },
  
  // View settings
  VIEW: {
    INITIAL: 'resourceTimelineWeek' as const,
    INITIAL_DATE: '2025-07-01'
  }
};

export const createCalendarOptions = (
  resources: any[],
  events: any[],
  onEventClick?: (info: any) => void,
  onEventDrop?: (info: any) => void,
  onEventResize?: (info: any) => void
): CalendarOptions => ({
  plugins: [resourceTimelinePlugin, interactionPlugin],
  schedulerLicenseKey: "GPL-My-Project-Is-Open-Source",
  
  // View configuration
  initialView: TIMELINE_CONFIG.VIEW.INITIAL,
  initialDate: TIMELINE_CONFIG.VIEW.INITIAL_DATE,
  validRange: {
    start: TIMELINE_CONFIG.DATE_RANGE.START,
    end: TIMELINE_CONFIG.DATE_RANGE.END
  },
  
  // Header configuration
  headerToolbar: {
    left: '',
    center: '',
    right: ''
  },
  
  // Resource configuration
  resourceAreaHeaderContent: "",
  resourceAreaWidth: `${TIMELINE_CONFIG.LAYOUT.RESOURCE_AREA_WIDTH}px`,
  resourceAreaColumns: [
    {
      headerContent: '',
      field: 'title',
      width: TIMELINE_CONFIG.LAYOUT.RESOURCE_AREA_WIDTH
    }
  ],
  
  // Data
  resources,
  events,
  
  // Layout
  height: "100%",
  contentHeight: "100%",
  slotDuration: "1 day",
  slotMinTime: "00:00:00",
  slotMaxTime: "24:00:00",
  slotLabelFormat: {
    month: 'short',
    day: 'numeric'
  },
  slotMinWidth: TIMELINE_CONFIG.LAYOUT.SLOT_MIN_WIDTH,
  
  // Behavior
  businessHours: false,
  weekends: true,
  nowIndicator: true,
  scrollTime: "08:00:00",
  editable: true,
  eventResizableFromStart: true,
  resourceOrder: "id",
  dayMaxEvents: false,
  eventOverlap: false,
  slotEventOverlap: false,
  aspectRatio: 3,
  expandRows: true,
  
  // Event handlers
  eventClick: onEventClick,
  eventDrop: onEventDrop,
  eventResize: onEventResize
});

export const createEventContent = (arg: any) => {
  const task = arg.event.extendedProps.task;
  
  const container = document.createElement('div');
  container.className = 'flex items-center gap-2 px-3 h-full min-w-0 w-full';
  
  if (task?.assignees?.length > 0) {
    const avatar = document.createElement('div');
    avatar.className = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border border-white/20';
    avatar.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)';
    avatar.textContent = task.assignees[0].avatar || task.assignees[0].name.substring(0, 2);
    container.appendChild(avatar);
  }
  
  const title = document.createElement('span');
  title.className = 'truncate text-sm font-medium text-white';
  title.textContent = arg.event.title;
  container.appendChild(title);
  
  return { domNodes: [container] };
};