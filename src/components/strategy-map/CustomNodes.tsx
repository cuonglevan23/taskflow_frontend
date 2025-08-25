import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  description?: string;
  category?: string;
  progress?: number;
}

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
}

export function StrategyNode({ data, selected }: CustomNodeProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'vision': return '#4f46e5';
      case 'financial': return '#059669';
      case 'customer': return '#dc2626';
      case 'process': return '#7c3aed';
      case 'learning': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const backgroundColor = getCategoryColor(data.category);

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
      style={{
        backgroundColor,
        borderColor: selected ? '#60a5fa' : backgroundColor,
        minWidth: '150px',
        maxWidth: '200px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        style={{ background: '#fff', border: '2px solid ' + backgroundColor }}
      />
      
      <div className="text-white">
        <div className="font-semibold text-sm mb-1">{data.label}</div>
        {data.description && (
          <div className="text-xs opacity-90 mb-2">{data.description}</div>
        )}
        
        {data.progress !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{data.progress}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
        style={{ background: '#fff', border: '2px solid ' + backgroundColor }}
      />
    </div>
  );
}

export function GoalNode({ data, selected }: CustomNodeProps) {
  return (
    <div
      className={`px-6 py-4 shadow-xl rounded-xl border-2 transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-400 scale-105' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: selected ? '#60a5fa' : '#667eea',
        minWidth: '200px',
        maxWidth: '300px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4"
        style={{ background: '#fff', border: '3px solid #667eea' }}
      />
      
      <div className="text-white text-center">
        <div className="font-bold text-lg mb-2">{data.label}</div>
        {data.description && (
          <div className="text-sm opacity-90">{data.description}</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4"
        style={{ background: '#fff', border: '3px solid #667eea' }}
      />
    </div>
  );
}
