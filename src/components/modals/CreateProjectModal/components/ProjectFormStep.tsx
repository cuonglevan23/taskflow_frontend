import React from 'react';
import { Sparkles } from 'lucide-react';
import { StepProps } from '../types';
import { PrivacyDropdown } from './PrivacyDropdown';

interface ProjectFormStepProps extends Pick<
    StepProps, 
    'formState' | 'errors' | 'onProjectNameChange' | 'onPrivacySelect' | 
    'onNext' | 'onSetupWithAI' | 'setIsPrivacyDropdownOpen'
> {}

export const ProjectFormStep: React.FC<ProjectFormStepProps> = ({
    formState,
    errors,
    onProjectNameChange,
    onPrivacySelect,
    onNext,
    setIsPrivacyDropdownOpen
}) => {
    return (
        <>
            {/* Project Name */}
            <div className="mb-8">
                <label className="block text-lg font-semibold mb-4 text-white">
                    Project name
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={formState.projectName}
                        onChange={onProjectNameChange}
                        className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-lg bg-gray-800/60 backdrop-blur-sm text-white placeholder-gray-400 shadow-lg ${
                            errors.nameError 
                                ? 'border-red-500 focus:border-red-400 shadow-red-500/20' 
                                : 'border-gray-600/50 focus:border-blue-500 focus:shadow-blue-500/20 hover:border-gray-500/70'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                        placeholder="Enter your project name..."
                    />
                    {formState.projectName && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        </div>
                    )}
                </div>
                {errors.nameError && (
                    <p className="text-red-400 text-sm mt-3 font-medium flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span>{errors.nameError}</span>
                    </p>
                )}
            </div>

            {/* Privacy */}
            <div className="mb-12">
                <label className="block text-lg font-semibold mb-4 text-white">
                    Privacy
                </label>
                <PrivacyDropdown
                    selectedPrivacy={formState.selectedPrivacy}
                    isOpen={formState.isPrivacyDropdownOpen}
                    onSelect={onPrivacySelect}
                    onToggle={setIsPrivacyDropdownOpen}
                />
            </div>

            {/* Action Buttons */}
            <div className="max-w-md w-full space-y-4 mt-8">

                <button
                    onClick={onNext}
                    className="w-full p-4 rounded-lg transition-all duration-200 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 hover:transform hover:-translate-y-0.5"
                    type="button"
                >
                    Continue
                </button>
            </div>
        </>
    );
};