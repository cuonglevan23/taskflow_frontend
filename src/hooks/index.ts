// Custom Hooks - Senior Product Code
export { useProjects, PROJECT_COLORS } from './useProjects';
export { usePortfolios, PORTFOLIO_COLORS } from './usePortfolios';
export { useTasks } from './useTasks';

// Type Exports
export type { 
  Project, 
  ProjectColorKey 
} from './useProjects';

export type { 
  Portfolio, 
  PortfolioColorKey 
} from './usePortfolios';

export type { 
  Task, 
  AssignedTask, 
  Goal 
} from './useTasks';