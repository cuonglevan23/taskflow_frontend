declare module 'frappe-gantt' {
  export interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string;
    customClass?: string;
    [key: string]: any;
  }

  export interface GanttOptions {
    header_height?: number;
    column_width?: number;
    step?: number;
    view_modes?: Array<'Day' | 'Week' | 'Month' | 'Year'>;
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    view_mode?: 'Day' | 'Week' | 'Month' | 'Year';
    date_format?: string;
    language?: string;
    custom_popup_html?: (task: Task) => string;
    [key: string]: any;
  }

  export default class Gantt {
    constructor(
      wrapper: HTMLElement,
      tasks: Task[],
      options?: GanttOptions
    );

    change_view_mode(mode: 'Day' | 'Week' | 'Month' | 'Year'): void;
    on(event: string, callback: (...args: any[]) => void): void;
    refresh(tasks: Task[]): void;
  }
}
