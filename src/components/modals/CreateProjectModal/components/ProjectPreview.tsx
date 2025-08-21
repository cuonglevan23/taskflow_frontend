import React from 'react';
import { Circle, MessageCircle, Calendar } from 'lucide-react';
import { FormState } from '../types';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

interface ProjectPreviewProps {
    currentStep: number;
    formState: FormState;
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({
    currentStep,
    formState
}) => {
    return (
        <div className="w-full max-w-4xl">
            <div className="rounded-xl overflow-hidden shadow-2xl border p-6" 
                 style={{ 
                     backgroundColor: DARK_THEME.background.primary,
                     borderColor: DARK_THEME.border.default
                 }}>
                <div className="relative">
                    {/* Step 1 Preview */}
                    {currentStep === 1 && (
                        <Step1Preview formState={formState} />
                    )}

                    {/* Step 2 Preview */}
                    {currentStep === 2 && (
                        <Step2Preview formState={formState} />
                    )}
                </div>
            </div>
        </div>
    );
};

const Step1Preview: React.FC<{ formState: FormState }> = ({ formState }) => (
    <>
        {/* Project Header */}
        <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
                <span className="text-xl">{formState.selectedPrivacy.icon}</span>
                <div className="h-5 rounded flex-1 flex items-center px-3" 
                     style={{ backgroundColor: DARK_THEME.background.tertiary }}>
                    {formState.projectName ? (
                        <span className="font-medium text-sm truncate" 
                              style={{ color: DARK_THEME.text.primary }}>
                            {formState.projectName}
                        </span>
                    ) : (
                        <span className="text-sm italic" 
                              style={{ color: DARK_THEME.text.muted }}>
                            Enter project name...
                        </span>
                    )}
                </div>
            </div>
            <div className="h-3 rounded w-1/3 flex items-center px-2" 
                 style={{ backgroundColor: DARK_THEME.background.muted }}>
                <span className="text-xs" style={{ color: DARK_THEME.text.muted }}>
                    {formState.selectedPrivacy.label}
                </span>
            </div>
        </div>

        {/* Task List Rows */}
        <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" 
                     style={{ backgroundColor: DARK_THEME.background.secondary }}>
                    <div className="flex items-center space-x-3 flex-1">
                        <Circle className="w-4 h-4 flex-shrink-0" style={{ color: DARK_THEME.text.muted }} />
                        <div className={`h-3 rounded ${
                            i === 0 ? 'w-32' : i === 1 ? 'w-24' : i === 2 ? 'w-28' : 
                            i === 3 ? 'w-20' : i === 4 ? 'w-36' : i === 5 ? 'w-24' : 
                            i === 6 ? 'w-30' : 'w-22'
                        }`} style={{ backgroundColor: DARK_THEME.background.muted }}></div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full" 
                             style={{ backgroundColor: DARK_THEME.background.muted }}></div>
                        <MessageCircle className="w-4 h-4" style={{ color: DARK_THEME.text.muted }} />
                        <div className={`w-12 h-4 rounded`}
                             style={{
                                 backgroundColor: i === 0 ? THEME_COLORS.error[500] : i === 1 ? THEME_COLORS.secondary[600] : 
                                                  i === 2 ? THEME_COLORS.success[500] : i === 3 ? THEME_COLORS.info[500] :
                                                  i === 4 ? THEME_COLORS.success[500] : i === 5 ? THEME_COLORS.secondary[600] :
                                                  i === 6 ? THEME_COLORS.error[500] : THEME_COLORS.warning[500]
                             }}></div>
                    </div>
                </div>
            ))}
        </div>
    </>
);

const Step2Preview: React.FC<{ formState: FormState }> = ({ formState }) => (
    <>
        {/* Enhanced Timeline Header */}
        <div className="mb-8">
            <div className="rounded-xl p-6 border backdrop-blur-sm" 
                 style={{ 
                     background: `linear-gradient(to right, ${THEME_COLORS.info[900]}4D, ${THEME_COLORS.secondary[900]}4D)`,
                     borderColor: `${THEME_COLORS.info[500]}4D`
                 }}>
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" 
                         style={{ 
                             background: `linear-gradient(to bottom right, ${THEME_COLORS.info[500]}, ${THEME_COLORS.secondary[600]})`
                         }}>
                        <Calendar className="w-6 h-6" style={{ color: DARK_THEME.text.primary }} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1" style={{ color: DARK_THEME.text.primary }}>Project Timeline</h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{formState.selectedPrivacy.icon}</span>
                            <span className="font-semibold" style={{ color: THEME_COLORS.info[300] }}>
                                {formState.projectName || 'Project Name'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Enhanced Date Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl p-4 border backdrop-blur-sm" 
                 style={{ 
                     background: `linear-gradient(to bottom right, ${THEME_COLORS.success[900]}33, ${THEME_COLORS.success[800]}1A)`,
                     borderColor: `${THEME_COLORS.success[500]}33`
                 }}>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                         style={{ backgroundColor: THEME_COLORS.success[500] }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_THEME.text.primary }}></div>
                    </div>
                    <span className="font-medium" style={{ color: THEME_COLORS.success[300] }}>Start Date</span>
                </div>
                <div className="text-lg font-semibold" style={{ color: DARK_THEME.text.primary }}>
                    {formState.startDate ? new Date(formState.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'Not set'}
                </div>
            </div>

            <div className="rounded-xl p-4 border backdrop-blur-sm" 
                 style={{ 
                     background: `linear-gradient(to bottom right, ${THEME_COLORS.error[900]}33, ${THEME_COLORS.error[800]}1A)`,
                     borderColor: `${THEME_COLORS.error[500]}33`
                 }}>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                         style={{ backgroundColor: THEME_COLORS.error[500] }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_THEME.text.primary }}></div>
                    </div>
                    <span className="font-medium" style={{ color: THEME_COLORS.error[300] }}>End Date</span>
                </div>
                <div className="text-lg font-semibold" style={{ color: DARK_THEME.text.primary }}>
                    {formState.endDate ? new Date(formState.endDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'Not set'}
                </div>
            </div>
        </div>

        {/* Duration Card */}
        {formState.startDate && formState.endDate && (
            <div className="rounded-xl p-6 border mb-8" 
                 style={{ 
                     background: `linear-gradient(to right, ${THEME_COLORS.info[900]}4D, ${THEME_COLORS.secondary[900]}4D)`,
                     borderColor: `${THEME_COLORS.info[500]}4D`
                 }}>
                <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: THEME_COLORS.info[300] }}>
                        {Math.ceil((new Date(formState.endDate).getTime() - new Date(formState.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="font-medium" style={{ color: THEME_COLORS.info[200] }}>Days Duration</div>
                </div>
            </div>
        )}

        {/* Enhanced Timeline Visualization */}
        <div className="space-y-6">
            <h4 className="text-lg font-semibold flex items-center space-x-2" style={{ color: DARK_THEME.text.primary }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: THEME_COLORS.info[500] }}></div>
                <span>Project Phases</span>
            </h4>
            
            <div className="space-y-4">
                {[
                    { name: 'Planning & Design', progress: 100, colorFrom: THEME_COLORS.info[500], colorTo: THEME_COLORS.info[600], bgColor: `${THEME_COLORS.info[900]}33`, borderColor: `${THEME_COLORS.info[500]}33` },
                    { name: 'Development', progress: 75, colorFrom: THEME_COLORS.success[500], colorTo: THEME_COLORS.success[600], bgColor: `${THEME_COLORS.success[900]}33`, borderColor: `${THEME_COLORS.success[500]}33` },
                    { name: 'Testing & Launch', progress: 25, colorFrom: THEME_COLORS.warning[500], colorTo: THEME_COLORS.warning[600], bgColor: `${THEME_COLORS.warning[900]}33`, borderColor: `${THEME_COLORS.warning[500]}33` }
                ].map((phase, i) => (
                    <div key={i} className="rounded-xl p-4 border backdrop-blur-sm" 
                         style={{ 
                             background: `linear-gradient(to right, ${phase.bgColor}, ${phase.bgColor})`,
                             borderColor: phase.borderColor
                         }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-medium" style={{ color: DARK_THEME.text.primary }}>{phase.name}</span>
                            <span className="text-sm" style={{ color: DARK_THEME.text.secondary }}>{phase.progress}%</span>
                        </div>
                        <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: DARK_THEME.background.tertiary }}>
                            <div 
                                className="h-full transition-all duration-1000 ease-out shadow-lg"
                                style={{ 
                                    width: `${phase.progress}%`,
                                    background: `linear-gradient(to right, ${phase.colorFrom}, ${phase.colorTo})`
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-sm mt-6 px-2" style={{ color: DARK_THEME.text.muted }}>
                <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME_COLORS.success[500] }}></div>
                    <span>Start</span>
                </span>
                <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: THEME_COLORS.info[500] }}></div>
                    <span>Current</span>
                </span>
                <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME_COLORS.error[500] }}></div>
                    <span>Target</span>
                </span>
            </div>
        </div>
    </>
);