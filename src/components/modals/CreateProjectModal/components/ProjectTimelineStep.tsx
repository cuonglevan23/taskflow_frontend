import React from 'react';
import { Calendar } from 'lucide-react';
import { StepProps } from '../types';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

interface ProjectTimelineStepProps extends Pick<
    StepProps, 
    'formState' | 'errors' | 'onStartDateChange' | 'onEndDateChange' | 'onCreateProject'
> {}

export const ProjectTimelineStep: React.FC<ProjectTimelineStepProps> = ({
    formState,
    errors,
    onStartDateChange,
    onEndDateChange,
    onCreateProject
}) => {
    return (
        <>
            <div className="mb-8">
                <h2 className="text-xl font-medium mb-4" style={{ color: DARK_THEME.text.primary }}>Set project timeline</h2>
                <p className="text-sm mb-6" style={{ color: DARK_THEME.text.muted }}>
                    Choose start and end dates for your project to help track progress and deadlines.
                </p>
            </div>

            {/* Start Date */}
            <div className="mb-8">
                <label className="block text-lg font-semibold mb-4" style={{ color: DARK_THEME.text.primary }}>
                    Start date
                </label>
                <div className="relative">
                    <input
                        type="date"
                        value={formState.startDate}
                        onChange={onStartDateChange}
                        className="w-full p-5 rounded-xl border-2 transition-all duration-300 text-lg backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: `${DARK_THEME.background.secondary}99`,
                            color: DARK_THEME.text.primary,
                            borderColor: errors.dateError ? THEME_COLORS.error[500] : DARK_THEME.border.default,
                            boxShadow: errors.dateError 
                                ? `0 0 0 4px ${THEME_COLORS.error[500]}33` 
                                : `0 0 0 4px ${THEME_COLORS.info[500]}33`,
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = errors.dateError ? THEME_COLORS.error[400] : THEME_COLORS.info[500];
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = errors.dateError ? THEME_COLORS.error[500] : DARK_THEME.border.default;
                        }}
                        onMouseEnter={(e) => {
                            if (!errors.dateError) {
                                e.target.style.borderColor = DARK_THEME.border.muted;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!errors.dateError) {
                                e.target.style.borderColor = DARK_THEME.border.default;
                            }
                        }}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border" 
                             style={{ 
                                 background: `linear-gradient(to bottom right, ${THEME_COLORS.success[500]}33, ${THEME_COLORS.success[600]}33)`,
                                 borderColor: `${THEME_COLORS.success[500]}4D`
                             }}>
                            <Calendar className="w-5 h-5" style={{ color: THEME_COLORS.success[400] }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* End Date */}
            <div className="mb-8">
                <label className="block text-lg font-semibold mb-4" style={{ color: DARK_THEME.text.primary }}>
                    End date
                </label>
                <div className="relative">
                    <input
                        type="date"
                        value={formState.endDate}
                        onChange={onEndDateChange}
                        className="w-full p-5 rounded-xl border-2 transition-all duration-300 text-lg backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: `${DARK_THEME.background.secondary}99`,
                            color: DARK_THEME.text.primary,
                            borderColor: errors.dateError ? THEME_COLORS.error[500] : DARK_THEME.border.default,
                            boxShadow: errors.dateError 
                                ? `0 0 0 4px ${THEME_COLORS.error[500]}33` 
                                : `0 0 0 4px ${THEME_COLORS.info[500]}33`,
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = errors.dateError ? THEME_COLORS.error[400] : THEME_COLORS.info[500];
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = errors.dateError ? THEME_COLORS.error[500] : DARK_THEME.border.default;
                        }}
                        onMouseEnter={(e) => {
                            if (!errors.dateError) {
                                e.target.style.borderColor = DARK_THEME.border.muted;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!errors.dateError) {
                                e.target.style.borderColor = DARK_THEME.border.default;
                            }
                        }}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border" 
                             style={{ 
                                 background: `linear-gradient(to bottom right, ${THEME_COLORS.error[500]}33, ${THEME_COLORS.error[600]}33)`,
                                 borderColor: `${THEME_COLORS.error[500]}4D`
                             }}>
                            <Calendar className="w-5 h-5" style={{ color: THEME_COLORS.error[400] }} />
                        </div>
                    </div>
                </div>
                {errors.dateError && (
                    <div className="text-sm mt-3 font-medium flex items-center space-x-2" 
                         style={{ color: THEME_COLORS.error[400] }}>
                        <div className="w-4 h-4 rounded-full flex-shrink-0" 
                             style={{ backgroundColor: THEME_COLORS.error[500] }}></div>
                        <span>{errors.dateError}</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="max-w-md w-full space-y-4 mt-8">
                <button
                    onClick={onCreateProject}
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
                    Create Project
                </button>
            </div>
        </>
    );
};