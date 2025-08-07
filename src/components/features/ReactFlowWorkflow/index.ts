export { default } from './ReactFlowWorkflow';
export { default as ReactFlowWorkflow } from './ReactFlowWorkflow';

// Components
export { default as TaskNode } from './components/TaskNode';
export { default as DependencyEdge } from './components/DependencyEdge';

// Hooks
export { useReactFlowWorkflow } from './hooks/useReactFlowWorkflow';

// Types
export type {
  TaskNode as TaskNodeType,
  DependencyEdge as DependencyEdgeType,
  WorkflowTask,
  TaskAssignee,
  DependencyType,
  WorkflowSection,
  WorkflowViewport,
  WorkflowLayoutOptions,
  WorkflowState
} from './types';

// Utilities
export {
  layoutNodes,
  layoutNodesBySection,
  autoLayoutByDependencies,
  calculateCriticalPath
} from './utils/layoutUtils';

export {
  validateDependency,
  detectCycles,
  validateWorkflowIntegrity,
  calculateEarliestStartDate,
  calculateLatestFinishDate,
  calculateSlack,
  findCriticalPath
} from './utils/validationUtils';

export type { ValidationResult } from './utils/validationUtils';
export type { LayoutOptions } from './utils/layoutUtils';