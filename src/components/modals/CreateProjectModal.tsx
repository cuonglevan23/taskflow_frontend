"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import { BaseModal } from "@/components/ui";

// Internal imports
import { useCreateProjectModal } from "./CreateProjectModal/hooks/useCreateProjectModal";
import { 
    StepIndicator, 
    ProjectFormStep, 
    ProjectTimelineStep, 
    ProjectPreview 
} from "./CreateProjectModal/components";
import { STEP_TITLES } from "./CreateProjectModal/constants";

// Re-export types for external use
export type { 
    CreateProjectModalProps, 
    ProjectFormData, 
    PrivacyOption 
} from "./CreateProjectModal/types";

import type { CreateProjectModalProps } from "./CreateProjectModal/types";




/* ===================== Main Component ===================== */
export default function CreateProjectModal({
    isOpen,
    onClose,
    onCreateProject
}: CreateProjectModalProps) {
    const {
        currentStep,
        totalSteps,
        formState,
        errors,
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
    } = useCreateProjectModal({ onClose, onCreateProject });

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            maxWidth="fullscreen"
            height="screen"
            showHeader={false}
            className="m-0 max-w-none w-screen h-screen rounded-none overflow-hidden"
        >
            {/* Fullscreen Close Button */}
            <div className="absolute top-1 right-1 z-50">
                <button
                    onClick={handleClose}
                    className="p-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-white bg-gray-800/60 hover:bg-gray-800/80 backdrop-blur-sm shadow-xl"
                    title="Close"
                >
                    <X className="w-7 h-7" />
                </button>
            </div>

            <div className="flex h-screen bg-gray-900">
                {/* Left Panel */}
                <div className="w-1/2 flex flex-col px-16 py-12 relative bg-gray-900">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            {currentStep > 1 && (
                                <button
                                    onClick={handlePrevStep}
                                    className="absolute top-1 left-1 z-50 p-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-white hover:bg-gray-800/80 backdrop-blur-sm shadow-lg"
                                    title="Go back"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                            )}
                            <h1 className="text-4xl font-bold text-white">
                                {STEP_TITLES[currentStep as keyof typeof STEP_TITLES]}
                            </h1>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

                    <div className="max-w-md flex-1 flex flex-col justify-center">
                        {/* Step 1: Project Form */}
                        {currentStep === 1 && (
                            <ProjectFormStep
                                formState={formState}
                                errors={errors}
                                onProjectNameChange={handleProjectNameChange}
                                onPrivacySelect={handlePrivacySelect}
                                onNext={handleNextStep}
                                onSetupWithAI={handleSetupWithAI}
                                setIsPrivacyDropdownOpen={setIsPrivacyDropdownOpen}
                            />
                        )}

                        {/* Step 2: Project Timeline */}
                        {currentStep === 2 && (
                            <ProjectTimelineStep
                                formState={formState}
                                errors={errors}
                                onStartDateChange={handleStartDateChange}
                                onEndDateChange={handleEndDateChange}
                                onCreateProject={handleCreateProject}
                            />
                        )}
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="w-1/2 flex flex-col px-12 py-12 border-l bg-gray-800 border-gray-700 relative">
                    <div className="flex-1 flex items-center justify-center">
                        <ProjectPreview currentStep={currentStep} formState={formState} />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
