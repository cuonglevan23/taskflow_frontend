import React from 'react';
import { Sparkles } from 'lucide-react';
import { StepProps } from '../types';
import { PrivacyDropdown } from './PrivacyDropdown';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

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
                <label className="block text-lg font-semibold mb-4" style={{ color: DARK_THEME.text.primary }}>
                    Project name
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={formState.projectName}
                        onChange={onProjectNameChange}
                        className="w-full p-5 rounded-xl border-2 transition-all duration-300 text-lg backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: `${DARK_THEME.background.secondary}99`,
                            color: DARK_THEME.text.primary,
                            borderColor: errors.nameError ? THEME_COLORS.error[500] : DARK_THEME.border.default,
                            boxShadow: errors.nameError 
                                ? `0 0 0 4px ${THEME_COLORS.error[500]}33` 
                                : `0 0 0 4px ${THEME_COLORS.info[500]}33`,
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = errors.nameError ? THEME_COLORS.error[400] : THEME_COLORS.info[500];
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = errors.nameError ? THEME_COLORS.error[500] : DARK_THEME.border.default;
                        }}
                        onMouseEnter={(e) => {
                            if (!errors.nameError) {
                                e.target.style.borderColor = DARK_THEME.border.muted;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!errors.nameError) {
                                e.target.style.borderColor = DARK_THEME.border.default;
                            }
                        }}
                        placeholder="Enter your project name..."
                    />
                    {formState.projectName && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-3 h-3 rounded-full animate-pulse shadow-lg" 
                                 style={{ 
                                     backgroundColor: THEME_COLORS.success[500],
                                     boxShadow: `0 0 10px ${THEME_COLORS.success[500]}80`
                                 }}></div>
                        </div>
                    )}
                </div>
                {errors.nameError && (
                    <div className="text-sm mt-3 font-medium flex items-center space-x-2" 
                         style={{ color: THEME_COLORS.error[400] }}>
                        <div className="w-4 h-4 rounded-full flex-shrink-0" 
                             style={{ backgroundColor: THEME_COLORS.error[500] }}></div>
                        <span>{errors.nameError}</span>
                    </div>
                )}
            </div>

            {/* Privacy */}
            <div className="mb-12">
                <label className="block text-lg font-semibold mb-4" style={{ color: DARK_THEME.text.primary }}>
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
                    className="w-full p-4 rounded-lg transition-all duration-200 text-base font-medium hover:transform hover:-translate-y-0.5"
                    style={{
                        backgroundColor: THEME_COLORS.info[600],
                        color: DARK_THEME.text.primary,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = THEME_COLORS.info[700];
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = THEME_COLORS.info[600];
                    }}
                    type="button"
                >
                    Continue
                </button>
            </div>
        </>
    );
};