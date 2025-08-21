// ===== CreateTeamModal Types =====

export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (team: any) => void;
}

export interface TeamFormState {
  teamName: string;
  memberEmails: string;
  currentEmail: string;
  emailList: string[];
}

export interface TeamFormErrors {
  teamNameError?: string;
  emailError?: string;
  generalError?: string;
}

export interface UseCreateTeamModalProps {
  onClose: () => void;
  onSuccess?: (team: any) => void;
}

export interface UseCreateTeamModalReturn {
  formState: TeamFormState;
  errors: TeamFormErrors;
  isSubmitting: boolean;
  handleTeamNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCurrentEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddEmail: () => void;
  handleRemoveEmail: (index: number) => void;
  handleCreateTeam: () => Promise<void>;
  handleClose: () => void;
  isFormValid: boolean;
}