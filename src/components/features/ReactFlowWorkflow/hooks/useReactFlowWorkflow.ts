import { useCallback, useState, useMemo, useEffect } from 'react';
import { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  MarkerType
} from 'reactflow';
import { TaskNode, DependencyEdge, WorkflowTask, WorkflowSection, DependencyType } from '../types';
import { layoutNodes } from '../utils/layoutUtils';
import { validateDependency, detectCycles } from '../utils/validationUtils';

interface UseReactFlowWorkflowProps {
  tasks: WorkflowTask[];
  sections: WorkflowSection[];
  onTaskUpdate?: (taskId: string, updates: Partial<WorkflowTask>) => void;
  onTaskClick?: (task: WorkflowTask) => void;
  onDependencyChange?: (dependencies: { fromTaskId: string; toTaskId: string; type: DependencyType }[]) => void;
  initialLayout?: 'auto' | 'manual';
}

export const useReactFlowWorkflow = ({
  tasks,
  sections,
  onTaskUpdate,
  onTaskClick,
  onDependencyChange,
  initialLayout = 'auto'
}: UseReactFlowWorkflowProps) => {
  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Convert tasks to React Flow nodes
  const initialNodes: TaskNode[] = useMemo(() => {
    return tasks.map((task, index) => {
      const section = sections.find(s => s.id === task.section);
      
      return {
        id: task.id,
        type: 'taskNode',
        position: initialLayout === 'auto' 
          ? { x: index * 300, y: (sections.findIndex(s => s.id === task.section) || 0) * 150 }
          : { x: 0, y: 0 },
        data: {
          task,
          onTaskClick,
          onTaskUpdate,
          isSelected: selectedNodeId === task.id,
          isConnecting: connectingFrom === task.id
        },
        style: {
          backgroundColor: task.color || section?.color || '#ffffff',
          border: selectedNodeId === task.id ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '0'
        }
      } as TaskNode;
    });
  }, [tasks, sections, selectedNodeId, connectingFrom, onTaskClick, onTaskUpdate, initialLayout]);

  // Convert dependencies to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    tasks.forEach(task => {
      task.dependencies?.forEach(depId => {
        const edge: Edge = {
          id: `${depId}-${task.id}`,
          source: depId,
          target: task.id,
          type: 'dependencyEdge',
          animated: false,
          style: { 
            stroke: '#6B7280',
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6B7280'
          },
          data: {
            dependencyType: 'finish-to-start' as DependencyType,
            onEdgeUpdate: handleEdgeUpdate,
            onEdgeDelete: handleEdgeDelete
          }
        };
        edges.push(edge);
      });
    });
    
    return edges;
  }, [tasks]);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when external data changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;

    // Validate connection
    const validation = validateDependency(connection.source, connection.target, tasks);
    if (!validation.valid) {
      console.warn('Invalid dependency:', validation.error);
      return;
    }

    // Check for cycles
    const wouldCreateCycle = detectCycles([...edges, {
      id: `${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target
    } as Edge]);

    if (wouldCreateCycle) {
      console.warn('Dependency would create a cycle');
      return;
    }

    const newEdge: Edge = {
      id: `${connection.source}-${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      type: 'dependencyEdge',
      animated: true,
      style: { 
        stroke: '#3B82F6',
        strokeWidth: 2
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3B82F6'
      },
      data: {
        dependencyType: 'finish-to-start' as DependencyType,
        onEdgeUpdate: handleEdgeUpdate,
        onEdgeDelete: handleEdgeDelete
      }
    };

    setEdges(eds => addEdge(newEdge, eds));
    
    // Notify parent component
    onDependencyChange?.([
      ...edges.map(e => ({ 
        fromTaskId: e.source, 
        toTaskId: e.target, 
        type: e.data?.dependencyType || 'finish-to-start' as DependencyType
      })),
      { 
        fromTaskId: connection.source, 
        toTaskId: connection.target, 
        type: 'finish-to-start' as DependencyType 
      }
    ]);

    setIsConnecting(false);
    setConnectingFrom(null);
  }, [edges, tasks, onDependencyChange]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    
    if (node.type === 'taskNode') {
      const taskNode = node as TaskNode;
      onTaskClick?.(taskNode.data.task);
    }
  }, [onTaskClick]);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  // Start connection mode
  const startConnection = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
    setSelectedNodeId(nodeId);
  }, []);

  // Cancel connection mode
  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectingFrom(null);
  }, []);

  // Handle edge updates
  function handleEdgeUpdate(edgeId: string, updates: Partial<Edge>) {
    setEdges(eds => eds.map(edge => 
      edge.id === edgeId ? { ...edge, ...updates } : edge
    ));
  }

  // Handle edge deletion
  function handleEdgeDelete(edgeId: string) {
    setEdges(eds => eds.filter(edge => edge.id !== edgeId));
    
    const remainingDependencies = edges
      .filter(e => e.id !== edgeId)
      .map(e => ({ 
        fromTaskId: e.source, 
        toTaskId: e.target, 
        type: e.data?.dependencyType || 'finish-to-start' as DependencyType
      }));
      
    onDependencyChange?.(remainingDependencies);
  }

  // Auto-layout nodes
  const autoLayout = useCallback((direction: 'TB' | 'LR' = 'LR') => {
    const layoutedElements = layoutNodes(nodes, edges, direction);
    setNodes(layoutedElements.nodes);
    setEdges(layoutedElements.edges);
  }, [nodes, edges, setNodes, setEdges]);

  // Get task by ID
  const getTaskById = useCallback((taskId: string): WorkflowTask | null => {
    return tasks.find(task => task.id === taskId) || null;
  }, [tasks]);

  // Get dependencies for a task
  const getTaskDependencies = useCallback((taskId: string): string[] => {
    return edges
      .filter(edge => edge.target === taskId)
      .map(edge => edge.source);
  }, [edges]);

  // Get dependents of a task
  const getTaskDependents = useCallback((taskId: string): string[] => {
    return edges
      .filter(edge => edge.source === taskId)
      .map(edge => edge.target);
  }, [edges]);

  return {
    // React Flow state
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onEdgeClick,

    // Selection state
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,

    // Connection state
    isConnecting,
    connectingFrom,
    startConnection,
    cancelConnection,

    // Utility functions
    autoLayout,
    getTaskById,
    getTaskDependencies,
    getTaskDependents,

    // Edge management
    handleEdgeUpdate,
    handleEdgeDelete
  };
};