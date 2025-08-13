import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  Panel,
  Node,
  Edge,
  ConnectionMode,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

import TaskNode from './components/TaskNode';
import DependencyEdge from './components/DependencyEdge';
import { useReactFlowWorkflow } from './hooks/useReactFlowWorkflow';
import { WorkflowTask, WorkflowSection } from './types';
import { useTheme } from '@/layouts/hooks/useTheme';
import { 
  LayoutHorizontal, 
  Maximize2, 
  GitBranch, 
  Play, 
  Square,
  RotateCcw 
} from 'lucide-react';

// Register custom node and edge types
const nodeTypes = {
  taskNode: TaskNode,
};

const edgeTypes = {
  dependencyEdge: DependencyEdge,
};

interface ReactFlowWorkflowProps {
  tasks: WorkflowTask[];
  sections: WorkflowSection[];
  onTaskUpdate?: (taskId: string, updates: Partial<WorkflowTask>) => void;
  onTaskClick?: (task: WorkflowTask) => void;
  onDependencyChange?: (dependencies: { fromTaskId: string; toTaskId: string; type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish' }[]) => void;
  className?: string;
  height?: string;
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  initialLayout?: 'auto' | 'manual';
}

function ReactFlowWorkflowComponent({
  tasks,
  sections,
  onTaskUpdate,
  onTaskClick,
  onDependencyChange,
  className = '',
  height = '600px',
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  initialLayout = 'auto'
}: ReactFlowWorkflowProps) => {
  const { theme } = useTheme();
  
  const workflow = useReactFlowWorkflow({
    tasks,
    sections,
    onTaskUpdate,
    onTaskClick,
    onDependencyChange,
    initialLayout
  });

  const handleLayoutHorizontal = useCallback(() => {
    workflow.autoLayout('LR');
  }, [workflow]);

  const handleLayoutVertical = useCallback(() => {
    workflow.autoLayout('TB');
  }, [workflow]);

  const handleFitView = useCallback(() => {
    // This will be handled by React Flow's fitView function
  }, []);

  const backgroundStyle = useMemo(() => ({
    backgroundColor: theme.background.primary,
  }), [theme]);

  return (
    <div 
      className={`react-flow-workflow relative ${className}`} 
      style={{ height, ...backgroundStyle }}
    >
      <ReactFlow
        nodes={workflow.nodes}
        edges={workflow.edges}
        onNodesChange={workflow.onNodesChange}
        onEdgesChange={workflow.onEdgesChange}
        onConnect={workflow.onConnect}
        onNodeClick={workflow.onNodeClick}
        onEdgeClick={workflow.onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        {/* Background */}
        {showBackground && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={theme.border.default}
          />
        )}

        {/* Controls */}
        {showControls && (
          <Controls
            style={{
              backgroundColor: theme.background.secondary,
              border: `1px solid ${theme.border.default}`,
              borderRadius: '8px'
            }}
          />
        )}

        {/* Mini Map */}
        {showMiniMap && (
          <MiniMap
            style={{
              backgroundColor: theme.background.secondary,
              border: `1px solid ${theme.border.default}`,
              borderRadius: '8px'
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            nodeColor={theme.text.secondary}
            nodeStrokeWidth={2}
            zoomable
            pannable
          />
        )}

        {/* Control Panel */}
        <Panel position="top-right" className="flex flex-col gap-2">
          <div 
            className="bg-white rounded-lg shadow-sm border p-2 flex flex-col gap-1"
            style={{ 
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default 
            }}
          >
            {/* Layout Controls */}
            <div className="flex gap-1">
              <button
                onClick={handleLayoutHorizontal}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Horizontal Layout"
                style={{ color: theme.text.secondary }}
              >
                <LayoutHorizontal className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleLayoutVertical}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Vertical Layout"
                style={{ color: theme.text.secondary }}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleFitView}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Fit to View"
                style={{ color: theme.text.secondary }}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Status */}
            {workflow.isConnecting && (
              <div 
                className="text-xs px-2 py-1 rounded text-center"
                style={{ 
                  backgroundColor: '#3B82F620',
                  color: '#3B82F6' 
                }}
              >
                Connecting from task...
              </div>
            )}

            {/* Selected Info */}
            {workflow.selectedNodeId && (
              <div 
                className="text-xs px-2 py-1 rounded"
                style={{ 
                  backgroundColor: theme.background.tertiary,
                  color: theme.text.secondary 
                }}
              >
                Task selected
              </div>
            )}

            {workflow.selectedEdgeId && (
              <div 
                className="text-xs px-2 py-1 rounded"
                style={{ 
                  backgroundColor: theme.background.tertiary,
                  color: theme.text.secondary 
                }}
              >
                Dependency selected
              </div>
            )}
          </div>

          {/* Workflow Stats */}
          <div 
            className="bg-white rounded-lg shadow-sm border p-3 text-xs"
            style={{ 
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default 
            }}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span style={{ color: theme.text.secondary }}>Tasks:</span>
                <span style={{ color: theme.text.primary }}>{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: theme.text.secondary }}>Dependencies:</span>
                <span style={{ color: theme.text.primary }}>{workflow.edges.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: theme.text.secondary }}>Sections:</span>
                <span style={{ color: theme.text.primary }}>{sections.length}</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Global Styles */}
      <style jsx global>{`
        .react-flow__node {
          font-family: inherit;
        }
        
        .react-flow__edge {
          font-family: inherit;
        }
        
        .react-flow__controls {
          font-family: inherit;
        }
        
        .react-flow__attribution {
          font-family: inherit;
          font-size: 10px;
          color: ${theme.text.secondary};
        }
        
        .react-flow__minimap {
          font-family: inherit;
        }
        
        .react-flow__handle {
          width: 12px;
          height: 12px;
          border-width: 2px;
        }
        
        .react-flow__handle-connecting {
          background: #3B82F6;
        }
        
        .react-flow__handle-valid {
          background: #10B981;
        }
        
        .react-flow__edge.selected {
          z-index: 10;
        }
        
        .react-flow__node.selected {
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

// Wrapper with ReactFlowProvider
export default function ReactFlowWorkflow(props: ReactFlowWorkflowProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowWorkflowComponent {...props} />
    </ReactFlowProvider>
  );
};

export default ReactFlowWorkflow;