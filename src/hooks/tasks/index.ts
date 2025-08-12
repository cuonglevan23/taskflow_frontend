// Task Hooks - Modular exports

// Re-export everything from individual hook files
export * from './useTasksData';
export * from './useTasksFilter';
export * from './useTasksActions';
export * from './useTasksStats';
export * from './useTasksUI';

// Import for backward compatibility aliases
import { 
  useTasksData, 
  useTaskData, 
  useTasksByProjectData,
  useMyTasksData,
  useMyTasksSummaryData 
} from './useTasksData';

// Backward compatibility - Combined hooks that mimic old behavior
export const useTasks = useTasksData;
export const useTask = useTaskData;
export const useTasksByProject = useTasksByProjectData;
export const useMyTasks = useMyTasksData;
export const useMyTasksSummary = useMyTasksSummaryData;