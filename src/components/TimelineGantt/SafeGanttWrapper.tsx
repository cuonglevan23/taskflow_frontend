import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// Define Alert components if not available
const Alert = ({ variant, children, className = "" }: { variant?: string, children: React.ReactNode, className?: string }) => (
  <div className={`p-4 rounded-md ${variant === 'destructive' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800'} ${className}`}>
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

// Define Gantt type for TypeScript
interface GanttConstructor {
  new (
    element: HTMLElement, 
    tasks: GanttTask[],
    options: {
      view_mode?: string;
      on_click?: (task: GanttTask) => void;
      on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
      on_progress_change?: (task: GanttTask, progress: number) => void;
      on_view_change?: (mode: string) => void;
    }
  ): GanttInstance;
}

interface GanttInstance {
  change_view_mode: (mode: string) => void;
  refresh: (tasks: GanttTask[]) => void;
}

// Import Gantt only on client side
let Gantt: GanttConstructor | null = null;

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress?: number;
  dependencies?: string;
  custom_class?: string;
}

export interface SafeGanttWrapperProps {
  tasks: GanttTask[];
  viewMode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
  onTaskClick?: (task: GanttTask) => void;
  onDateChange?: (task: GanttTask, start: Date, end: Date) => void;
  onProgressChange?: (task: GanttTask, progress: number) => void;
  onViewChange?: (mode: string) => void;
}

const SafeGanttWrapper: React.FC<SafeGanttWrapperProps> = ({
  tasks,
  viewMode = 'Week',
  onTaskClick,
  onDateChange,
  onProgressChange,
  onViewChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<GanttInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsClient(true);
    // Dynamic import of Gantt
    import('frappe-gantt').then(module => {
      Gantt = module.default;
    }).catch(err => {
      console.error('Failed to load Frappe Gantt:', err);
      setError('Failed to load Gantt chart library');
    });
  }, []);

  // Validate tasks before initialization
  const validateTasks = (tasks: GanttTask[]): GanttTask[] => {
    if (!Array.isArray(tasks)) {
      console.error('Tasks is not an array:', tasks);
      setError('Invalid tasks data format');
      return [];
    }

    return tasks.filter(task => {
      if (!task || typeof task !== 'object') {
        console.error('Invalid task object:', task);
        return false;
      }
      
      if (!task.id || !task.name || !task.start || !task.end) {
        console.error('Task missing required properties:', task);
        return false;
      }
      
      return true;
    });
  };

  // Initialize Gantt chart
  useEffect(() => {
    // Only run when Gantt is loaded and we're on client side
    if (!isClient || !Gantt || !containerRef.current) return;
    
    try {
      // Validate tasks
      const validTasks = validateTasks(tasks);
      
      if (validTasks.length === 0) {
        setError('No valid tasks available for the Gantt chart');
        return;
      }

      // Clear previous error
      setError(null);
      
      // Clear existing instance
      if (ganttInstance.current) {
        containerRef.current.innerHTML = '';
      }

      // Log tasks before initialization
      console.log('Initializing Gantt with tasks:', JSON.stringify(validTasks, null, 2));
      
      // Create new Gantt instance with try/catch
      try {
        ganttInstance.current = new Gantt(containerRef.current, validTasks, {
          view_mode: viewMode,
          on_click: onTaskClick,
          on_date_change: onDateChange,
          on_progress_change: onProgressChange,
          on_view_change: onViewChange,
        });
      } catch (err) {
        console.error('Error initializing Gantt chart:', err);
        setError(`Failed to initialize Gantt chart: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error in Gantt initialization:', err);
      setError(`Error in Gantt chart setup: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [isClient, tasks, viewMode, onTaskClick, onDateChange, onProgressChange, onViewChange]);

  // Change view mode
  useEffect(() => {
    if (ganttInstance.current && viewMode) {
      try {
        ganttInstance.current.change_view_mode(viewMode);
      } catch (err) {
        console.error('Error changing view mode:', err);
        setError(`Failed to change view mode: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  }, [viewMode]);

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <details>
                  <summary>Technical Details</summary>
                  <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                    {JSON.stringify({ tasks, viewMode }, null, 2)}
                  </pre>
                </details>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="gantt-container">
      <div ref={containerRef} className="w-full overflow-x-auto" />
      {!isClient && <div>Loading Gantt chart...</div>}
    </div>
  );
};

export default SafeGanttWrapper;
