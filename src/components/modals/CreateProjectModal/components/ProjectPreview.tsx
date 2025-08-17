import React from 'react';
import { Circle, MessageCircle, Calendar } from 'lucide-react';
import { FormState } from '../types';

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
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 p-6">
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
                <div className="h-5 bg-gray-700 rounded flex-1 flex items-center px-3">
                    {formState.projectName ? (
                        <span className="text-white font-medium text-sm truncate">
                            {formState.projectName}
                        </span>
                    ) : (
                        <span className="text-gray-500 text-sm italic">
                            Enter project name...
                        </span>
                    )}
                </div>
            </div>
            <div className="h-3 bg-gray-600 rounded w-1/3 flex items-center px-2">
                <span className="text-gray-400 text-xs">
                    {formState.selectedPrivacy.label}
                </span>
            </div>
        </div>

        {/* Task List Rows */}
        <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                        <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className={`h-3 bg-gray-600 rounded ${
                            i === 0 ? 'w-32' : i === 1 ? 'w-24' : i === 2 ? 'w-28' : 
                            i === 3 ? 'w-20' : i === 4 ? 'w-36' : i === 5 ? 'w-24' : 
                            i === 6 ? 'w-30' : 'w-22'
                        }`}></div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-7 h-7 bg-gray-600 rounded-full"></div>
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <div className={`w-12 h-4 rounded ${
                            i === 0 ? 'bg-red-500' : i === 1 ? 'bg-purple-500' : 
                            i === 2 ? 'bg-green-500' : i === 3 ? 'bg-blue-500' :
                            i === 4 ? 'bg-green-500' : i === 5 ? 'bg-purple-500' :
                            i === 6 ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
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
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30 backdrop-blur-sm">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Project Timeline</h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{formState.selectedPrivacy.icon}</span>
                            <span className="text-blue-300 font-semibold">
                                {formState.projectName || 'Project Name'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Enhanced Date Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl p-4 border border-green-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <span className="text-green-300 font-medium">Start Date</span>
                </div>
                <div className="text-white text-lg font-semibold">
                    {formState.startDate ? new Date(formState.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'Not set'}
                </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-xl p-4 border border-red-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <span className="text-red-300 font-medium">End Date</span>
                </div>
                <div className="text-white text-lg font-semibold">
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
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30 mb-8">
                <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300 mb-2">
                        {Math.ceil((new Date(formState.endDate).getTime() - new Date(formState.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-blue-200 font-medium">Days Duration</div>
                </div>
            </div>
        )}

        {/* Enhanced Timeline Visualization */}
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Project Phases</span>
            </h4>
            
            <div className="space-y-4">
                {[
                    { name: 'Planning & Design', progress: 100, color: 'from-blue-500 to-blue-600', bgColor: 'from-blue-900/20 to-blue-800/10', borderColor: 'border-blue-500/20' },
                    { name: 'Development', progress: 75, color: 'from-green-500 to-green-600', bgColor: 'from-green-900/20 to-green-800/10', borderColor: 'border-green-500/20' },
                    { name: 'Testing & Launch', progress: 25, color: 'from-yellow-500 to-yellow-600', bgColor: 'from-yellow-900/20 to-yellow-800/10', borderColor: 'border-yellow-500/20' }
                ].map((phase, i) => (
                    <div key={i} className={`bg-gradient-to-r ${phase.bgColor} rounded-xl p-4 border ${phase.borderColor} backdrop-blur-sm`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium">{phase.name}</span>
                            <span className="text-gray-300 text-sm">{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className={`h-full bg-gradient-to-r ${phase.color} transition-all duration-1000 ease-out shadow-lg`}
                                style={{ width: `${phase.progress}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-sm text-gray-400 mt-6 px-2">
                <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Start</span>
                </span>
                <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Current</span>
                </span>
                <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Target</span>
                </span>
            </div>
        </div>
    </>
);