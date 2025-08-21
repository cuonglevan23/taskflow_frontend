import React from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
    currentStep, 
    totalSteps 
}) => {
    return (
        <div className="flex items-center mb-8">
            <div className="flex items-center space-x-4">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep >= stepNumber;
                    const isLast = stepNumber === totalSteps;
                    
                    return (
                        <React.Fragment key={stepNumber}>
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                                style={{
                                    backgroundColor: isActive ? THEME_COLORS.info[600] : DARK_THEME.background.tertiary,
                                    color: isActive ? DARK_THEME.text.primary : DARK_THEME.text.muted
                                }}
                            >
                                {stepNumber}
                            </div>
                            {!isLast && (
                                <div 
                                    className="w-16 h-0.5"
                                    style={{
                                        backgroundColor: currentStep > stepNumber 
                                            ? THEME_COLORS.info[600] 
                                            : DARK_THEME.background.tertiary
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <span className="ml-4 text-sm" style={{ color: DARK_THEME.text.muted }}>
                Step {currentStep} of {totalSteps}
            </span>
        </div>
    );
};