// Team Dashboard service types and interfaces

// Main Response Object
export interface TeamDashboardResponseDto {
    teamStats: TeamStats;
    memberBreakdown: MemberBreakdown;
    projectBreakdown: ProjectBreakdown;
    upcomingDeadlines: UpcomingDeadlines;
    teamPerformance: TeamPerformance;
}

// 1. TeamStats - Team Statistics
export interface TeamStats {
    totalMembers: number;        // Total team members count
    activeMembers: number;       // Active team members count
    totalProjects: number;       // Total projects in team
    activeProjects: number;      // Active projects count
    completedProjects: number;   // Completed projects count
    totalTasks: number;          // Total tasks count
    completedTasks: number;      // Completed tasks count
    pendingTasks: number;        // Pending tasks count
    overdueTasks: number;        // Overdue tasks count
    teamEfficiency: number;      // Team efficiency percentage
    avgTasksPerMember: number;   // Average tasks per member
    completionRate: number;      // Task completion rate percentage
}

// 2. MemberBreakdown - Member Analysis
export interface MemberBreakdown {
    byRole: RoleBreakdown[];      // Members grouped by role
    byWorkload: WorkloadBreakdown[]; // Members grouped by workload
}

export interface RoleBreakdown {
    name: string;    // Role name (OWNER, MEMBER, etc.)
    count: number;   // Number of members with this role
}

export interface WorkloadBreakdown {
    name: string;    // Member's full name or username
    count: number;   // Number of tasks assigned to this member
}

// 3. ProjectBreakdown - Project Analysis
export interface ProjectBreakdown {
    byStatus: StatusBreakdown[];     // Projects grouped by status
    byProgress: ProgressBreakdown[]; // Projects with progress percentage
}

export interface StatusBreakdown {
    name: string;    // Project status (PLANNED, IN_PROGRESS, COMPLETED, etc.)
    count: number;   // Number of projects with this status
}

export interface ProgressBreakdown {
    name: string;     // Project name
    progress: number; // Project completion percentage (0-100)
}

// 4. UpcomingDeadlines - Deadline Management
export interface UpcomingDeadlines {
    thisWeek: DeadlineTask[];  // Tasks due this week
    nextWeek: DeadlineTask[];  // Tasks due next week
    overdue: OverdueTask[];    // Overdue tasks
}

export interface DeadlineTask {
    id: number;           // Task ID
    title: string;        // Task title
    project: string;      // Project name or "Team Task"
    dueDate: string;      // Due date (YYYY-MM-DD format)
    assignee: string;     // Assignee name or "Unassigned"
}

export interface OverdueTask {
    id: number;              // Task ID
    title: string;           // Task title
    project: string;         // Project name or "Team Task"
    dueDate: string;         // Original due date (YYYY-MM-DD format)
    daysOverdue: number;     // Number of days overdue
    assignee: string;        // Assignee name or "Unassigned"
}

// 5. TeamPerformance - Performance Trends
export interface TeamPerformance {
    monthlyTrends: MonthlyTrend[]; // Last 5 months performance data
}

export interface MonthlyTrend {
    month: string;         // Month name (Jan, Feb, Mar, etc.)
    tasksCreated: number;  // Tasks created in this month
    tasksCompleted: number; // Tasks completed in this month
}

// Additional utility types for chart data transformation
export interface ChartDataItem {
    label: string;
    value: number;
    color?: string;
}

export interface TeamEfficiencyMetrics {
    efficiency: number;
    level: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
    color: string;
}

export interface TeamRole {
    OWNER: 'Owner';
    MEMBER: 'Member';
    ADMIN: 'Admin';
    VIEWER: 'Viewer';
}

export interface ProjectStatus {
    PLANNED: 'Planned';
    IN_PROGRESS: 'In Progress';
    COMPLETED: 'Completed';
    ON_HOLD: 'On Hold';
    CANCELLED: 'Cancelled';
}
