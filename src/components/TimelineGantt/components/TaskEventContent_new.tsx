import React, { useState, useCallback } from 'react';
import { GanttTask } from '../TimelineGantt';

export interface TaskEventContentProps {
  task: GanttTask;
  arg: any; // FullCalendar event arg
  enableWorkflow: boolean;
  isConnecting: boolean;
  connectingFromTaskId: string | null;
  onConnectionClick: (taskId: string, type: 'source' | 'target', event: React.MouseEvent) => void;
}

const TaskEventContent: React.FC<TaskEventContentProps> = ({
  task,
  arg,
  enableWorkflow,
  isConnecting,
  connectingFromTaskId,
  onConnectionClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Priority colors
  const priorityColors = {
    urgent: '#EF4444',
    high: '#F97316', 
    medium: '#EAB308',
    low: '#22C55E'
  };

  // Status colors
  const statusColors = {
    todo: '#6B7280',
    in_progress: '#3B82F6',
    review: '#F59E0B',
    done: '#10B981',
    cancelled: '#EF4444'
  };

  const taskColor = priorityColors[task.priority] || '#6B7280';
  
  return (
    <div
      className={`
        relative w-full h-full flex items-center gap-2 px-3 min-w-0
        transition-all duration-200 group overflow-visible
        ${enableWorkflow ? 'hover:shadow-md hover:z-10' : ''}
        ${isConnecting ? 'cursor-crosshair' : 'cursor-pointer'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-task-id={task.id}
      style={{
        backgroundColor: taskColor,
        boxShadow: isHovered && enableWorkflow ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : undefined,
        borderRadius: isHovered && enableWorkflow ? '6px' : undefined
      }}
    >
      {/* Priority indicator */}
      <div
        className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
        style={{ backgroundColor: priorityColors[task.priority] }}
      />
      
      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-sm truncate">
          {task.title}
        </div>
        {task.assignees.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={assignee.id}
                className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-medium"
                title={assignee.name}
              >
                {assignee.avatar || assignee.name.charAt(0)}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="text-white/70 text-xs">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div
        className="w-2 h-full rounded-r flex-shrink-0"
        style={{ backgroundColor: statusColors[task.status] }}
      />

      {/* Connection Dots - Large, easy to click */}
      {enableWorkflow && (
        <>
          {/* Target dot (left - blue) - Large hit area */}
          <div
            className={`
              absolute top-1/2 -left-5 w-10 h-10 -mt-5 cursor-pointer z-50
              flex items-center justify-center rounded-full transition-all duration-150
              ${(isHovered || (isConnecting && connectingFromTaskId !== task.id)) ? 'opacity-100' : 'opacity-0'}
              hover:bg-blue-100/20
            `}
            onClick={(e) => {
              e.stopPropagation();
              if (isConnecting && connectingFromTaskId !== task.id) {
                onConnectionClick(task.id, 'target', e);
              }
            }}
            data-connection-type="target"
          >
            <div
              className={`
                w-5 h-5 rounded-full border-2 border-white shadow-lg
                transition-transform duration-150
                ${(isConnecting && connectingFromTaskId !== task.id) ? 'scale-125 animate-pulse' : ''}
                hover:scale-110
              `}
              style={{
                backgroundColor: '#3B82F6',
                boxShadow: '0 3px 12px rgba(59, 130, 246, 0.5)'
              }}
            />
          </div>
          
          {/* Source dot (right - green) - Large hit area */}
          <div
            className={`
              absolute top-1/2 -right-5 w-10 h-10 -mt-5 cursor-pointer z-50
              flex items-center justify-center rounded-full transition-all duration-150
              ${(isHovered || (isConnecting && connectingFromTaskId === task.id)) ? 'opacity-100' : 'opacity-0'}
              hover:bg-green-100/20
            `}
            onClick={(e) => {
              e.stopPropagation();
              onConnectionClick(task.id, 'source', e);
            }}
            data-connection-type="source"
          >
            <div
              className={`
                w-5 h-5 rounded-full border-2 border-white shadow-lg
                transition-transform duration-150
                ${(isConnecting && connectingFromTaskId === task.id) ? 'scale-125 animate-pulse' : ''}
                hover:scale-110
              `}
              style={{
                backgroundColor: '#10B981',
                boxShadow: '0 3px 12px rgba(16, 185, 129, 0.5)'
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Simple DOM-based factory function for FullCalendar compatibility
export const createReactEventContent = (
  enableWorkflow: boolean,
  isConnecting: boolean,
  connectingFromTaskId: string | null,
  onConnectionClick: (taskId: string, type: 'source' | 'target', event: React.MouseEvent) => void
) => {
  return (arg: any) => {
    const task = arg.event.extendedProps.task;
    
    if (!task) {
      return { domNodes: [document.createTextNode(arg.event.title)] };
    }

    // Priority colors
    const priorityColors = {
      urgent: '#EF4444',
      high: '#F97316', 
      medium: '#EAB308',
      low: '#22C55E'
    };

    // Status colors  
    const statusColors = {
      todo: '#6B7280',
      in_progress: '#3B82F6',
      review: '#F59E0B',
      done: '#10B981',
      cancelled: '#EF4444'
    };

    const taskColor = priorityColors[task.priority] || '#6B7280';

    // Create main container with NO interference to drag & drop
    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      background-color: ${taskColor};
      border-radius: 8px;
      overflow: visible;
      box-sizing: border-box;
    `;
    
    // ✅ CRITICAL: Set data-task-id for WorkflowConnectionManager to find elements
    container.setAttribute('data-task-id', task.id);
    console.log('🏷️ Setting data-task-id:', task.id, 'on container element');

    // Priority indicator
    const priorityDot = document.createElement('div');
    priorityDot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: ${priorityColors[task.priority]};
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      flex-shrink: 0;
    `;

    // Task content
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      flex: 1;
      min-width: 0;
      color: white;
    `;

    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    `;
    titleDiv.textContent = task.title;

    // Assignees
    if (task.assignees.length > 0) {
      const assigneeDiv = document.createElement('div');
      assigneeDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
      `;

      task.assignees.slice(0, 3).forEach(assignee => {
        const avatar = document.createElement('div');
        avatar.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.2);
          color: white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        `;
        avatar.textContent = assignee.avatar || assignee.name.charAt(0);
        avatar.title = assignee.name;
        assigneeDiv.appendChild(avatar);
      });

      if (task.assignees.length > 3) {
        const more = document.createElement('div');
        more.style.cssText = `
          color: rgba(255,255,255,0.7);
          font-size: 12px;
        `;
        more.textContent = `+${task.assignees.length - 3}`;
        assigneeDiv.appendChild(more);
      }

      contentDiv.appendChild(titleDiv);
      contentDiv.appendChild(assigneeDiv);
    } else {
      contentDiv.appendChild(titleDiv);
    }

    // Status indicator
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
      width: 8px;
      height: 100%;
      background-color: ${statusColors[task.status]};
      border-radius: 0 8px 8px 0;
      flex-shrink: 0;
    `;

    // Connection dots - LARGE and EASY to click
    if (enableWorkflow) {
      // Target dot (left - blue) - 50px hit area!
      const targetDot = document.createElement('div');
      targetDot.style.cssText = `
        position: absolute;
        top: 50%;
        left: -25px;
        width: 50px;
        height: 50px;
        margin-top: -25px;
        cursor: pointer;
        z-index: 103;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: all 0.15s ease;
        border-radius: 50%;
        background-color: rgba(59, 130, 246, 0.1);
      `;
      
      const targetVisual = document.createElement('div');
      targetVisual.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #3B82F6;
        border: 3px solid white;
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.6);
        transition: transform 0.15s ease;
      `;

      targetDot.appendChild(targetVisual);
      targetDot.setAttribute('data-connection-type', 'target');
      targetDot.setAttribute('data-task-id', task.id);
      console.log('🎯 Created TARGET dot with data-connection-type="target" for task:', task.id);

      // Source dot (right - green) - 50px hit area!
      const sourceDot = document.createElement('div');
      sourceDot.style.cssText = `
        position: absolute;
        top: 50%;
        right: -25px;
        width: 50px;
        height: 50px;
        margin-top: -25px;
        cursor: pointer;
        z-index: 103;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: all 0.15s ease;
        border-radius: 50%;
        background-color: rgba(16, 185, 129, 0.1);
      `;

      const sourceVisual = document.createElement('div');
      sourceVisual.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #10B981;
        border: 3px solid white;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.6);
        transition: transform 0.15s ease;
      `;

      sourceDot.appendChild(sourceVisual);
      sourceDot.setAttribute('data-connection-type', 'source');
      sourceDot.setAttribute('data-task-id', task.id);
      console.log('🟢 Created SOURCE dot with data-connection-type="source" for task:', task.id);

      // IMMEDIATE hover response - no delays at all
      let isHovered = false;
      container.addEventListener('mouseenter', () => {
        isHovered = true;
        container.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)';
        
        // Show dots IMMEDIATELY
        targetDot.style.opacity = '1';
        targetDot.style.pointerEvents = 'auto';
        sourceDot.style.opacity = '1';
        sourceDot.style.pointerEvents = 'auto';
      });

      container.addEventListener('mouseleave', () => {
        isHovered = false;
        if (!isConnecting) {
          container.style.boxShadow = '';
        }
        
        // Hide dots unless in connecting state
        if (!(isConnecting && connectingFromTaskId !== task.id)) {
          targetDot.style.opacity = '0';
          targetDot.style.pointerEvents = 'none';
        }
        if (!(isConnecting && connectingFromTaskId === task.id)) {
          sourceDot.style.opacity = '0';
          sourceDot.style.pointerEvents = 'none';
        }
      });

      // Enhanced click feedback
      targetDot.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Visual click feedback
        targetVisual.style.transform = 'scale(0.8)';
        targetDot.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
        setTimeout(() => {
          targetVisual.style.transform = 'scale(1)';
          targetDot.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }, 150);
        
        if (isConnecting && connectingFromTaskId !== task.id) {
          const syntheticEvent = {
            currentTarget: targetDot,
            stopPropagation: () => e.stopPropagation(),
            preventDefault: () => e.preventDefault()
          } as React.MouseEvent;
          onConnectionClick(task.id, 'target', syntheticEvent);
        }
      });

      sourceDot.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Visual click feedback
        sourceVisual.style.transform = 'scale(0.8)';
        sourceDot.style.backgroundColor = 'rgba(16, 185, 129, 0.3)';
        setTimeout(() => {
          sourceVisual.style.transform = 'scale(1)';
          sourceDot.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        }, 150);
        
        const syntheticEvent = {
          currentTarget: sourceDot,
          stopPropagation: () => e.stopPropagation(),
          preventDefault: () => e.preventDefault()
        } as React.MouseEvent;
        onConnectionClick(task.id, 'source', syntheticEvent);
      });

      // Connection state visual updates
      if (isConnecting && connectingFromTaskId !== task.id) {
        targetDot.style.opacity = '1';
        targetDot.style.pointerEvents = 'auto';
        targetVisual.style.transform = 'scale(1.4)';
        targetVisual.style.animation = 'pulse 1.2s infinite';
        targetDot.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';
      }
      
      if (isConnecting && connectingFromTaskId === task.id) {
        sourceDot.style.opacity = '1';
        sourceDot.style.pointerEvents = 'auto';
        sourceVisual.style.transform = 'scale(1.4)';
        sourceVisual.style.animation = 'pulse 1.2s infinite';
        sourceDot.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
      }

      container.appendChild(targetDot);
      container.appendChild(sourceDot);
    }

    // Assemble container
    container.appendChild(priorityDot);
    container.appendChild(contentDiv);
    container.appendChild(statusDiv);

    return { domNodes: [container] };
  };
};

export default TaskEventContent;