import { useState } from 'react';
import { TaskEditState } from '../types';

export const useTaskEditState = (initialTaskName: string) => {
  const [editState, setEditState] = useState<TaskEditState>({
    isEditing: false,
    editValue: initialTaskName,
    showDatePicker: false,
    selectedDate: null,
    showAssigneeInput: false,
    assigneeInputValue: '',
    showUserSuggestions: false,
    showProjectInput: false,
    projectInputValue: '',
    showProjectSuggestions: false,
  });

  const updateEditState = (updates: Partial<TaskEditState>) => {
    setEditState(prev => ({ ...prev, ...updates }));
  };

  const resetEditState = () => {
    setEditState(prev => ({
      ...prev,
      isEditing: false,
      showDatePicker: false,
      showAssigneeInput: false,
      assigneeInputValue: '',
      showUserSuggestions: false,
      showProjectInput: false,
      projectInputValue: '',
      showProjectSuggestions: false,
    }));
  };

  const startEditing = () => {
    updateEditState({ isEditing: true, editValue: initialTaskName });
  };

  const stopEditing = () => {
    updateEditState({ isEditing: false });
  };

  return {
    editState,
    updateEditState,
    resetEditState,
    startEditing,
    stopEditing,
  };
};