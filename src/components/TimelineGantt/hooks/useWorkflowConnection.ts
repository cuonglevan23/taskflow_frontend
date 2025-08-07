import { useState, useCallback, useRef, useEffect } from 'react';
import { GanttTask } from '../TimelineGantt';

export interface TaskConnection {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag?: number; // Days
  createdAt: Date;
  updatedAt: Date;
  // Store exact dot positions for precise line rendering
  fromPosition?: ConnectionPoint;
  toPosition?: ConnectionPoint;
}

export interface ConnectionPoint {
  x: number;
  y: number;
  taskId: string;
}

export interface WorkflowConnectionState {
  isConnecting: boolean;
  connectingFromTaskId: string | null;
  connectingFromPosition: ConnectionPoint | null;
  mousePosition: { x: number; y: number };
  connections: TaskConnection[];
  error: string | null;
  isLoading: boolean;
}

export interface WorkflowConnectionConfig {
  allowSelfConnection?: boolean;
  allowCircularDependencies?: boolean;
  maxConnectionsPerTask?: number;
  validateConnection?: (from: GanttTask, to: GanttTask) => Promise<{ valid: boolean; error?: string }>;
  onConnectionCreate?: (connection: TaskConnection) => Promise<void>;
  onConnectionDelete?: (connectionId: string) => Promise<void>;
  onConnectionUpdate?: (connectionId: string, updates: Partial<TaskConnection>) => Promise<void>;
}

interface UseWorkflowConnectionProps {
  tasks: GanttTask[];
  initialConnections?: TaskConnection[];
  config?: WorkflowConnectionConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useWorkflowConnection = ({
  tasks,
  initialConnections = [],
  config = {},
  containerRef
}: UseWorkflowConnectionProps) => {
  // State management
  const [state, setState] = useState<WorkflowConnectionState>({
    isConnecting: false,
    connectingFromTaskId: null,
    connectingFromPosition: null,
    mousePosition: { x: 0, y: 0 },
    connections: initialConnections,
    error: null,
    isLoading: false
  });

  // Update connections when initialConnections prop changes
  useEffect(() => {
    console.log('🔄 useWorkflowConnection - initialConnections changed:', initialConnections.length);
    setState(prev => ({
      ...prev,
      connections: initialConnections
    }));
  }, [initialConnections]);

  // Configuration with defaults
  const connectionConfig: Required<WorkflowConnectionConfig> = {
    allowSelfConnection: false,
    allowCircularDependencies: false,
    maxConnectionsPerTask: 10,
    validateConnection: async () => ({ valid: true }),
    onConnectionCreate: async () => {},
    onConnectionDelete: async () => {},
    onConnectionUpdate: async () => {},
    ...config
  };

  // Task lookup for performance
  const taskMap = useRef(new Map<string, GanttTask>());
  useEffect(() => {
    taskMap.current = new Map(tasks.map(task => [task.id, task]));
  }, [tasks]);

  // Error handling
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
    if (error) {
      console.error('Workflow Connection Error:', error);
    }
  }, []);

  // Clear error after delay
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, setError]);

  // Validation functions
  const validateConnectionCreation = useCallback(async (
    fromTaskId: string, 
    toTaskId: string
  ): Promise<{ valid: boolean; error?: string }> => {
    const fromTask = taskMap.current.get(fromTaskId);
    const toTask = taskMap.current.get(toTaskId);

    if (!fromTask || !toTask) {
      return { valid: false, error: 'One or both tasks not found' };
    }

    // Self connection check
    if (!connectionConfig.allowSelfConnection && fromTaskId === toTaskId) {
      return { valid: false, error: 'Cannot connect task to itself' };
    }

    // Duplicate connection check
    const existingConnection = state.connections.find(
      conn => conn.fromTaskId === fromTaskId && conn.toTaskId === toTaskId
    );
    if (existingConnection) {
      return { valid: false, error: 'Connection already exists' };
    }

    // Max connections check
    const connectionsFromTask = state.connections.filter(conn => conn.fromTaskId === fromTaskId);
    if (connectionsFromTask.length >= connectionConfig.maxConnectionsPerTask) {
      return { valid: false, error: `Maximum ${connectionConfig.maxConnectionsPerTask} connections per task` };
    }

    // Circular dependency check
    if (!connectionConfig.allowCircularDependencies) {
      const wouldCreateCycle = checkForCircularDependency(fromTaskId, toTaskId, state.connections);
      if (wouldCreateCycle) {
        return { valid: false, error: 'Would create circular dependency' };
      }
    }

    // Custom validation
    return await connectionConfig.validateConnection(fromTask, toTask);
  }, [state.connections, connectionConfig]);

  // Circular dependency detection
  const checkForCircularDependency = useCallback((
    fromTaskId: string,
    toTaskId: string,
    connections: TaskConnection[]
  ): boolean => {
    const graph = new Map<string, string[]>();
    
    // Build adjacency list including the potential new connection
    [...connections, { fromTaskId, toTaskId } as TaskConnection].forEach(conn => {
      if (!graph.has(conn.fromTaskId)) {
        graph.set(conn.fromTaskId, []);
      }
      graph.get(conn.fromTaskId)!.push(conn.toTaskId);
    });

    // DFS cycle detection
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return Array.from(graph.keys()).some(nodeId => 
      !visited.has(nodeId) && hasCycle(nodeId)
    );
  }, []);

  // Connection management
  const startConnection = useCallback((fromTaskId: string, position: ConnectionPoint) => {
    if (state.isLoading) return;

    setState(prev => ({
      ...prev,
      isConnecting: true,
      connectingFromTaskId: fromTaskId,
      connectingFromPosition: position,
      error: null
    }));
  }, [state.isLoading]);

  const finishConnection = useCallback(async (toTaskId: string, toPosition?: ConnectionPoint) => {
    if (!state.isConnecting || !state.connectingFromTaskId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Validate connection
      const validation = await validateConnectionCreation(state.connectingFromTaskId, toTaskId);
      if (!validation.valid) {
        setError(validation.error || 'Invalid connection');
        return;
      }

      // Create connection with exact dot positions
      const newConnection: TaskConnection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromTaskId: state.connectingFromTaskId,
        toTaskId,
        type: 'finish-to-start',
        createdAt: new Date(),
        updatedAt: new Date(),
        fromPosition: state.connectingFromPosition || undefined,
        toPosition: toPosition || undefined
      };

      // Call external handler
      await connectionConfig.onConnectionCreate(newConnection);

      // Update state
      setState(prev => ({
        ...prev,
        connections: [...prev.connections, newConnection],
        isConnecting: false,
        connectingFromTaskId: null,
        connectingFromPosition: null,
        isLoading: false
      }));

      // Force re-render to update connection lines
      setTimeout(() => {
        // Trigger a small state update to force re-render of connection lines
        setState(prev => ({ ...prev, mousePosition: { x: 0, y: 0 } }));
      }, 100);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create connection');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isConnecting, state.connectingFromTaskId, state.connectingFromPosition, validateConnectionCreation, connectionConfig, setError]);

  const cancelConnection = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnecting: false,
      connectingFromTaskId: null,
      connectingFromPosition: null,
      error: null
    }));
  }, []);

  const deleteConnection = useCallback(async (connectionId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await connectionConfig.onConnectionDelete(connectionId);
      
      setState(prev => ({
        ...prev,
        connections: prev.connections.filter(conn => conn.id !== connectionId),
        isLoading: false
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete connection');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [connectionConfig, setError]);

  const updateConnection = useCallback(async (
    connectionId: string, 
    updates: Partial<TaskConnection>
  ) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await connectionConfig.onConnectionUpdate(connectionId, updates);
      
      setState(prev => ({
        ...prev,
        connections: prev.connections.map(conn =>
          conn.id === connectionId 
            ? { ...conn, ...updates, updatedAt: new Date() }
            : conn
        ),
        isLoading: false
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update connection');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [connectionConfig, setError]);

  // Mouse tracking for connecting line
  const updateMousePosition = useCallback((x: number, y: number) => {
    setState(prev => ({ ...prev, mousePosition: { x, y } }));
  }, []);

  // Utility functions
  const getConnectionsForTask = useCallback((taskId: string) => {
    return {
      incoming: state.connections.filter(conn => conn.toTaskId === taskId),
      outgoing: state.connections.filter(conn => conn.fromTaskId === taskId)
    };
  }, [state.connections]);

  const getTaskById = useCallback((taskId: string) => {
    return taskMap.current.get(taskId) || null;
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    startConnection,
    finishConnection,
    cancelConnection,
    deleteConnection,
    updateConnection,
    updateMousePosition,
    clearError: () => setError(null),
    
    // Utilities
    getConnectionsForTask,
    getTaskById,
    
    // Configuration
    config: connectionConfig
  };
};