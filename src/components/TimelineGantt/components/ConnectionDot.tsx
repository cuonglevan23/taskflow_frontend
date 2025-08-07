import React, { memo } from 'react';

export interface ConnectionDotProps {
  type: 'source' | 'target';
  position: 'left' | 'right';
  taskId: string;
  color: string;
  isActive: boolean;
  isVisible: boolean;
  onClick: (taskId: string, type: 'source' | 'target', event: React.MouseEvent) => void;
}

const ConnectionDot: React.FC<ConnectionDotProps> = memo(({
  type,
  position,
  taskId,
  color,
  isActive,
  isVisible,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick(taskId, type, e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`
        absolute top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer z-50
        flex items-center justify-center transition-all duration-200
        ${position === 'left' ? '-left-3' : '-right-3'}
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        hover:scale-110
      `}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      data-connection-type={type}
      data-task-id={taskId}
    >
      <div
        className={`
          w-4 h-4 rounded-full border-2 border-white transition-all duration-200
          shadow-lg ${isActive ? 'animate-pulse scale-125' : ''}
          hover:scale-125 hover:shadow-xl
          active:scale-90
        `}
        style={{
          backgroundColor: color,
          boxShadow: `0 2px 8px ${color}40, 0 0 0 1px ${color}20`,
        }}
      />
    </div>
  );
});

ConnectionDot.displayName = 'ConnectionDot';

export default ConnectionDot;