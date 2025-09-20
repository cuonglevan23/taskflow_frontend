// Custom hook for calendar UI state management
import { useState, useCallback } from 'react';
import { TaskListItem } from '@/components/TaskList/types';

interface CalendarState {
  currentDate: Date;
  view: 'dayGridMonth' | 'dayGridWeek';
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
}

export const useCalendarState = () => {
  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'dayGridMonth',
    selectedTask: null,
    isPanelOpen: false
  });

  // Calendar navigation handlers
  const handlePrevious = useCallback(() => {
    const newDate = new Date(calendarState.currentDate);
    if (calendarState.view === 'dayGridMonth') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCalendarState(prev => ({ ...prev, currentDate: newDate }));
  }, [calendarState.currentDate, calendarState.view]);

  const handleNext = useCallback(() => {
    const newDate = new Date(calendarState.currentDate);
    if (calendarState.view === 'dayGridMonth') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCalendarState(prev => ({ ...prev, currentDate: newDate }));
  }, [calendarState.currentDate, calendarState.view]);

  const handleToday = useCallback(() => {
    setCalendarState(prev => ({ ...prev, currentDate: new Date() }));
  }, []);

  // Task detail panel handlers
  const openTaskDetail = useCallback((task: TaskListItem) => {
    setCalendarState(prev => ({
      ...prev,
      selectedTask: task,
      isPanelOpen: true
    }));
  }, []);

  const closeTaskDetail = useCallback(() => {
    setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, []);

  return {
    calendarState,
    handlePrevious,
    handleNext,
    handleToday,
    openTaskDetail,
    closeTaskDetail,
  };
};
