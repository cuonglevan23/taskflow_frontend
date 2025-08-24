/**
 * Frappe Gantt Direct Patch
 * 
 * This file provides a direct monkey-patch for Frappe Gantt to handle the
 * "undefined is not an object (evaluating 't.name')" error by intercepting
 * the Frappe Gantt constructor and adding safety checks.
 */

import Gantt from 'frappe-gantt';

// Store original methods for reference
const originalGantt = Gantt;

// Monkey-patch the constructor to add safety checks
const SafeGantt = function(
  wrapper: HTMLElement, 
  tasks: any[], 
  options: any
) {
  console.log('SafeGantt: Patching task objects for safety');
  
  // Ensure tasks have all required properties
  const safeTasks = tasks.map((task: any) => {
    const safeTask = {
      id: String(task.id || `task-${Math.random().toString(36).substring(2, 9)}`),
      name: String(task.name || 'Untitled Task'),
      start: String(task.start || new Date().toISOString().split('T')[0]),
      end: String(task.end || new Date().toISOString().split('T')[0]),
      progress: Number(isNaN(task.progress) ? 0 : task.progress),
      dependencies: task.dependencies ? String(task.dependencies) : '',
      custom_class: task.custom_class || ''
    };
    
    return safeTask;
  });
  
  // Add safety to options
  const safeOptions = { ...options };
  
  // Ensure custom_popup_html handles errors
  if (safeOptions.custom_popup_html) {
    const originalPopupFn = safeOptions.custom_popup_html;
    safeOptions.custom_popup_html = function(task: any) {
      try {
        // Fallbacks for undefined values
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
            <h5>${task?.name || 'Untitled Task'}</h5>
            <p>Error displaying task details</p>
          </div>
        `;
      }
    };
  }
  
  try {
    // Call the original constructor with safe parameters
    return new originalGantt(wrapper, safeTasks, safeOptions);
  } catch (err) {
    console.error('Error in Gantt constructor:', err);
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="color: red; padding: 20px;">
          <h3>Error Loading Gantt Chart</h3>
          <p>${err instanceof Error ? err.message : 'Unknown error'}</p>
          <p>Check browser console for more details.</p>
        </div>
      `;
    }
    throw err;
  }
} as unknown as typeof Gantt;

// Copy prototype and static methods
SafeGantt.prototype = originalGantt.prototype;
Object.setPrototypeOf(SafeGantt, originalGantt);

export default SafeGantt;
