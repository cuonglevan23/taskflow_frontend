import { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useCreateTeam } from '@/hooks/teams/useTeams';
import type { CreateTeamFormData } from '@/types/teams';
import type { 
  UseCreateTeamModalProps, 
  UseCreateTeamModalReturn,
  TeamFormState,
  TeamFormErrors 
} from '../types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useCreateTeamModal({ 
  onClose, 
  onSuccess 
}: UseCreateTeamModalProps): UseCreateTeamModalReturn {
  const { data: session } = useSession();
  const { createTeam, isMutating: isCreating } = useCreateTeam();
  
  // Form state
  const [formState, setFormState] = useState<TeamFormState>({
    teamName: '',
    memberEmails: '',
    currentEmail: '',
    emailList: []
  });

  const [errors, setErrors] = useState<TeamFormErrors>({});

  // Validation
  const validateTeamName = useCallback((name: string): string | undefined => {
    if (!name.trim()) {
      return 'Team name is required';
    }
    if (name.trim().length < 2) {
      return 'Team name must be at least 2 characters';
    }
    if (name.trim().length > 255) {
      return 'Team name cannot exceed 255 characters';
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
      return 'Team name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    return undefined;
  }, []);

  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    if (formState.emailList.includes(email.trim().toLowerCase())) {
      return 'This email has already been added';
    }
    return undefined;
  }, [formState.emailList]);

  const parseEmailsFromText = useCallback((text: string): string[] => {
    if (!text.trim()) return [];
    
    // Split by comma, semicolon, space, or newline
    const emails = text
      .split(/[,;\s\n]+/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email && EMAIL_REGEX.test(email));
    
    // Remove duplicates
    return [...new Set(emails)];
  }, []);

  // Form validation
  const isFormValid = useMemo(() => {
    const nameError = validateTeamName(formState.teamName);
    return !nameError && formState.teamName.trim().length > 0;
  }, [formState.teamName, validateTeamName]);

  // Event handlers
  const handleTeamNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, teamName: value }));
    
    // Clear team name error
    if (errors.teamNameError) {
      setErrors(prev => ({ ...prev, teamNameError: undefined }));
    }
  }, [errors.teamNameError]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ 
      ...prev, 
      memberEmails: value,
      emailList: parseEmailsFromText(value)
    }));
    
    // Clear email error
    if (errors.emailError) {
      setErrors(prev => ({ ...prev, emailError: undefined }));
    }
  }, [errors.emailError, parseEmailsFromText]);

  const handleCurrentEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, currentEmail: value }));
    
    // Clear email error
    if (errors.emailError) {
      setErrors(prev => ({ ...prev, emailError: undefined }));
    }
  }, [errors.emailError]);

  const handleAddEmail = useCallback(() => {
    const emailError = validateEmail(formState.currentEmail);
    if (emailError) {
      setErrors(prev => ({ ...prev, emailError }));
      return;
    }

    const newEmail = formState.currentEmail.trim().toLowerCase();
    const updatedEmailList = [...formState.emailList, newEmail];
    const updatedEmailText = updatedEmailList.join(', ');

    setFormState(prev => ({
      ...prev,
      currentEmail: '',
      emailList: updatedEmailList,
      memberEmails: updatedEmailText
    }));
    
    setErrors(prev => ({ ...prev, emailError: undefined }));
  }, [formState.currentEmail, validateEmail, formState.emailList]);

  const handleRemoveEmail = useCallback((index: number) => {
    const updatedEmailList = formState.emailList.filter((_, i) => i !== index);
    const updatedEmailText = updatedEmailList.join(', ');
    
    setFormState(prev => ({
      ...prev,
      emailList: updatedEmailList,
      memberEmails: updatedEmailText
    }));
  }, [formState.emailList]);

  const handleClose = useCallback(() => {
    // Reset form
    setFormState({
      teamName: '',
      memberEmails: '',
      currentEmail: '',
      emailList: []
    });
    setErrors({});
    onClose();
  }, [onClose]);

  const handleCreateTeam = useCallback(async () => {
    // Validate form
    const teamNameError = validateTeamName(formState.teamName);
    if (teamNameError) {
      setErrors(prev => ({ ...prev, teamNameError }));
      return;
    }

    if (!session?.user) {
      setErrors(prev => ({ ...prev, generalError: 'Please log in to create a team' }));
      return;
    }

    setErrors({});

    try {
      // Prepare team data
      const teamData: CreateTeamFormData = {
        name: formState.teamName.trim(),
        description: '', // Optional - could be added later
        memberEmails: formState.emailList.length > 0 ? formState.emailList : undefined
      };

      // Create team using SWR mutation (automatically invalidates cache)
      const newTeam = await createTeam(teamData, session);
      
      console.log('✅ Team created successfully:', newTeam);

      // Call success callback
      if (onSuccess) {
        onSuccess(newTeam);
      }

      // Close modal
      handleClose();
    } catch (error: any) {
      console.error('❌ Error creating team:', error);
      
      // Handle specific errors
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        setErrors(prev => ({ ...prev, teamNameError: 'A team with this name already exists' }));
      } else if (error.message?.includes('permission')) {
        setErrors(prev => ({ ...prev, generalError: 'You do not have permission to create teams' }));
      } else {
        setErrors(prev => ({ ...prev, generalError: 'Failed to create team. Please try again.' }));
      }
    }
  }, [formState, session, validateTeamName, onSuccess, createTeam, handleClose]);

  return {
    formState,
    errors,
    isSubmitting: isCreating, // Use SWR mutation loading state
    handleTeamNameChange,
    handleEmailChange,
    handleCurrentEmailChange,
    handleAddEmail,
    handleRemoveEmail,
    handleCreateTeam,
    handleClose,
    isFormValid
  };
}