"use client";

import { useState } from 'react';
import { ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProjectOverview } from '../context/ProjectOverviewContext';
import styles from '../styles/OverviewLayout.module.css';

export function ProjectStatus() {
  const { data, updateProjectStatus, loading } = useProjectOverview();
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const statusOptions = [
        {
            value: 'on_track',
            label: 'On track',
            color: 'bg-green-500 border-green-600 text-white',
            bgColor: 'bg-green-500'
        },
        {
            value: 'at_risk',
            label: 'At risk',
            color: 'bg-yellow-500 border-yellow-600 text-white',
            bgColor: 'bg-yellow-500'
        },
        {
            value: 'off_track',
            label: 'Off track',
            color: 'bg-red-500 border-red-600 text-white',
            bgColor: 'bg-red-500'
        }
    ];

  const currentStatus = statusOptions.find(s => s.value === data.projectStatus) || statusOptions[0];

  const handleStatusChange = async (newStatus: 'on_track' | 'at_risk' | 'off_track') => {
    await updateProjectStatus(newStatus);
    setIsDropdownOpen(false);
  };

  return (
    <>
        <div className={styles.statusHeader}>
     <span className={`${currentStatus.bgColor} text-white px-2 py-1 rounded text-xs font-medium`}>
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

        <div className={`${styles.statusContent} ${
            data.projectStatus === 'on_track' ? styles.statusOnTrack :
                data.projectStatus === 'at_risk' ? styles.statusAtRisk :
        styles.statusOffTrack
      }`}>
        <div className={styles.statusTitle}>{currentStatus.label}</div>
        <div className={styles.statusDescription}>
          {data.projectStatus === 'on_track' && 'This project is progressing well and meeting all milestones.'}
          {data.projectStatus === 'at_risk' && 'This project has some challenges that need attention.'}
          {data.projectStatus === 'off_track' && 'This project needs immediate attention to get back on track.'}
        </div>
        <div className={styles.statusSummary}>
          Summary: This is a sample project status update in Asana. 
          Use status updates to communicate the progress of your project with your teammates.
        </div>
      </div>
    </>
  );
}