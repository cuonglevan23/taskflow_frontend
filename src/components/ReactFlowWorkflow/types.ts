import { Node, Edge } from 'reactflow';

export interface TaskNode extends Node {
  type: 'taskNode';
  data: {
    task: WorkflowTask;
    onTaskClick?: (task: WorkflowTask) => void;
    onTaskUpdate?: (taskId: string, updates: Partial<WorkflowTask>) => void;
    isSelected?: boolean;
    isConnecting?: boolean;
  };
}

export interface DependencyEdge extends Edge {
  type: 'dependencyEdge';
  data?: {
    dependencyType: DependencyType;
    lag?: number; // Days
    onEdgeUpdate?: (edgeId: string, updates: Partial<DependencyEdge>) => void;
    onEdgeDelete?: (edgeId: string) => void;
  };
}

export interface WorkflowTask {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  duration: number; // Days
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  assignees: TaskAssignee[];
  section: string;
  dependencies?: string[]; // Task IDs this task depends on
  color?: string;
  icon?: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

export interface WorkflowSection {
  id: string;
  title: string;
  color: string;
  collapsed: boolean;
  position: { x: number; y: number };
}

export interface WorkflowViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface WorkflowLayoutOptions {
  direction: 'horizontal' | 'vertical';
  spacing: {
    x: number;
    y: number;
  };
  align: 'start' | 'center' | 'end';
  rankSep: number;
  nodeSep: number;
}

export interface WorkflowState {
  nodes: TaskNode[];
  edges: DependencyEdge[];
  sections: WorkflowSection[];
  viewport: WorkflowViewport;
  layout: WorkflowLayoutOptions;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  isConnecting: boolean;
  connectingFrom?: string;
}