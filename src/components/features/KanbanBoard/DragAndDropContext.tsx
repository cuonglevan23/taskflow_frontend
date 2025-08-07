"use client";

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { TaskListItem } from '@/components/TaskList/types';
import DragOverlayCard from './DragOverlayCard';

interface DragAndDropContextProps {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  activeTask?: TaskListItem | null;
}

const DragAndDropContext: React.FC<DragAndDropContextProps> = ({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  activeTask,
}) => {
  // Professional sensor configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection for better UX
  const collisionDetection: CollisionDetection = (args) => {
    // First, let's see if there are any collisions with the pointer
    const pointerCollisions = rectIntersection(args);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // If there are no pointer collisions, return rectangle intersections
    return closestCorners(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      {children}
      
      {/* Professional Drag Overlay */}
      <DragOverlay adjustScale={false} dropAnimation={{
        duration: 200,
        easing: 'ease-out',
      }}>
        {activeTask ? (
          <DragOverlayCard task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragAndDropContext;