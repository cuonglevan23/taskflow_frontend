import React from 'react';
import { Plus } from 'lucide-react';
import { TaskListItem } from '../../types';
import { TaskEditState, MockProject } from '../types';
import Input from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button';

interface TaskProjectsProps {
  task: TaskListItem;
  editState: TaskEditState;
  onStartAddProject: () => void;
  onCancelProject: () => void;
  onSelectProject: (project: MockProject) => void;
  onCreateProject: (projectName: string) => void;
  onUpdateProjectInput: (value: string) => void;
}

const mockProjects: MockProject[] = [
  { id: '1', name: 'Website Redesign', color: '#8B5CF6' },
  { id: '2', name: 'Mobile App', color: '#06B6D4' },
  { id: '3', name: 'Marketing Campaign', color: '#F59E0B' },
  { id: '4', name: 'Product Launch', color: '#EF4444' },
  { id: '5', name: 'Backend API', color: '#10B981' }
];

export const TaskProjects = ({
  task,
  editState,
  onStartAddProject,
  onCancelProject,
  onSelectProject,
  onCreateProject,
  onUpdateProjectInput,
}: TaskProjectsProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ← Senior: Prevent form submission navigation
      e.stopPropagation(); // ← Senior: Stop event bubbling
      onCreateProject(editState.projectInputValue);
    }
    if (e.key === 'Escape') {
      e.preventDefault(); // ← Senior: Prevent default ESC behavior  
      e.stopPropagation(); // ← Senior: Stop propagation
      onCancelProject();
    }
  };

  const filteredProjects = mockProjects
    .filter(project => 
      project.name.toLowerCase().includes(editState.projectInputValue.toLowerCase())
    )
    .slice(0, 4);

  return (
    <div className="w-[150px] px-4 relative">
      {editState.showProjectInput ? (
        <div className="flex items-center gap-1 w-full relative">
          <Input
            value={editState.projectInputValue}
            onChange={(e) => {
              onUpdateProjectInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter project name"
            inputSize="md"
            className="bg-gray-700 border-purple-400 text-white text-sm h-8 flex-1 min-w-[130px] px-3 py-1.5 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            autoFocus
          />
          
          <div 
            className="fixed inset-0 z-40" 
            onClick={onCancelProject}
          />
          
          {editState.showProjectSuggestions && editState.projectInputValue.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-xl max-h-48 overflow-y-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(project);
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{project.name}</div>
                  </div>
                </div>
              ))}
              
              <div className="px-3 py-2.5 border-t border-gray-600 bg-gray-750">
                <div className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 cursor-pointer transition-colors"
                     onClick={(e) => {
                       e.stopPropagation();
                       onCreateProject(editState.projectInputValue);
                     }}>
                  <Plus className="w-4 h-4" />
                  <span>Create "{editState.projectInputValue}" project</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {task.project ? (
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center h-5 px-2 text-xs font-medium rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group-hover:ring-1 group-hover:ring-purple-400"
              onClick={(e) => {
                e.stopPropagation();
                onStartAddProject();
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-purple-500" />
              <span className="truncate">{task.project}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 h-5 px-2 opacity-0 group-hover:opacity-100 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onStartAddProject();
              }}
            >
              + Project
            </Button>
          )}
        </>
      )}
    </div>
  );
};