/* ===================== Types ===================== */
export interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProject?: (projectData: ProjectFormData) => void;
}

export interface ProjectFormData {
    name: string;
    privacy: string;
    startDate: string;
    endDate: string;
}

export interface PrivacyOption {
    id: string;
    label: string;
    description: string;
    icon: string;
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