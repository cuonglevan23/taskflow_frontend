import { Edge } from 'reactflow';
import { WorkflowTask, DependencyType } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export const validateDependency = (
  sourceTaskId: string,
  targetTaskId: string,
  tasks: WorkflowTask[]
): ValidationResult => {
  // Check if tasks exist
  const sourceTask = tasks.find(t => t.id === sourceTaskId);
  const targetTask = tasks.find(t => t.id === targetTaskId);

  if (!sourceTask) {
    return { valid: false, error: 'Source task not found' };
  }

  if (!targetTask) {
    return { valid: false, error: 'Target task not found' };
  }

  // Check for self-dependency
  if (sourceTaskId === targetTaskId) {
    return { valid: false, error: 'Task cannot depend on itself' };
  }

  // Check for date logic issues
  const warnings: string[] = [];
  
  if (sourceTask.endDate > targetTask.startDate) {
    warnings.push('Source task ends after target task starts - may cause scheduling conflicts');
  }

  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
};

export const detectCycles = (edges: Edge[]): boolean => {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, []);
    }
    graph.get(edge.source)!.push(edge.target);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycleDFS = (nodeId: string): boolean => {
    if (recursionStack.has(nodeId)) {
      return true; // Cycle detected
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (hasCycleDFS(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Check for cycles starting from any unvisited node
  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      if (hasCycleDFS(nodeId)) {
        return true;
      }
    }
  }

  return false;
};

export const validateWorkflowIntegrity = (
  tasks: WorkflowTask[],
  edges: Edge[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for cycles
  if (detectCycles(edges)) {
    errors.push('Workflow contains circular dependencies');
  }

  // Check for orphaned tasks (tasks with dependencies that don't exist)
  tasks.forEach(task => {
    task.dependencies?.forEach(depId => {
      const depExists = tasks.some(t => t.id === depId);
      if (!depExists) {
        errors.push(`Task "${task.title}" depends on non-existent task: ${depId}`);
      }
    });
  });

  // Check for edge consistency with task dependencies
  const edgeDependencies = new Set(edges.map(e => `${e.source}-${e.target}`));
  const taskDependencies = new Set<string>();
  
  tasks.forEach(task => {
    task.dependencies?.forEach(depId => {
      taskDependencies.add(`${depId}-${task.id}`);
    });
  });

  // Find inconsistencies
  for (const edgeDep of edgeDependencies) {
    if (!taskDependencies.has(edgeDep)) {
      warnings.push(`Edge exists but not reflected in task dependencies: ${edgeDep}`);
    }
  }

  for (const taskDep of taskDependencies) {
    if (!edgeDependencies.has(taskDep)) {
      warnings.push(`Task dependency exists but no edge found: ${taskDep}`);
    }
  }

  // Check for scheduling conflicts
  edges.forEach(edge => {
    const sourceTask = tasks.find(t => t.id === edge.source);
    const targetTask = tasks.find(t => t.id === edge.target);
    
    if (sourceTask && targetTask) {
      const edgeData = edge.data as any;
      const depType = edgeData?.dependencyType || 'finish-to-start';
      
      if (depType === 'finish-to-start' && sourceTask.endDate > targetTask.startDate) {
        warnings.push(`Scheduling conflict: "${sourceTask.title}" ends after "${targetTask.title}" starts`);
      }
      
      if (depType === 'start-to-start' && sourceTask.startDate > targetTask.startDate) {
        warnings.push(`Scheduling conflict: "${sourceTask.title}" starts after "${targetTask.title}" starts`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

export const calculateEarliestStartDate = (
  task: WorkflowTask,
  dependencies: WorkflowTask[],
  dependencyType: DependencyType = 'finish-to-start',
  lag: number = 0
): Date => {
  if (dependencies.length === 0) {
    return task.startDate;
  }

  let earliestDate = new Date(task.startDate);

  dependencies.forEach(depTask => {
    let constraintDate: Date;

    switch (dependencyType) {
      case 'finish-to-start':
        constraintDate = new Date(depTask.endDate);
        break;
      case 'start-to-start':
        constraintDate = new Date(depTask.startDate);
        break;
      case 'finish-to-finish':
        // Calculate when this task must start to finish when dependency finishes
        constraintDate = new Date(depTask.endDate.getTime() - (task.duration * 24 * 60 * 60 * 1000));
        break;
      case 'start-to-finish':
        // Calculate when this task must start to finish when dependency starts
        constraintDate = new Date(depTask.startDate.getTime() - (task.duration * 24 * 60 * 60 * 1000));
        break;
      default:
        constraintDate = new Date(depTask.endDate);
    }

    // Apply lag
    if (lag !== 0) {
      constraintDate.setDate(constraintDate.getDate() + lag);
    }

    if (constraintDate > earliestDate) {
      earliestDate = constraintDate;
    }
  });

  return earliestDate;
};

export const calculateLatestFinishDate = (
  task: WorkflowTask,
  dependents: WorkflowTask[],
  dependencyType: DependencyType = 'finish-to-start',
  lag: number = 0
): Date => {
  if (dependents.length === 0) {
    return task.endDate;
  }

  let latestDate = new Date(task.endDate);

  dependents.forEach(depTask => {
    let constraintDate: Date;

    switch (dependencyType) {
      case 'finish-to-start':
        constraintDate = new Date(depTask.startDate);
        break;
      case 'start-to-start':
        // This task must finish before the dependent can start
        constraintDate = new Date(depTask.startDate.getTime() + (task.duration * 24 * 60 * 60 * 1000));
        break;
      case 'finish-to-finish':
        constraintDate = new Date(depTask.endDate);
        break;
      case 'start-to-finish':
        constraintDate = new Date(depTask.endDate.getTime() + (task.duration * 24 * 60 * 60 * 1000));
        break;
      default:
        constraintDate = new Date(depTask.startDate);
    }

    // Apply lag
    if (lag !== 0) {
      constraintDate.setDate(constraintDate.getDate() - lag);
    }

    if (constraintDate < latestDate) {
      latestDate = constraintDate;
    }
  });

  return latestDate;
};

export const calculateSlack = (
  task: WorkflowTask,
  dependencies: WorkflowTask[],
  dependents: WorkflowTask[]
): number => {
  const earliestStart = calculateEarliestStartDate(task, dependencies);
  const latestFinish = calculateLatestFinishDate(task, dependents);
  
  const earliestFinish = new Date(earliestStart.getTime() + (task.duration * 24 * 60 * 60 * 1000));
  
  // Slack is the difference between latest finish and earliest finish (in days)
  const slackMs = latestFinish.getTime() - earliestFinish.getTime();
  return Math.floor(slackMs / (24 * 60 * 60 * 1000));
};

export const findCriticalPath = (
  tasks: WorkflowTask[],
  edges: Edge[]
): string[] => {
  // Build dependency maps
  const dependencyMap = new Map<string, string[]>();
  const dependentMap = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!dependencyMap.has(edge.target)) {
      dependencyMap.set(edge.target, []);
    }
    dependencyMap.get(edge.target)!.push(edge.source);
    
    if (!dependentMap.has(edge.source)) {
      dependentMap.set(edge.source, []);
    }
    dependentMap.get(edge.source)!.push(edge.target);
  });

  // Calculate slack for each task
  const taskSlacks = new Map<string, number>();
  
  tasks.forEach(task => {
    const deps = dependencyMap.get(task.id)?.map(id => tasks.find(t => t.id === id)!).filter(Boolean) || [];
    const dependents = dependentMap.get(task.id)?.map(id => tasks.find(t => t.id === id)!).filter(Boolean) || [];
    
    const slack = calculateSlack(task, deps, dependents);
    taskSlacks.set(task.id, slack);
  });

  // Critical path consists of tasks with zero slack
  const criticalTasks = tasks.filter(task => (taskSlacks.get(task.id) || 0) <= 0);
  
  // Sort by start date to get proper order
  criticalTasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  return criticalTasks.map(task => task.id);
};