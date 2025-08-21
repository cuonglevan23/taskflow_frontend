"use client";

import { useState } from 'react';
import { ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProjectOverview } from '../context/ProjectOverviewContext';


export function ProjectStatus() {
  const { data, updateProjectStatus, loading } = useProjectOverview();
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const statusOptions = [
        {
            value: 'PLANNED',
            label: 'Planned',
            color: 'bg-blue-500 border-blue-600 text-white',
            bgColor: 'bg-blue-500',
            icon: '📋'
        },
        {
            value: 'IN_PROGRESS',
            label: 'In Progress',
            color: 'bg-orange-500 border-orange-600 text-white',
            bgColor: 'bg-orange-500',
            icon: '🚀'
        },
        {
            value: 'COMPLETED',
            label: 'Completed',
            color: 'bg-green-500 border-green-600 text-white',
            bgColor: 'bg-green-500',
            icon: '✅'
        },
        {
            value: 'AT_RISK',
            label: 'At Risk',
            color: 'bg-yellow-500 border-yellow-600 text-white',
            bgColor: 'bg-yellow-500',
            icon: '⚠️'
        },
        {
            value: 'BLOCKED',
            label: 'Blocked',
            color: 'bg-red-500 border-red-600 text-white',
            bgColor: 'bg-red-500',
            icon: '🚫'
        },
        {
            value: 'CANCELLED',
            label: 'Cancelled',
            color: 'bg-gray-500 border-gray-600 text-white',
            bgColor: 'bg-gray-500',
            icon: '❌'
        }
    ];

  const currentStatus = statusOptions.find(s => s.value === data.projectStatus) || statusOptions[0];

  const handleStatusChange = async (newStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED' | 'CANCELLED') => {
    await updateProjectStatus(newStatus);
    setIsDropdownOpen(false);
  };

  return (
    <>
        <div className="flex items-center justify-between mb-4 p-4 border rounded-lg" style={{ 
          borderColor: theme.border.default, 
          backgroundColor: theme.background.primary 
        }}>
     <span className={`${currentStatus.bgColor} text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1`}>
  <span>{currentStatus.icon}</span>
  {currentStatus.label}
</span>

            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md transition-colors disabled:opacity-50"
                    style={{
                        color: theme.text.primary,
                        borderColor: theme.border.default,
                        backgroundColor: theme.background.primary
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.secondary}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.background.primary}
                >
                    Update status
                    {isDropdownOpen ? <ACTION_ICONS.arrowUp size={16}/> : <ACTION_ICONS.down size={16}/>}
                </button>

                {isDropdownOpen && (
                    <div
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="p-1">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value as any)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 ${
                                        option.value === data.projectStatus ? 'bg-gray-100' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{option.icon}</span>
                                        <div
                                            className={`w-3 h-3 rounded-full ${option.bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`}/>
                                        {option.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 border rounded-lg space-y-3" style={{ 
          borderColor: theme.border.default, 
          backgroundColor: theme.background.secondary 
        }}>
        <div className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.text.primary }}>
          {currentStatus.icon} {currentStatus.label}
        </div>
        <div className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
          {data.projectStatus === 'PLANNED' && 'This project is in the planning phase. Tasks and timelines are being defined.'}
          {data.projectStatus === 'IN_PROGRESS' && 'This project is actively being worked on and making progress.'}
          {data.projectStatus === 'COMPLETED' && 'This project has been successfully completed and all deliverables are finished.'}
          {data.projectStatus === 'AT_RISK' && 'This project has some challenges that need attention to stay on track.'}
          {data.projectStatus === 'BLOCKED' && 'This project is currently blocked and cannot proceed without resolving issues.'}
          {data.projectStatus === 'CANCELLED' && 'This project has been cancelled and will not be completed.'}
        </div>
        <div className="text-sm" style={{ color: theme.text.muted }}>
          Summary: This is a sample project status update in Asana.
        </div>
      </div>
    </>
  );
}