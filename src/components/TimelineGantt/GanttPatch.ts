/**
 * Frappe Gantt Safety Patch
 * 
 * This file provides a safer version of Frappe Gantt that handles errors
 * related to undefined task properties, especially the "t.name" error.
 */

import Gantt from 'frappe-gantt';

interface Task {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  custom_class?: string;
}

interface GanttOptions {
  header_height?: number;
  column_width?: number;
  step?: number;
  view_modes?: ('Day' | 'Week' | 'Month' | 'Year')[];
  bar_height?: number;
  bar_corner_radius?: number;
  arrow_curve?: number;
  padding?: number;
  view_mode?: 'Day' | 'Week' | 'Month' | 'Year';
  date_format?: string;
  popup_trigger?: 'click' | 'hover';
  custom_popup_html?: ((task: Task) => string);
  language?: string;
}

/**
 * A safer version of Frappe Gantt that adds defensive checks
 * to prevent "undefined is not an object (evaluating 't.name')" errors
 */
class SafeGantt extends Gantt {
  constructor(
    wrapper: HTMLElement, 
    tasks: Task[], 
    options: GanttOptions
  ) {
    // Validate all tasks before passing to Gantt
    const safeTasks = tasks.map(task => ({
      id: String(task.id || `task-${Math.random().toString(36).substr(2, 9)}`),
      name: String(task.name || 'Untitled Task'),
      start: String(task.start || new Date().toISOString().split('T')[0]),
      end: String(task.end || new Date().toISOString().split('T')[0]),
      progress: Number(isNaN(task.progress) ? 0 : task.progress),
      dependencies: task.dependencies ? String(task.dependencies) : '',
      custom_class: task.custom_class || ''
    }));
    
    // Ensure custom_popup_html has error handling
    if (options.custom_popup_html) {
      const originalPopupFn = options.custom_popup_html;
      options.custom_popup_html = (task: Task) => {
        try {
          // Ensure task has all required properties
          const safeTask = {
            ...task,
            name: task.name || 'Untitled Task',
            start: task.start || 'Unknown',
            end: task.end || 'Unknown',
            progress: isNaN(task.progress) ? 0 : task.progress
          };
          return originalPopupFn(safeTask);
        } catch (err) {
          console.error('Error in custom_popup_html:', err);
          return `
            <div class="gantt-popup">
              <h5>${task.name || 'Untitled Task'}</h5>
              <p>Error displaying task details</p>
            </div>
          `;
        }
      };
    } else {
      // Default popup if none provided
      options.custom_popup_html = (task: Task) => {
        return `
          <div class="gantt-popup">
            <h5>${task.name || 'Untitled Task'}</h5>
            <p>From: ${task.start || 'Unknown'}</p>
            <p>To: ${task.end || 'Unknown'}</p>
            <p>Progress: ${task.progress || 0}%</p>
          </div>
        `;
      };
    }
    
    super(wrapper, safeTasks, options);
  }
}

export default SafeGantt;
