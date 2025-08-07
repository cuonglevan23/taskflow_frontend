import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export interface LayoutOptions {
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  nodeWidth: number;
  nodeHeight: number;
  rankSep: number;
  nodeSep: number;
  align?: 'UL' | 'UR' | 'DL' | 'DR';
}

const defaultLayoutOptions: LayoutOptions = {
  direction: 'LR',
  nodeWidth: 300,
  nodeHeight: 200,
  rankSep: 100,
  nodeSep: 50,
  align: 'UL'
};

export const layoutNodes = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'BT' | 'LR' | 'RL' = 'LR',
  options?: Partial<LayoutOptions>
): { nodes: Node[]; edges: Edge[] } => {
  const layoutOpts = { ...defaultLayoutOptions, direction, ...options };
  
  dagreGraph.setGraph({
    rankdir: layoutOpts.direction,
    ranksep: layoutOpts.rankSep,
    nodesep: layoutOpts.nodeSep,
    align: layoutOpts.align
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: layoutOpts.nodeWidth, 
      height: layoutOpts.nodeHeight 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      targetPosition: getTargetPosition(layoutOpts.direction),
      sourcePosition: getSourcePosition(layoutOpts.direction),
      position: {
        x: nodeWithPosition.x - layoutOpts.nodeWidth / 2,
        y: nodeWithPosition.y - layoutOpts.nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const layoutNodesBySection = (
  nodes: Node[],
  edges: Edge[],
  sections: { id: string; title: string }[],
  options?: Partial<LayoutOptions>
): { nodes: Node[]; edges: Edge[] } => {
  const layoutOpts = { ...defaultLayoutOptions, ...options };
  const sectionSpacing = 400;
  const nodeSpacing = 320;

  const layoutedNodes = nodes.map((node, index) => {
    const taskData = (node as any).data?.task;
    const sectionIndex = sections.findIndex(s => s.id === taskData?.section) || 0;
    const nodesInSection = nodes.filter(n => (n as any).data?.task?.section === taskData?.section);
    const nodeIndexInSection = nodesInSection.findIndex(n => n.id === node.id);

    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: nodeIndexInSection * nodeSpacing,
        y: sectionIndex * sectionSpacing,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const autoLayoutByDependencies = (
  nodes: Node[],
  edges: Edge[],
  options?: Partial<LayoutOptions>
): { nodes: Node[]; edges: Edge[] } => {
  // This creates a hierarchical layout based on dependencies
  // Tasks with no dependencies are placed on the left
  // Dependent tasks are placed to the right in dependency order
  
  const layoutOpts = { ...defaultLayoutOptions, ...options };
  
  // Build dependency map
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

  // Calculate levels (how far from root nodes)
  const levels = new Map<string, number>();
  
  const calculateLevel = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0; // Circular dependency protection
    if (levels.has(nodeId)) return levels.get(nodeId)!;
    
    visited.add(nodeId);
    const dependencies = dependencyMap.get(nodeId) || [];
    
    if (dependencies.length === 0) {
      levels.set(nodeId, 0);
      return 0;
    }
    
    const maxLevel = Math.max(...dependencies.map(depId => calculateLevel(depId, visited)));
    const nodeLevel = maxLevel + 1;
    levels.set(nodeId, nodeLevel);
    
    return nodeLevel;
  };

  // Calculate levels for all nodes
  nodes.forEach(node => calculateLevel(node.id));

  // Group nodes by level
  const nodesByLevel = new Map<number, Node[]>();
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });

  // Position nodes
  const layoutedNodes = nodes.map(node => {
    const level = levels.get(node.id) || 0;
    const nodesAtLevel = nodesByLevel.get(level) || [];
    const nodeIndex = nodesAtLevel.findIndex(n => n.id === node.id);
    
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: level * (layoutOpts.nodeWidth + layoutOpts.rankSep),
        y: nodeIndex * (layoutOpts.nodeHeight + layoutOpts.nodeSep),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Helper functions
const getTargetPosition = (direction: string): Position => {
  switch (direction) {
    case 'TB': return Position.Top;
    case 'BT': return Position.Bottom;
    case 'LR': return Position.Left;
    case 'RL': return Position.Right;
    default: return Position.Left;
  }
};

const getSourcePosition = (direction: string): Position => {
  switch (direction) {
    case 'TB': return Position.Bottom;
    case 'BT': return Position.Top;
    case 'LR': return Position.Right;
    case 'RL': return Position.Left;
    default: return Position.Right;
  }
};

export const calculateCriticalPath = (
  nodes: Node[],
  edges: Edge[]
): string[] => {
  // Simplified critical path calculation
  // In a real implementation, you'd use more sophisticated algorithms
  
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const dependentMap = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!dependentMap.has(edge.source)) {
      dependentMap.set(edge.source, []);
    }
    dependentMap.get(edge.source)!.push(edge.target);
  });

  // Find end nodes (nodes with no dependents)
  const endNodes = nodes.filter(node => !dependentMap.has(node.id));
  
  if (endNodes.length === 0) return [];
  
  // For now, return the longest path from start to end
  // This is a simplified version
  const visited = new Set<string>();
  const longestPath: string[] = [];
  
  const findLongestPath = (nodeId: string, currentPath: string[]): string[] => {
    if (visited.has(nodeId)) return currentPath;
    
    visited.add(nodeId);
    const dependents = dependentMap.get(nodeId) || [];
    
    if (dependents.length === 0) {
      return [...currentPath, nodeId];
    }
    
    let longest = [...currentPath, nodeId];
    dependents.forEach(depId => {
      const path = findLongestPath(depId, [...currentPath, nodeId]);
      if (path.length > longest.length) {
        longest = path;
      }
    });
    
    return longest;
  };

  // Find nodes with no dependencies (start nodes)
  const startNodes = nodes.filter(node => {
    return !edges.some(edge => edge.target === node.id);
  });
  
  startNodes.forEach(startNode => {
    visited.clear();
    const path = findLongestPath(startNode.id, []);
    if (path.length > longestPath.length) {
      longestPath.length = 0;
      longestPath.push(...path);
    }
  });
  
  return longestPath;
};