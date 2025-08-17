import React from 'react';
import { ProjectFormData, PrivacyOption, FormState, FormErrors } from '../types';
import { PRIVACY_OPTIONS, TOTAL_STEPS } from '../constants';

interface UseCreateProjectModalProps {
    onClose: () => void;
    onCreateProject?: (data: ProjectFormData) => void;
}

export function useCreateProjectModal({ onClose, onCreateProject }: UseCreateProjectModalProps) {
    // Step management
    const [currentStep, setCurrentStep] = React.useState(1);

    // Form data
    const [projectName, setProjectName] = React.useState("");
    const [selectedPrivacy, setSelectedPrivacy] = React.useState<PrivacyOption>(PRIVACY_OPTIONS[0]);
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    
    // UI state
    const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = React.useState(false);
    
    // Errors
    const [nameError, setNameError] = React.useState("");
    const [dateError, setDateError] = React.useState("");

    // Validation functions
    const validateStep1 = React.useCallback(() => {
        if (!projectName.trim()) {
            setNameError("Project name is required.");
            return false;
        }
        setNameError("");
        return true;
    }, [projectName]);

    const validateStep2 = React.useCallback(() => {
        if (!startDate) {
            setDateError("Start date is required.");
            return false;
        }
        if (!endDate) {
            setDateError("End date is required.");
            return false;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setDateError("End date must be after start date.");
            return false;
        }
        setDateError("");
        return true;
    }, [startDate, endDate]);

    // Reset form
    const resetForm = React.useCallback(() => {
        setCurrentStep(1);
        setProjectName("");
        setSelectedPrivacy(PRIVACY_OPTIONS[0]);
        setStartDate("");
        setEndDate("");
        setNameError("");
        setDateError("");
        setIsPrivacyDropdownOpen(false);
    }, []);

    // Handlers
    const handleProjectNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
        if (nameError) setNameError("");
    }, [nameError]);

    const handlePrivacySelect = React.useCallback((privacy: PrivacyOption) => {
        setSelectedPrivacy(privacy);
        setIsPrivacyDropdownOpen(false);
    }, []);

    const handleStartDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        if (dateError) setDateError("");
    }, [dateError]);

    const handleEndDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
        if (dateError) setDateError("");
    }, [dateError]);

    const handleNextStep = React.useCallback(() => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    }, [currentStep, validateStep1]);

    const handlePrevStep = React.useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    const handleSetupWithAI = React.useCallback(() => {
        if (currentStep === 1 && validateStep1()) {
            console.log("Setting up with AI:", { projectName, privacy: selectedPrivacy });
            // TODO: implement AI setup logic
        }
    }, [currentStep, validateStep1, projectName, selectedPrivacy]);

    const handleCreateProject = React.useCallback(() => {
        if (validateStep2()) {
            const projectData: ProjectFormData = {
                name: projectName,
                privacy: selectedPrivacy.id,
                startDate,
                endDate
            };
            onCreateProject?.(projectData);
            resetForm();
            onClose();
        }
    }, [validateStep2, projectName, selectedPrivacy, startDate, endDate, onCreateProject, resetForm, onClose]);

    const handleClose = React.useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    // Computed state
    const formState: FormState = {
        projectName,
        selectedPrivacy,
        startDate,
        endDate,
        isPrivacyDropdownOpen
    };

    const errors: FormErrors = {
        nameError,
        dateError
    };

    return {
        // State
        currentStep,
        totalSteps: TOTAL_STEPS,
        formState,
        errors,
        
        // Handlers
        handleProjectNameChange,
        handlePrivacySelect,
        handleStartDateChange,
        handleEndDateChange,
        handleNextStep,
        handlePrevStep,
        handleSetupWithAI,
        handleCreateProject,
        handleClose,
        setIsPrivacyDropdownOpen
    };
}