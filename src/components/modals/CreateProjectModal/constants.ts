import { PrivacyOption } from './types';

/* ===================== Constants ===================== */
export const PRIVACY_OPTIONS: PrivacyOption[] = [
    {
        id: "personal",
        label: "Personal Project", 
        description: "Only visible to you",
        icon: "🔒",
        isPersonal: true,
        teamId: null
    },
    {
        id: "team",
        label: "Team Project",
        description: "Visible to team members",
        icon: "👥",
        isPersonal: false,
        teamId: 789 // Default team ID - could be made dynamic later
    }
];

export const TOTAL_STEPS = 2;

export const STEP_TITLES = {
    1: 'New project',
    2: 'Project timeline'
} as const;