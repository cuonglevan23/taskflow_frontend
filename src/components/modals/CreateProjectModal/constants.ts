import { PrivacyOption } from './types';

/* ===================== Constants ===================== */
export const PRIVACY_OPTIONS: PrivacyOption[] = [
    {
        id: "workspace",
        label: "My workspace", 
        description: "Visible to workspace members",
        icon: "🏢"
    },
    {
        id: "private",
        label: "Private to me",
        description: "Only visible to you",
        icon: "🔒"
    },
    {
        id: "team",
        label: "Team project",
        description: "Visible to team members",
        icon: "👥"
    }
];

export const TOTAL_STEPS = 2;

export const STEP_TITLES = {
    1: 'New project',
    2: 'Project timeline'
} as const;