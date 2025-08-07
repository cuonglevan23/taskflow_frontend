import React, { memo } from 'react';
import { TaskConnection } from '../hooks/useWorkflowConnection';

export interface ConnectionLineProps {
  connection: TaskConnection;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  onDelete?: (connectionId: string) => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = memo(({
  connection,
  fromPoint,
  toPoint,
  onDelete
}) => {
  // Create step path - rectangular/orthogonal connections
  const createStepPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const midX = from.x + Math.abs(dx) * 0.5;
    
    // Create step path: horizontal → vertical → horizontal
    const points: string[] = [
      `M ${from.x} ${from.y}`,  // Start point
      `L ${midX} ${from.y}`,    // Horizontal line to middle
      `L ${midX} ${to.y}`,      // Vertical line
      `L ${to.x} ${to.y}`       // Final horizontal line to target
    ];
    
    return points.join(' ');
  };

  const stepPath = createStepPath(fromPoint, toPoint);
  
  // Calculate midpoint for label
  const midX = fromPoint.x + (toPoint.x - fromPoint.x) * 0.5;
  const midY = fromPoint.y + (toPoint.y - fromPoint.y) * 0.5;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(connection.id);
    }
  };

  // Connection type labels
  const connectionLabels = {
    'finish-to-start': 'FS',
    'start-to-start': 'SS',
    'finish-to-finish': 'FF',
    'start-to-finish': 'SF'
  };

  return (
    <g className="connection-line-group">
      {/* Subtle background glow */}
      <path
        d={stepPath}
        fill="none"
        stroke="rgba(16, 185, 129, 0.15)"
        strokeWidth="8"
        strokeLinejoin="round"
        style={{
          filter: 'blur(2px)'
        }}
      />
      
      {/* Main step connection path */}
      <path
        d={stepPath}
        fill="none"
        stroke="#10B981"
        strokeWidth="3"
        strokeLinejoin="round"
        markerEnd="url(#connection-arrow)"
        className="transition-all duration-300 hover:stroke-emerald-400 cursor-pointer"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))'
        }}
        onClick={onDelete ? handleDelete : undefined}
      />
      
      {/* Animated flow effect */}
      <path
        d={stepPath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="1"
        strokeLinejoin="round"
        strokeDasharray="4,8"
        className="animate-pulse pointer-events-none"
        style={{
          animation: 'flow 2s linear infinite'
        }}
      />
      
      {/* Connection label */}
      <g className="connection-label cursor-pointer" onClick={onDelete ? handleDelete : undefined}>
        <circle
          cx={midX}
          cy={midY}
          r="12"
          fill="#10B981"
          stroke="white"
          strokeWidth="3"
          className="drop-shadow-lg hover:scale-110 transition-transform duration-200"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
          }}
        />
        <text
          x={midX}
          y={midY + 3}
          textAnchor="middle"
          fontSize="10"
          fill="white"
          className="font-bold select-none pointer-events-none"
        >
          {connectionLabels[connection.type]}
        </text>
      </g>
    </g>
  );
});

ConnectionLine.displayName = 'ConnectionLine';

export default ConnectionLine;