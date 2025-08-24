// Goal status types
export type GoalStatus = 'on track' | 'at risk' | 'off track' | 'no status';

// Time period types (quarters, years)
export type TimePeriod = `Q${1 | 2 | 3 | 4} FY${number}`;

// Goal progress type
export type GoalProgress = number; // 0-100 percentage

// Goal data structure
export interface Goal {
  id: string;
  name: string;
  description?: string;
  timePeriod: TimePeriod;
  progress: GoalProgress;
  status: GoalStatus;
  ownerId: string;
  ownerAvatarUrl?: string;
  workspaceId?: string;
  teamId?: string;
  isWorkspaceGoal?: boolean;
  isTeamGoal?: boolean;
  hasRisk?: boolean;
  createdAt: Date;
  updatedAt: Date;
  parentGoalId?: string; // For hierarchical goals
  childGoalIds?: string[]; // For hierarchical goals
}

// Simplified goal for list display
export interface GoalListItem {
  id: string;
  name: string;
  workspaceName?: string;
  teamName?: string;
  timePeriod: TimePeriod;
  progress: GoalProgress;
  status: GoalStatus;
  ownerId: string;
  ownerAvatarUrl?: string;
  hasRisk?: boolean;
  isExpanded?: boolean; // UI state for expandable rows
}

// Create goal form data
export interface CreateGoalData {
  name: string;
  description?: string;
  timePeriod: TimePeriod;
  workspaceId?: string;
  teamId?: string;
  ownerId?: string;
  parentGoalId?: string;
}

// Update goal data
export interface UpdateGoalData {
  id: string;
  name?: string;
  description?: string;
  timePeriod?: TimePeriod;
  progress?: GoalProgress;
  status?: GoalStatus;
  ownerId?: string;
}

// Goal filters
export interface GoalFilters {
  timePeriods?: TimePeriod[];
  statuses?: GoalStatus[];
  ownerIds?: string[];
  teamIds?: string[];
  workspaceIds?: string[];
}

// Tab options for goal navigation
export type GoalTab = 'my-goals' | 'team-goals' | 'strategy-map';
