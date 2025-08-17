import React from 'react';
import { Calendar } from 'lucide-react';
import { StepProps } from '../types';

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
                <h2 className="text-xl font-medium text-white mb-4">Set project timeline</h2>
                <p className="text-gray-400 text-sm mb-6">
                    Choose start and end dates for your project to help track progress and deadlines.
                </p>
            </div>

            {/* Start Date */}
            <div className="mb-8">
                <label className="block text-lg font-semibold mb-4 text-white">
                    Start date
                </label>
                <div className="relative">
                    <input
                        type="date"
                        value={formState.startDate}
                        onChange={onStartDateChange}
                        className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-lg bg-gray-800/60 backdrop-blur-sm text-white shadow-lg ${
                            errors.dateError 
                                ? 'border-red-500 focus:border-red-400 shadow-red-500/20' 
                                : 'border-gray-600/50 focus:border-blue-500 focus:shadow-blue-500/20 hover:border-gray-500/70'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
                            <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* End Date */}
            <div className="mb-8">
                <label className="block text-lg font-semibold mb-4 text-white">
                    End date
                </label>
                <div className="relative">
                    <input
                        type="date"
                        value={formState.endDate}
                        onChange={onEndDateChange}
                        className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-lg bg-gray-800/60 backdrop-blur-sm text-white shadow-lg ${
                            errors.dateError 
                                ? 'border-red-500 focus:border-red-400 shadow-red-500/20' 
                                : 'border-gray-600/50 focus:border-blue-500 focus:shadow-blue-500/20 hover:border-gray-500/70'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-rose-600/20 rounded-lg flex items-center justify-center border border-red-500/30">
                            <Calendar className="w-5 h-5 text-red-400" />
                        </div>
                    </div>
                </div>
                {errors.dateError && (
                    <p className="text-red-400 text-sm mt-3 font-medium flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span>{errors.dateError}</span>
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="max-w-md w-full space-y-4 mt-8">
                <button
                    onClick={onCreateProject}
                    className="w-full p-4 rounded-lg transition-all duration-200 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 hover:transform hover:-translate-y-0.5"
                    type="button"
                >
                    Create Project
                </button>
            </div>
        </>
    );
};