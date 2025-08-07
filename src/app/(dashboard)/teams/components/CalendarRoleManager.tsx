"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { User, Crown, Shield, Settings, Users } from "lucide-react";

export type UserRole = 'member' | 'leader' | 'pm' | 'owner' | 'admin';

interface UserRoleConfig {
  role: UserRole;
  label: string;
  icon: React.ElementType;
  permissions: {
    viewPersonalCalendar: boolean;
    viewTeamCalendar: boolean;
    viewProjectCalendar: boolean;
    viewResourceCalendar: boolean;
    editOwnTasks: boolean;
    editTeamTasks: boolean;
    manageResources: boolean;
  };
}

interface CalendarViewConfig {
  id: string;
  label: string;
  description: string;
  visible: boolean;
  color: string;
}

const CalendarRoleManager = () => {
  const { theme } = useTheme();
  const [currentRole, setCurrentRole] = useState<UserRole>('member');

  const roleConfigs: UserRoleConfig[] = [
    {
      role: 'member',
      label: 'Member',
      icon: User,
      permissions: {
        viewPersonalCalendar: true,
        viewTeamCalendar: true,
        viewProjectCalendar: false,
        viewResourceCalendar: false,
        editOwnTasks: true,
        editTeamTasks: false,
        manageResources: false,
      }
    },
    {
      role: 'leader',
      label: 'Team Leader',
      icon: Users,
      permissions: {
        viewPersonalCalendar: true,
        viewTeamCalendar: true,
        viewProjectCalendar: true,
        viewResourceCalendar: false,
        editOwnTasks: true,
        editTeamTasks: true,
        manageResources: false,
      }
    },
    {
      role: 'pm',
      label: 'Project Manager',
      icon: Settings,
      permissions: {
        viewPersonalCalendar: true,
        viewTeamCalendar: true,
        viewProjectCalendar: true,
        viewResourceCalendar: true,
        editOwnTasks: true,
        editTeamTasks: true,
        manageResources: false,
      }
    },
    {
      role: 'owner',
      label: 'Owner',
      icon: Crown,
      permissions: {
        viewPersonalCalendar: true,
        viewTeamCalendar: true,
        viewProjectCalendar: true,
        viewResourceCalendar: true,
        editOwnTasks: true,
        editTeamTasks: true,
        manageResources: true,
      }
    },
    {
      role: 'admin',
      label: 'Admin',
      icon: Shield,
      permissions: {
        viewPersonalCalendar: true,
        viewTeamCalendar: true,
        viewProjectCalendar: true,
        viewResourceCalendar: true,
        editOwnTasks: true,
        editTeamTasks: true,
        manageResources: true,
      }
    }
  ];

  const getCalendarViewsForRole = (role: UserRole): CalendarViewConfig[] => {
    const config = roleConfigs.find(r => r.role === role);
    if (!config) return [];

    const views: CalendarViewConfig[] = [];

    if (config.permissions.viewPersonalCalendar) {
      views.push({
        id: 'personal',
        label: 'Personal Calendar',
        description: 'Your personal tasks and events',
        visible: true,
        color: '#3B82F6'
      });
    }

    if (config.permissions.viewTeamCalendar) {
      views.push({
        id: 'team',
        label: 'Team Calendar',
        description: 'Team events and collaborative tasks',
        visible: true,
        color: '#10B981'
      });
    }

    if (config.permissions.viewProjectCalendar) {
      views.push({
        id: 'project',
        label: 'Project Calendar',
        description: 'Project milestones and deadlines',
        visible: true,
        color: '#F59E0B'
      });
    }

    if (config.permissions.viewResourceCalendar) {
      views.push({
        id: 'resource',
        label: 'Resource Management',
        description: 'Resource allocation and management',
        visible: true,
        color: '#EF4444'
      });
    }

    return views;
  };

  const currentConfig = roleConfigs.find(r => r.role === currentRole);
  const availableViews = getCalendarViewsForRole(currentRole);

  return (
    <div className="p-6 space-y-6">
      {/* Role Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
          Calendar Role Management
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {roleConfigs.map((config) => {
            const IconComponent = config.icon;
            const isActive = currentRole === config.role;
            
            return (
              <button
                key={config.role}
                onClick={() => setCurrentRole(config.role)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  backgroundColor: isActive ? '#3B82F620' : theme.background.secondary,
                  color: isActive ? '#3B82F6' : theme.text.primary,
                  border: `1px solid ${isActive ? '#3B82F6' : theme.border.default}`
                }}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Role Info */}
      {currentConfig && (
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default 
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <currentConfig.icon className="w-5 h-5" style={{ color: '#3B82F6' }} />
            <h4 className="font-semibold" style={{ color: theme.text.primary }}>
              {currentConfig.label} Permissions
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2" style={{ color: theme.text.secondary }}>
                Calendar Views:
              </p>
              <ul className="space-y-1">
                <li className={currentConfig.permissions.viewPersonalCalendar ? 'text-green-600' : 'text-gray-400'}>
                  ✓ Personal Calendar
                </li>
                <li className={currentConfig.permissions.viewTeamCalendar ? 'text-green-600' : 'text-gray-400'}>
                  ✓ Team Calendar
                </li>
                <li className={currentConfig.permissions.viewProjectCalendar ? 'text-green-600' : 'text-gray-400'}>
                  {currentConfig.permissions.viewProjectCalendar ? '✓' : '✗'} Project Calendar
                </li>
                <li className={currentConfig.permissions.viewResourceCalendar ? 'text-green-600' : 'text-gray-400'}>
                  {currentConfig.permissions.viewResourceCalendar ? '✓' : '✗'} Resource Management
                </li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2" style={{ color: theme.text.secondary }}>
                Edit Permissions:
              </p>
              <ul className="space-y-1">
                <li className={currentConfig.permissions.editOwnTasks ? 'text-green-600' : 'text-gray-400'}>
                  ✓ Edit Own Tasks
                </li>
                <li className={currentConfig.permissions.editTeamTasks ? 'text-green-600' : 'text-gray-400'}>
                  {currentConfig.permissions.editTeamTasks ? '✓' : '✗'} Edit Team Tasks
                </li>
                <li className={currentConfig.permissions.manageResources ? 'text-green-600' : 'text-gray-400'}>
                  {currentConfig.permissions.manageResources ? '✓' : '✗'} Manage Resources
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Available Calendar Views */}
      <div className="space-y-4">
        <h4 className="font-semibold" style={{ color: theme.text.primary }}>
          Available Calendar Views for {currentConfig?.label}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableViews.map((view) => (
            <div
              key={view.id}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: theme.background.primary,
                borderColor: view.color,
                borderWidth: '2px'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: view.color }}
                />
                <h5 className="font-medium" style={{ color: theme.text.primary }}>
                  {view.label}
                </h5>
              </div>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                {view.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarRoleManager;