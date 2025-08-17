import React from 'react';

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
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    isActive 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-700 text-gray-400'
                                }`}
                            >
                                {stepNumber}
                            </div>
                            {!isLast && (
                                <div 
                                    className={`w-16 h-0.5 ${
                                        currentStep > stepNumber 
                                            ? 'bg-blue-600' 
                                            : 'bg-gray-700'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <span className="ml-4 text-sm text-gray-400">
                Step {currentStep} of {totalSteps}
            </span>
        </div>
    );
};