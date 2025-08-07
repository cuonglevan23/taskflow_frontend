import React, { useMemo, useState, useEffect } from 'react';
import { useWorkflowConnection, WorkflowConnectionConfig, TaskConnection } from '../hooks/useWorkflowConnection';
import { GanttTask } from '../TimelineGantt';
import { useTheme } from '@/layouts/hooks/useTheme';
import ConnectionLine from './ConnectionLine';

export interface WorkflowConnectionManagerProps {
  tasks: GanttTask[];
  initialConnections?: TaskConnection[];
  config?: WorkflowConnectionConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
  children: (connectionManager: ReturnType<typeof useWorkflowConnection> & {
    onConnectionClick: (taskId: string, type: 'source' | 'target', event: React.MouseEvent) => void;
  }) => React.ReactNode;
}

const WorkflowConnectionManager: React.FC<WorkflowConnectionManagerProps> = ({
  tasks,
  initialConnections,
  config,
  containerRef,
  children
}) => {
  const { theme } = useTheme();
  
  console.log('🔄 WorkflowConnectionManager props - initialConnections:', initialConnections?.length || 0);
  
  const connectionManager = useWorkflowConnection({
    tasks,
    initialConnections,
    config,
    containerRef
  });
  
  console.log('🔄 useWorkflowConnection returned connections:', connectionManager.connections.length);

  // Force re-render when connections change
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    console.log('🔄 Connections changed, forcing re-render');
    setRenderKey(prev => prev + 1);
  }, [connectionManager.connections.length]);

  // React-based connection click handler
  const handleConnectionClick = (taskId: string, type: 'source' | 'target', event: React.MouseEvent) => {
    if (!containerRef.current) return;

    // Calculate position relative to container
    const containerRect = containerRef.current.getBoundingClientRect();
    const target = event.currentTarget as HTMLElement;
    const targetRect = target.getBoundingClientRect();
    
    const position = {
      x: targetRect.left - containerRect.left + targetRect.width / 2,
      y: targetRect.top - containerRect.top + targetRect.height / 2,
      taskId: taskId
    };

    if (type === 'source') {
      connectionManager.startConnection(taskId, position);
    } else if (type === 'target' && connectionManager.isConnecting) {
      connectionManager.finishConnection(taskId, position);
    }
  };

  // Add delay state to wait for DOM elements
  const [domReady, setDomReady] = useState(false);
  
  useEffect(() => {
    // Wait for DOM elements to be rendered
    const checkDOMReady = () => {
      if (containerRef.current && connectionManager.connections.length > 0) {
        const taskElements = containerRef.current.querySelectorAll('[data-task-id]');
        console.log('🔍 DOM Check - task elements count:', taskElements.length);
        
        if (taskElements.length >= connectionManager.connections.length) {
          console.log('✅ DOM Ready - sufficient task elements found');
          setDomReady(true);
        } else {
          console.log('⏳ DOM Not Ready - waiting for more elements');
          // Retry after short delay
          setTimeout(checkDOMReady, 100);
        }
      }
    };
    
    if (connectionManager.connections.length > 0) {
      setTimeout(checkDOMReady, 200); // Initial delay to let TaskEventContent render
    }
  }, [connectionManager.connections.length, containerRef]);

  // Calculate connection positions using React patterns
  const connectionPositions = useMemo(() => {
    if (!domReady) {
      console.log('⏳ DOM not ready yet, skipping position calculation');
      return [];
    }
    
    console.log('🔗 Calculating positions for', connectionManager.connections.length, 'connections');
    console.log('🔗 Connections array:', connectionManager.connections);
    
    return connectionManager.connections.map(connection => {
      console.log('🔗 Processing connection:', connection.id, 'from:', connection.fromTaskId, 'to:', connection.toTaskId);
      
      const fromTask = connectionManager.getTaskById(connection.fromTaskId);
      const toTask = connectionManager.getTaskById(connection.toTaskId);
      
      if (!fromTask || !toTask || !containerRef.current) {
        console.log('❌ Missing task or container - fromTask:', !!fromTask, 'toTask:', !!toTask, 'container:', !!containerRef.current);
        return null;
      }

      // Use stored positions if available, otherwise calculate from task elements
      if (connection.fromPosition && connection.toPosition) {
        console.log('✅ Using stored positions for connection:', connection.id);
        return {
          connection,
          fromPoint: connection.fromPosition,
          toPoint: connection.toPosition
        };
      }

      // Fallback to task element positions with retry mechanism
      console.log('🔍 Looking for task elements with data-task-id:', connection.fromTaskId, 'and', connection.toTaskId);
      
      // Debug: List all elements with data-task-id in container
      const allTaskElements = containerRef.current.querySelectorAll('[data-task-id]');
      console.log('🔍 All task elements found:', Array.from(allTaskElements).map(el => el.getAttribute('data-task-id')));
      
      const fromElement = containerRef.current.querySelector(`[data-task-id="${connection.fromTaskId}"]`) as HTMLElement;
      const toElement = containerRef.current.querySelector(`[data-task-id="${connection.toTaskId}"]`) as HTMLElement;
      
      console.log('🔍 Found elements - fromElement:', !!fromElement, 'toElement:', !!toElement);
      
      if (!fromElement || !toElement) {
        console.log('❌ Elements not found, connection will not render');
        console.log('🔍 Available task IDs:', Array.from(allTaskElements).map(el => el.getAttribute('data-task-id')));
        return null;
      }
      
      // Calculate positions from actual connection dots, not task edges
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Find actual dot elements within tasks
      const fromSourceDot = fromElement.querySelector('[data-connection-type="source"]') as HTMLElement;
      const toTargetDot = toElement.querySelector('[data-connection-type="target"]') as HTMLElement;
      
      console.log('🔍 Dot search results - fromSourceDot:', !!fromSourceDot, 'toTargetDot:', !!toTargetDot);
      if (fromSourceDot) console.log('🟢 Source dot styles:', window.getComputedStyle(fromSourceDot).opacity, fromSourceDot.getBoundingClientRect());
      if (toTargetDot) console.log('🎯 Target dot styles:', window.getComputedStyle(toTargetDot).opacity, toTargetDot.getBoundingClientRect());
      
      let fromPoint: { x: number; y: number };
      let toPoint: { x: number; y: number };
      
      if (fromSourceDot && toTargetDot) {
        // Force visibility temporarily for accurate measurements
        const originalFromOpacity = fromSourceDot.style.opacity;
        const originalToOpacity = toTargetDot.style.opacity;
        
        fromSourceDot.style.opacity = '1';
        toTargetDot.style.opacity = '1';
        
        // Use actual dot positions
        const fromDotRect = fromSourceDot.getBoundingClientRect();
        const toDotRect = toTargetDot.getBoundingClientRect();
        
        // Restore original opacity
        fromSourceDot.style.opacity = originalFromOpacity;
        toTargetDot.style.opacity = originalToOpacity;
        
        fromPoint = {
          x: fromDotRect.left - containerRect.left + fromDotRect.width / 2,
          y: fromDotRect.top - containerRect.top + fromDotRect.height / 2
        };
        
        toPoint = {
          x: toDotRect.left - containerRect.left + toDotRect.width / 2,
          y: toDotRect.top - containerRect.top + toDotRect.height / 2
        };
        
        console.log('✅ Using actual dot positions:');
        console.log('   🟢 Source dot (green) position:', fromPoint, 'rect:', fromDotRect);
        console.log('   🎯 Target dot (blue) position:', toPoint, 'rect:', toDotRect);
      } else {
        // Fallback to task edges if dots not found
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        fromPoint = {
          x: fromRect.right - containerRect.left - 5,
          y: fromRect.top - containerRect.top + fromRect.height / 2
        };
        
        toPoint = {
          x: toRect.left - containerRect.left + 5,
          y: toRect.top - containerRect.top + toRect.height / 2
        };
        
        console.log('⚠️ Using fallback task edge positions - from:', fromPoint, 'to:', toPoint);
        console.log('   Missing dots - fromSourceDot:', !!fromSourceDot, 'toTargetDot:', !!toTargetDot);
      }
      
      console.log('📍 Calculated positions - from:', fromPoint, 'to:', toPoint);
      
      return {
        connection,
        fromPoint,
        toPoint
      };
    }).filter(Boolean);
  }, [connectionManager.connections, tasks, connectionManager.connections.length, renderKey, domReady]);

  // Mouse tracking setup
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!connectionManager.isConnecting || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      connectionManager.updateMousePosition(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    };

    const handleMouseUp = () => {
      if (connectionManager.isConnecting) {
        connectionManager.cancelConnection();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectionManager.isConnecting) {
        connectionManager.cancelConnection();
      }
    };

    if (connectionManager.isConnecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [connectionManager, containerRef]);

  return (
    <>
      {children({
        ...connectionManager,
        onConnectionClick: handleConnectionClick
      })}

      {/* Connection Lines Overlay - Ensure proper positioning relative to timeline container */}
      <div 
        className="absolute inset-0 z-40"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0, 
          bottom: 0,
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <svg 
          width="100%" 
          height="100%" 
          className="absolute inset-0"
          style={{ 
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'visible'
          }}
        >
          <defs>
            {/* Arrow markers for different connection types */}
            <marker
              id="workflow-arrow"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#3B82F6"
              />
            </marker>
            
            <marker
              id="connection-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill="#10B981"
              />
            </marker>
          </defs>
          
          {/* Render existing connections using React components */}
          {connectionPositions.map(({ connection, fromPoint, toPoint }) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              fromPoint={fromPoint}
              toPoint={toPoint}
              onDelete={connectionManager.deleteConnection}
            />
          ))}
          
          {/* Step temporary connection line during dragging */}
          {connectionManager.isConnecting && connectionManager.connectingFromPosition && (
            <g>
              {/* Create step path for temporary connection */}
              <path
                d={(() => {
                  const from = connectionManager.connectingFromPosition;
                  const to = connectionManager.mousePosition;
                  const dx = to.x - from.x;
                  
                  // Calculate step path points for temporary connection
                  const midX = from.x + Math.abs(dx) * 0.5;
                  
                  // Create step path: horizontal -> vertical -> horizontal
                  const points: string[] = [
                    `M ${from.x} ${from.y}`,  // Start point
                    `L ${midX} ${from.y}`,    // Horizontal line to middle
                    `L ${midX} ${to.y}`,      // Vertical line
                    `L ${to.x} ${to.y}`       // Final horizontal line to target
                  ];
                  
                  return points.join(' ');
                })()}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeDasharray="8,4"
                markerEnd="url(#workflow-arrow)"
                className="animate-pulse"
                style={{
                  filter: 'drop-shadow(0 2px 6px rgba(59, 130, 246, 0.4))'
                }}
              />
            </g>
          )}
        </svg>
        
        {/* Connection Instructions */}
        {connectionManager.isConnecting && (
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-60 flex items-center gap-2"
            style={{ pointerEvents: 'none' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Click on a blue dot to connect tasks
            <span className="text-xs opacity-75">(Press ESC to cancel)</span>
          </div>
        )}
        
        {/* Connection count indicator */}
        {connectionManager.connections.length > 0 && !connectionManager.isConnecting && (
          <div 
            className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium z-60 flex items-center gap-1"
            style={{ pointerEvents: 'none' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {connectionManager.connections.length} connections
          </div>
        )}
      </div>

      {/* Error Display */}
      {connectionManager.error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-60 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {connectionManager.error}
          <button 
            onClick={connectionManager.clearError}
            className="ml-2 text-white hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {connectionManager.isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 z-60 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span style={{ color: theme.text.primary }}>Processing connection...</span>
        </div>
      )}
    </>
  );
};

export default WorkflowConnectionManager;