import React from 'react';
import { 
  EdgeProps, 
  getBezierPath, 
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import { X, Edit3 } from 'lucide-react';
import { DependencyType } from '../types';
import { useTheme } from '@/layouts/hooks/useTheme';

interface DependencyEdgeData {
  dependencyType: DependencyType;
  lag?: number;
  onEdgeUpdate?: (edgeId: string, updates: {
    type?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
    [key: string]: unknown;
  }) => void;
  onEdgeDelete?: (edgeId: string) => void;
}

const DependencyEdge: React.FC<EdgeProps<DependencyEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected
}) => {
  const { theme } = useTheme();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = () => {
    data?.onEdgeDelete?.(id);
  };

  const handleEdit = () => {
    // Toggle dependency type in cycle
    const types: DependencyType[] = ['finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish'];
    const currentIndex = types.indexOf(data?.dependencyType || 'finish-to-start');
    const nextType = types[(currentIndex + 1) % types.length];
    
    data?.onEdgeUpdate?.(id, { 
      data: { 
        ...data, 
        dependencyType: nextType 
      } 
    });
  };

  const getDependencyTypeLabel = (type: DependencyType): string => {
    switch (type) {
      case 'finish-to-start': return 'FS';
      case 'start-to-start': return 'SS';
      case 'finish-to-finish': return 'FF';
      case 'start-to-finish': return 'SF';
      default: return 'FS';
    }
  };

  const getDependencyTypeColor = (type: DependencyType): string => {
    switch (type) {
      case 'finish-to-start': return '#3B82F6'; // Blue
      case 'start-to-start': return '#10B981'; // Green
      case 'finish-to-finish': return '#F59E0B'; // Amber
      case 'start-to-finish': return '#EF4444'; // Red
      default: return '#6B7280';
    }
  };

  const getStrokeDashArray = (type: DependencyType): string => {
    switch (type) {
      case 'start-to-start': return '10,5';
      case 'finish-to-finish': return '5,5';
      case 'start-to-finish': return '3,3';
      default: return 'none';
    }
  };

  const edgeColor = getDependencyTypeColor(data?.dependencyType || 'finish-to-start');
  const strokeWidth = selected ? 3 : 2;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth,
          strokeDasharray: getStrokeDashArray(data?.dependencyType || 'finish-to-start'),
        }}
      />
      
      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* Dependency Type Badge */}
          <div 
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border transition-all duration-200 ${
              selected ? 'shadow-lg' : 'shadow-sm'
            }`}
            style={{
              backgroundColor: theme.background.primary,
              borderColor: edgeColor,
              color: edgeColor
            }}
          >
            <span>{getDependencyTypeLabel(data?.dependencyType || 'finish-to-start')}</span>
            {data?.lag && data.lag !== 0 && (
              <span className="ml-1 opacity-70">
                {data.lag > 0 ? `+${data.lag}d` : `${data.lag}d`}
              </span>
            )}
          </div>
          
          {/* Control Buttons - Only show when selected */}
          {selected && (
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={handleEdit}
                className="p-1 rounded bg-white shadow-sm border hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.border.default }}
                title="Change dependency type"
              >
                <Edit3 className="w-3 h-3" style={{ color: theme.text.secondary }} />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-1 rounded bg-white shadow-sm border hover:bg-red-50 transition-colors"
                style={{ borderColor: theme.border.default }}
                title="Delete dependency"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default DependencyEdge;