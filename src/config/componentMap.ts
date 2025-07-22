// Atomic Design - Atoms (Smallest components)
export const atoms = {
  forms: {
    Input: '/forms/Input',
    Select: '/forms/Select',
    Checkbox: '/forms/Checkbox',
    Radio: '/forms/Radio',
    Switch: '/forms/Switch',
    DatePicker: '/forms/DatePicker',
  },
  typography: {
    Heading: '/typography/Heading',
    Text: '/typography/Text',
    Link: '/typography/Link',
  },
  dataDisplay: {
    Badge: '/data-display/Badge',
    Tag: '/data-display/Tag',
    Avatar: '/data-display/Avatar',
    Icon: '/data-display/Icon',
    Progress: '/data-display/Progress',
  },
  feedback: {
    Alert: '/feedback/Alert',
    Spinner: '/feedback/Spinner',
    Toast: '/feedback/Toast',
  },
};

// Molecules (Combinations of atoms)
export const molecules = {
  task: {
    TaskCard: '/task/TaskCard',
    TaskPriority: '/task/TaskPriority',
    TaskStatus: '/task/TaskStatus',
    TaskDueDate: '/task/TaskDueDate',
    TaskAssignee: '/task/TaskAssignee',
  },
  project: {
    ProjectCard: '/project/ProjectCard',
    ProjectProgress: '/project/ProjectProgress',
    ProjectMembers: '/project/ProjectMembers',
    ProjectStatus: '/project/ProjectStatus',
  },
  forms: {
    FormField: '/forms/FormField',
    SearchField: '/forms/SearchField',
    FilterGroup: '/forms/FilterGroup',
  },
};

// Organisms (Complex components)
export const organisms = {
  navigation: {
    Sidebar: '/navigation/Sidebar',
    TopBar: '/navigation/TopBar',
    Breadcrumb: '/navigation/Breadcrumb',
    ProjectNav: '/navigation/ProjectNav',
  },
  taskManagement: {
    TaskList: '/task-management/TaskList',
    TaskBoard: '/task-management/TaskBoard',
    TaskDetail: '/task-management/TaskDetail',
    TaskFilter: '/task-management/TaskFilter',
  },
  projectManagement: {
    ProjectList: '/project-management/ProjectList',
    ProjectOverview: '/project-management/ProjectOverview',
    ProjectTimeline: '/project-management/ProjectTimeline',
    ProjectMembers: '/project-management/ProjectMembers',
  },
};

// Templates (Page layouts)
export const templates = {
  layouts: {
    DashboardLayout: '/layouts/DashboardLayout',
    ProjectLayout: '/layouts/ProjectLayout',
    TaskLayout: '/layouts/TaskLayout',
    SettingsLayout: '/layouts/SettingsLayout',
  },
};

// Features (Business logic and data management)
export const features = {
  tasks: {
    hooks: {
      useTask: '/tasks/hooks/useTask',
      useTaskList: '/tasks/hooks/useTaskList',
      useTaskMutations: '/tasks/hooks/useTaskMutations',
    },
    api: {
      taskApi: '/tasks/api/taskApi',
    },
    context: {
      TaskContext: '/tasks/context/TaskContext',
    },
  },
  projects: {
    hooks: {
      useProject: '/projects/hooks/useProject',
      useProjectList: '/projects/hooks/useProjectList',
      useProjectMutations: '/projects/hooks/useProjectMutations',
    },
    api: {
      projectApi: '/projects/api/projectApi',
    },
    context: {
      ProjectContext: '/projects/context/ProjectContext',
    },
  },
  workspace: {
    hooks: {
      useWorkspace: '/workspace/hooks/useWorkspace',
      useWorkspaceMembers: '/workspace/hooks/useWorkspaceMembers',
    },
    api: {
      workspaceApi: '/workspace/api/workspaceApi',
    },
    context: {
      WorkspaceContext: '/workspace/context/WorkspaceContext',
    },
  },
};
