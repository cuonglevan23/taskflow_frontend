import { GoalListItem, TimePeriod, GoalStatus } from "@/types/goals";
import api from '@/services/api';  // Import the centralized API client

// Team Progress type from API
interface TeamProgress {
  id: number;
  teamId: number;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

// Project Progress type from API
interface ProjectProgress {
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
interface TeamProjectProgress {
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

// Fetch user's teams
export async function getUserTeams(): Promise<{ id: number, name: string }[]> {
  try {
    // Use the API client which handles auth securely
    const response = await api.get<{ id: number, name: string }[]>('/api/users/me/teams');
    return response.data;
  } catch (error) {
    console.error('Error fetching user teams:', error);
    throw error; // Let the calling code handle the error
  }
}

// Fetch user's projects
export async function getUserProjects(): Promise<{ id: number, name: string }[]> {
  try {
    // Use the API client which handles auth securely
    const response = await api.get<{ id: number, name: string }[]>('/api/users/me/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error; // Let the calling code handle the error
  }
}

// Fetch team's projects
export async function getTeamProjects(teamId: number): Promise<{ id: number, name: string }[]> {
  try {
    // Use the API client which handles auth securely
    const response = await api.get<{ id: number, name: string }[]>(`/api/teams/${teamId}/projects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team projects:', error);
    throw error; // Let the calling code handle the error
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
