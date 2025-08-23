/* ===================== Types ===================== */
export interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProject?: (projectData: ProjectFormData) => void;
    teamId?: number; // Auto-assign project to specific team
}

export interface ProjectFormData {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    isPersonal: boolean;
    teamId?: number | null;
}

export interface PrivacyOption {
    id: 'personal' | 'team';
    label: string;
    description: string;
    icon: string;
    isPersonal: boolean;
    teamId?: number | null;
}

export interface FormErrors {
    nameError: string;
    dateError: string;
}

export interface FormState {
    projectName: string;
    selectedPrivacy: PrivacyOption;
    startDate: string;
    endDate: string;
    isPrivacyDropdownOpen: boolean;
}

export interface StepProps {
    currentStep: number;
    totalSteps: number;
    formState: FormState;
    errors: FormErrors;
    onNext: () => void;
    onPrev: () => void;
    onProjectNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPrivacySelect: (privacy: PrivacyOption) => void;
    onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSetupWithAI: () => void;
    onCreateProject: () => void;
    setIsPrivacyDropdownOpen: (open: boolean) => void;
}