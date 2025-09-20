"use client";

import { useState } from 'react';
import { ACTION_ICONS } from '@/constants/icons';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import { useProjectOverview } from '../context/ProjectOverviewContext';


export function ProjectStatus() {
  const { data, updateProjectStatus, loading } = useProjectOverview();
  const { theme, themeMode } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Safe theme color access with fallbacks
  const getThemeColor = (colorPath: string, fallback: string = '') => {
    if (!theme) return fallback;
    const keys = colorPath.split('.');
    let value: any = theme;
    for (const key of keys) {
      value = value?.[key];
      if (!value) return fallback;
    }
    return value;
  };

  // Get translated messages from config/i18n/messages
  const statusMessages = messages?.projectOverview?.status || {};

  const statusOptions = [
    {
      value: 'PLANNED',
      label: statusMessages.planned || '계획됨',
      color: 'bg-blue-500 border-blue-600 text-white',
      bgColor: 'bg-blue-500',
      icon: '📋'
    },
    {
      value: 'IN_PROGRESS',
      label: statusMessages.inProgress || '진행 중',
      color: 'bg-orange-500 border-orange-600 text-white',
      bgColor: 'bg-orange-500',
      icon: '🚀'
    },
    {
      value: 'COMPLETED',
      label: statusMessages.completed || '완료',
      color: 'bg-green-500 border-green-600 text-white',
      bgColor: 'bg-green-500',
      icon: '✅'
    },
    {
      value: 'AT_RISK',
      label: statusMessages.atRisk || '위험',
      color: 'bg-yellow-500 border-yellow-600 text-white',
      bgColor: 'bg-yellow-500',
      icon: '⚠️'
    },
    {
      value: 'BLOCKED',
      label: statusMessages.blocked || '차단됨',
      color: 'bg-red-500 border-red-600 text-white',
      bgColor: 'bg-red-500',
      icon: '🚫'
    },
    {
      value: 'CANCELLED',
      label: statusMessages.cancelled || '취소됨',
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

  // Show loading state while language is loading
  if (languageLoading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Status descriptions based on current status
  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return statusMessages.plannedDesc || '이 프로젝트는 계획 단계에 있습니다. 작업과 일정이 정의되고 있습니다.';
      case 'IN_PROGRESS':
        return statusMessages.inProgressDesc || '이 프로젝트는 활발히 진행되고 있으며 성과를 내고 있습니다.';
      case 'COMPLETED':
        return statusMessages.completedDesc || '이 프로젝트는 성공적으로 완료되었으며 모든 결과물이 완성되었습니다.';
      case 'AT_RISK':
        return statusMessages.atRiskDesc || '이 프로젝트는 궤도를 유지하기 위해 주의가 필요한 몇 가지 문제가 있습니다.';
      case 'BLOCKED':
        return statusMessages.blockedDesc || '이 프로젝트는 현재 차단되어 있으며 문제를 해결하지 않고은 진행할 수 없습니다.';
      case 'CANCELLED':
        return statusMessages.cancelledDesc || '이 프로젝트는 취소되었으며 완료되지 않습니다.';
      default:
        return '';
    }
  };

  return (
    <div className="w-full">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: getThemeColor('text.primary', '#0f172a') }}
      >
        {statusMessages.title || '프로젝트 상태'}
      </h3>

      <div
        className="flex items-center justify-between mb-4"
        style={{ color: getThemeColor('text.primary', '#0f172a') }}
      >
        <span className={`${currentStatus.bgColor} text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}>
          <span>{currentStatus.icon}</span>
          {currentStatus.label}
        </span>

        <div style={{ position: 'static' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md transition-colors disabled:opacity-50"
            style={{
              color: getThemeColor('text.primary', '#0f172a'),
              borderColor: getThemeColor('border.default', '#e2e8f0'),
              backgroundColor: getThemeColor('background.primary', '#ffffff'),
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getThemeColor('background.secondary', '#f8fafc')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getThemeColor('background.primary', '#ffffff')}
          >
            {statusMessages.updateStatus || '상태 업데이트'}
            {isDropdownOpen ? <ACTION_ICONS.arrowUp size={16}/> : <ACTION_ICONS.down size={16}/>}
          </button>

          {isDropdownOpen && (
            <div
              className="fixed w-48 border rounded-md shadow-lg z-[9999]"
              style={{
                backgroundColor: getThemeColor('background.primary', '#ffffff'),
                borderColor: getThemeColor('border.default', '#e2e8f0'),
                position: 'fixed',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)'
              }}
            >
              <div className="p-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value as any)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors"
                    style={{
                      color: getThemeColor('text.primary', '#0f172a'),
                      backgroundColor: option.value === data.projectStatus ? getThemeColor('background.secondary', '#f8fafc') : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getThemeColor('background.secondary', '#f8fafc')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = option.value === data.projectStatus ? getThemeColor('background.secondary', '#f8fafc') : 'transparent'}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{option.icon}</span>
                      <div className={`w-3 h-3 rounded-full ${option.bgColor}`}/>
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="p-4 rounded-lg"
        style={{
          borderColor: getThemeColor('border.default', '#e2e8f0'),
          backgroundColor: getThemeColor('background.secondary', '#f8fafc'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`,
          position: 'relative'
        }}
      >
        <div
          className="text-lg font-semibold flex items-center gap-2 mb-3"
          style={{ color: getThemeColor('text.primary', '#0f172a') }}
        >
          {currentStatus.icon} {currentStatus.label}
        </div>
        <div
          className="text-sm leading-relaxed"
          style={{ color: getThemeColor('text.secondary', '#64748b') }}
        >
          {getStatusDescription(data.projectStatus)}
        </div>
      </div>
    </div>
  );
}