"use client";

import { Folder } from 'lucide-react';
import { NAVIGATION_ICONS, ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProjectOverview } from '../context/ProjectOverviewContext';

export function ConnectedPortfolios() {
  const { data } = useProjectOverview();
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'off_track': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_track': return 'On track';
      case 'at_risk': return 'At risk';
      case 'off_track': return 'Off track';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Connected portfolios</div>
        <button 
          className="transition-colors"
          style={{ color: theme.text.muted }}
          onMouseEnter={(e) => e.currentTarget.style.color = theme.text.secondary}
          onMouseLeave={(e) => e.currentTarget.style.color = theme.text.muted}
        >
          <ACTION_ICONS.create size={16} />
        </button>
      </div>
      
      {data.portfolios.length > 0 ? (
        <div className="space-y-3">
          {data.portfolios.map((portfolio) => (
            <div key={portfolio.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: portfolio.color }}
                />
                <NAVIGATION_ICONS.projects style={{ color: theme.text.muted }} size={16} />
                <div>
                  <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{portfolio.name}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(portfolio.status)}`} />
                  <span className="text-xs" style={{ color: theme.text.secondary }}>{getStatusText(portfolio.status)}</span>
                </div>
                
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: theme.background.tertiary,
                    color: theme.text.primary
                  }}
                >
                  {portfolio.owner.avatar}
                </div>
                
                <button className="text-gray-400 hover:text-gray-600">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Folder className="mx-auto mb-3 text-gray-400" size={24} />
          <p className="text-sm text-gray-500 mb-3">
            Connect this project to a portfolio to track progress across multiple projects.
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Connect to portfolio
          </button>
        </div>
      )}
    </div>
  );
}