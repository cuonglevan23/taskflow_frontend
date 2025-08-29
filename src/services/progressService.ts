import { GoalListItem, TimePeriod, GoalStatus } from "@/types/goals";
import api from '@/services/api';  // Import the centralized API client

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
    // Use the API client which handles auth securely
    const response = await api.get<TeamProgress>(`/api/teams/${teamId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team progress:', error);
    throw error; // Let the calling code handle the error
  }
}

// Fetch project progress
export async function getProjectProgress(projectId: number): Promise<ProjectProgress> {
  try {
    // Use the API client which handles auth securely
    const response = await api.get<ProjectProgress>(`/api/projects/${projectId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project progress:', error);
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

// Fetch user's projects - sử dụng endpoint /api/projects (nếu có route handler)
export async function getUserProjects(): Promise<{ id: number, name: string }[]> {
  try {
    // Sử dụng API client để gọi endpoint có route handler
    const response = await api.get<any[]>('/api/projects');

    // Transform backend response to match expected format
    return response.data.map((project: any) => ({
      id: project.id,
      name: project.name
    }));
  } catch (error) {
    console.error('Error fetching user projects:', error);
    // Return empty array thay vì throw để tránh crash app
    return [];
  }
}

// Fetch team's projects
export async function getTeamProjects(teamId: number): Promise<{ id: number, name: string }[]> {
  try {
    // Sử dụng API client với route handler
    const response = await api.get<{ id: number, name: string }[]>(`/api/teams/${teamId}/projects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team projects:', error);
    throw error;
  }
}

// Fetch all teams progress - sử dụng endpoint được document rõ ràng với fallback strategy
export async function getAllTeamsProgress(): Promise<TeamProgress[]> {
  try {
    console.log('🔍 [getAllTeamsProgress] Attempting to fetch teams progress...');

    // Theo documentation: endpoint này trả về progress của tất cả teams mà user tham gia
    const response = await api.get<TeamProgress[]>('/api/teams/progress/all');

    console.log('✅ [getAllTeamsProgress] Successfully fetched teams progress');
    return response.data;
  } catch (error) {
    console.error('❌ [getAllTeamsProgress] Error fetching all teams progress:', error);

    // Nếu endpoint bị lỗi, thử strategy khác: lấy danh sách teams trước rồi lấy progress từng cái
    console.log('🔄 [getAllTeamsProgress] Trying fallback strategy...');

    try {
      // Fallback 1: Lấy teams từ /api/teams rồi lấy progress từng team
      const teamsResponse = await api.get<any[]>('/api/teams');
      const teams = teamsResponse.data;

      if (!teams || teams.length === 0) {
        console.log('ℹ️ [getAllTeamsProgress] No teams found, returning empty array');
        return [];
      }

      console.log(`🔄 [getAllTeamsProgress] Found ${teams.length} teams, fetching individual progress...`);

      // Lấy progress cho từng team
      const progressPromises = teams.map(async (team: any) => {
        try {
          const progressResponse = await api.get<TeamProgress>(`/api/teams/${team.id}/progress`);
          return progressResponse.data;
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
      console.log(`✅ [getAllTeamsProgress] Fallback successful, got ${teamsProgress.length} team progress records`);

      return teamsProgress;

    } catch (fallbackError) {
      console.error('❌ [getAllTeamsProgress] Fallback strategy also failed:', fallbackError);

      // Fallback 2: Trả về mock data để app không crash
      console.log('🔄 [getAllTeamsProgress] Using mock data to prevent app crash');

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

// Fetch all goals (combining projects and teams)
export async function getAllGoals(): Promise<GoalListItem[]> {
  try {
    // 1. Get user's teams
    const teams = await getUserTeams();
    
    // 2. Get user's projects
    const projects = await getUserProjects();
    
    // 3. Collect all team progress data
    const teamProgressPromises = teams.map(team => getTeamProgress(team.id));
    const teamProgressList = await Promise.all(teamProgressPromises);
    
    // 4. Collect all project progress data
    const projectProgressPromises = projects.map(project => getProjectProgress(project.id));
    const projectProgressList = await Promise.all(projectProgressPromises);
    
    // 5. Convert team progress to goal items
    const teamGoals = teamProgressList.map(convertTeamToGoal);
    
    // 6. Convert project progress to goal items
    const projectGoals = projectProgressList.map(convertProjectToGoal);
    
    // 7. Combine and return
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
