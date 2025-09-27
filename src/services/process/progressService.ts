import { GoalListItem, TimePeriod, GoalStatus } from "@/types/goals";
import { BaseApiClient } from '@/lib/baseApiClient'; // Sử dụng BaseApiClient thống nhất

// Team Progress type from API
export interface TeamProgress {
  id: number;
  teamId: number;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  teamOwner: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    jobTitle: string;
    department: string;
    aboutMe: string;
    status: string;
    avatarUrl: string;
    isUpgraded: boolean;
    displayName: string;
    initials: string;
  };
  teamMembers: Array<{
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    initials: string;
    avatarUrl: string;
  }>;
  lastUpdatedBy: {
    userId: number;
    email: string;
    displayName: string;
    initials: string;
    avatarUrl: string;
  };
}

// Project Progress type from API
export interface ProjectProgress {
  id: number;
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  totalTeams: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  teamProjectProgressList: TeamProjectProgress[];
}

// Team-Project Progress type from API
export interface TeamProjectProgress {
  id: number;
  teamId: number;
  teamName: string;
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lastUpdated: string;
}

// Project Task Progress type from API - for /api/project-tasks/project/{projectId}/progress
export interface ProjectTaskProgress {
  projectId: number;
  totalTasks: number;
  completedTasks: number;
  overallProgressPercentage: number;
  tasks: Array<{
    taskId: number;
    title: string;
    status: string;
    progressPercentage: number;
    assigneeId: number;
    assigneeName: string;
    deadline: string;
    priority: string;
    isCompleted: boolean;
    updatedAt: string;
  }>;
  lastUpdated: string;
}

// Helper function to convert progress data to GoalListItem
function convertProjectToGoal(project: ProjectProgress): GoalListItem {
  // Map quarter based on current date
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Determine quarter based on month (0-2: Q1, 3-5: Q2, 6-8: Q3, 9-11: Q4)
  const quarter = Math.floor(currentMonth / 3) + 1;
  const timePeriod = `Q${quarter} FY${currentYear - 2000 + 1}` as TimePeriod;
  
  // Determine status based on completion percentage
  let status: GoalStatus = 'no status';
  if (project.completionPercentage < 25) {
    status = 'off track';
  } else if (project.completionPercentage < 75) {
    status = 'at risk';
  } else {
    status = 'on track';
  }

  return {
    id: project.projectId.toString(),
    name: project.projectName,
    timePeriod,
    progress: project.completionPercentage,
    status,
    ownerId: '', // API doesn't provide this info
    teamName: project.teamProjectProgressList.length > 0 ? project.teamProjectProgressList[0].teamName : undefined,
    hasRisk: project.completionPercentage < 50,
    isExpanded: false
  };
}

function convertTeamToGoal(team: TeamProgress): GoalListItem {
  // Map quarter based on current date
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Determine quarter based on month (0-2: Q1, 3-5: Q2, 6-8: Q3, 9-11: Q4)
  const quarter = Math.floor(currentMonth / 3) + 1;
  const timePeriod = `Q${quarter} FY${currentYear - 2000 + 1}` as TimePeriod;
  
  // Determine status based on completion percentage
  let status: GoalStatus = 'no status';
  if (team.completionPercentage < 25) {
    status = 'off track';
  } else if (team.completionPercentage < 75) {
    status = 'at risk';
  } else {
    status = 'on track';
  }

  return {
    id: `team-${team.teamId}`,
    name: `${team.teamName} Progress`,
    timePeriod,
    progress: team.completionPercentage,
    status,
    ownerId: '', // API doesn't provide this info
    teamName: team.teamName,
    hasRisk: team.completionPercentage < 50,
    isExpanded: false
  };
}

// Fetch team progress
export async function getTeamProgress(teamId: number): Promise<TeamProgress> {
  try {
    // Sử dụng BaseApiClient thay vì api
    const response = await BaseApiClient.get<TeamProgress>(`/api/teams/${teamId}/progress`);
    return response;
  } catch (error) {
    console.error('Error fetching team progress:', error);
    throw error; // Let the calling code handle the error
  }
}

// Fetch project progress
export async function getProjectProgress(projectId: number): Promise<ProjectProgress> {
  try {
    // Sử dụng BaseApiClient thay vì api
    const response = await BaseApiClient.get<ProjectProgress>(`/api/projects/${projectId}/progress`);
    return response;
  } catch (error) {
    console.error('Error fetching project progress:', error);
    throw error; // Let the calling code handle the error
  }
}

// Refresh project progress - NEW ENDPOINT
export async function refreshProjectProgress(projectId: number): Promise<ProjectProgress> {
  try {
    // Sử dụng BaseApiClient để gọi POST endpoint refresh progress
    const response = await BaseApiClient.post<ProjectProgress>(`/api/projects/${projectId}/progress`);
    return response;
  } catch (error) {
    console.error('Error refreshing project progress:', error);
    throw error; // Let the calling code handle the error
  }
}

// Fetch project task progress
export async function getProjectTaskProgress(projectId: number): Promise<ProjectTaskProgress> {
  try {
    // Sử dụng BaseApiClient thay vì api
    const response = await BaseApiClient.get<ProjectTaskProgress>(`/api/project-tasks/project/${projectId}/progress`);
    return response;
  } catch (error) {
    console.error('Error fetching project task progress:', error);
    throw error; // Let the calling code handle the error
  }
}

// Fetch user's teams - sử dụng endpoint /api/teams/progress/all và extract team info
export async function getUserTeams(): Promise<{ id: number, name: string }[]> {
  try {
    // Theo documentation: sử dụng /api/teams/progress/all để lấy teams mà user có quyền truy cập
    const teamsProgress = await getAllTeamsProgress();

    // Extract team info từ progress data
    return teamsProgress.map((teamProgress) => ({
      id: teamProgress.teamId,
      name: teamProgress.teamName
    }));
  } catch (error) {
    console.error('Error fetching user teams:', error);
    throw error;
  }
}

// Fetch user's projects - use a more specific endpoint that only returns accessible projects
export async function getUserProjects(): Promise<{ id: number, name: string }[]> {
  try {
    // First try to get projects the user has access to via a user-specific endpoint
    try {
      // Try getting user's own projects first (this should be permission-safe)
      const response = await BaseApiClient.get<any[]>('/api/users/me/projects');
      return response.map((project: any) => ({
        id: project.id,
        name: project.name || project.projectName || `Project ${project.id}`
      }));
    } catch (userProjectsError) {
      console.warn('⚠️ [getUserProjects] User-specific projects endpoint failed, trying general endpoint');

      // Fallback to general projects endpoint but with better error handling
      const response = await BaseApiClient.get<any[]>('/api/projects');

      // Filter out projects that we know will fail permission checks
      // by doing a quick permission pre-check or using project membership info
      return response
        .filter((project: any) => {
          // Only include projects where user might have access
          // You might want to add additional filtering logic here based on your backend structure
          return project.createdBy || project.ownerId || project.members?.length > 0;
        })
        .map((project: any) => ({
          id: project.id,
          name: project.name || project.projectName || `Project ${project.id}`
        }));
    }
  } catch (error) {
    console.error('❌ [getUserProjects] Error fetching user projects:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}

// Fetch team's projects
export async function getTeamProjects(teamId: number): Promise<{ id: number, name: string }[]> {
  try {
    // Sử dụng BaseApiClient với route handler
    const response = await BaseApiClient.get<{ id: number, name: string }[]>(`/api/teams/${teamId}/projects`);
    return response;
  } catch (error) {
    console.error('Error fetching team projects:', error);
    throw error;
  }
}

// Fetch all teams progress - sử dụng endpoint được document rõ ràng với fallback strategy
export async function getAllTeamsProgress(): Promise<TeamProgress[]> {
  try {
    // Theo documentation: endpoint này trả về progress của tất cả teams mà user tham gia
    const response = await BaseApiClient.get<TeamProgress[]>('/api/teams/progress/all');

    return response;
  } catch (error) {
    console.error('❌ [getAllTeamsProgress] Error fetching all teams progress:', error);

    // Nếu endpoint bị lỗi, thử strategy khác: lấy danh sách teams trước rồi lấy progress từng cái
    try {
      // Fallback 1: Lấy teams từ /api/teams rồi lấy progress từng team
      const teams = await BaseApiClient.get<any[]>('/api/teams');

      if (!teams || teams.length === 0) {
        return [];
      }

      // Lấy progress cho từng team
      const progressPromises = teams.map(async (team: any) => {
        try {
          const progressResponse = await BaseApiClient.get<TeamProgress>(`/api/teams/${team.id}/progress`);
          return progressResponse;
        } catch (teamError) {
          console.warn(`⚠️ [getAllTeamsProgress] Failed to get progress for team ${team.id}:`, teamError);
          // Trả về mock progress cho team này
          return {
            id: Date.now() + Math.random(),
            teamId: team.id,
            teamName: team.name || 'Unknown Team',
            totalTasks: 0,
            completedTasks: 0,
            completionPercentage: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            teamOwner: {
              userId: 1,
              email: 'unknown@example.com',
              firstName: 'Unknown',
              lastName: 'User',
              username: 'unknown',
              jobTitle: 'Team Member',
              department: 'Unknown',
              aboutMe: '',
              status: 'active',
              avatarUrl: '',
              isUpgraded: false,
              displayName: 'Unknown User',
              initials: 'UN'
            },
            teamMembers: [],
            lastUpdatedBy: {
              userId: 1,
              email: 'unknown@example.com',
              displayName: 'Unknown User',
              initials: 'UN',
              avatarUrl: ''
            }
          } as TeamProgress;
        }
      });

      const teamsProgress = await Promise.all(progressPromises);

      return teamsProgress;

    } catch (fallbackError) {
      console.error('❌ [getAllTeamsProgress] Fallback strategy also failed:', fallbackError);

      // Fallback 2: Trả về mock data để app không crash
      return [
        {
          id: 1,
          teamId: 1,
          teamName: 'Sample Team',
          totalTasks: 10,
          completedTasks: 7,
          completionPercentage: 70,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          teamOwner: {
            userId: 1,
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            username: 'demo',
            jobTitle: 'Team Lead',
            department: 'Development',
            aboutMe: 'Demo user for testing',
            status: 'active',
            avatarUrl: '',
            isUpgraded: true,
            displayName: 'Demo User',
            initials: 'DU'
          },
          teamMembers: [
            {
              userId: 1,
              email: 'demo@example.com',
              firstName: 'Demo',
              lastName: 'User',
              displayName: 'Demo User',
              initials: 'DU',
              avatarUrl: ''
            }
          ],
          lastUpdatedBy: {
            userId: 1,
            email: 'demo@example.com',
            displayName: 'Demo User',
            initials: 'DU',
            avatarUrl: ''
          }
        }
      ] as TeamProgress[];
    }
  }
}

// Fetch all goals (combining projects and teams) - with proper permission handling
export async function getAllGoals(): Promise<GoalListItem[]> {
  try {
    // 1. Get user's teams
    const teams = await getUserTeams();
    
    // 2. Get user's projects
    const projects = await getUserProjects();
    
    // 3. Collect all team progress data with error handling
    const teamGoals: GoalListItem[] = [];
    for (const team of teams) {
      try {
        const teamProgress = await getTeamProgress(team.id);
        teamGoals.push(convertTeamToGoal(teamProgress));
      } catch (error) {
        console.warn(`⚠️ [getAllGoals] Failed to get progress for team ${team.id}:`, error);
        // Skip teams that can't be accessed
      }
    }

    // 4. Collect all project progress data with proper error handling
    const projectGoals: GoalListItem[] = [];
    for (const project of projects) {
      try {
        const projectProgress = await getProjectProgress(project.id);
        projectGoals.push(convertProjectToGoal(projectProgress));
      } catch (error) {
        console.warn(`⚠️ [getAllGoals] Failed to get progress for project ${project.id}:`, error);
        // Skip projects that can't be accessed due to permissions
      }
    }

    // 5. Return only accessible goals
    return [...teamGoals, ...projectGoals];
  } catch (error) {
    console.error('Error fetching all goals:', error);
    // Return empty array if there's an error to prevent UI crashes
    return [];
  }
}

// Fetch team goals using existing working endpoints
export async function getTeamGoals(): Promise<GoalListItem[]> {
  try {
    // Get user's teams first
    const teams = await getUserTeams();

    // Get progress for each team
    const teamProgressPromises = teams.map(team => getTeamProgress(team.id));
    const teamsProgress = await Promise.all(teamProgressPromises);

    // Convert team progress to goal items
    const teamGoals = teamsProgress.map(convertTeamToGoal);
    
    return teamGoals;
  } catch (error) {
    console.error('Error fetching team goals:', error);
    // Return empty array if there's an error to prevent UI crashes
    return [];
  }
}
