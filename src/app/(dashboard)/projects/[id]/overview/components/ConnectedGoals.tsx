"use client";

import { useState } from 'react';
import { NAVIGATION_ICONS, ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProjectOverview } from '../context/ProjectOverviewContext';

export function ConnectedGoals() {
  const { data, addGoal, updateGoal, loading } = useProjectOverview();
  const { theme } = useTheme();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    progress: 0,
    status: 'not_started' as const
  });

  const handleAddGoal = async () => {
    if (newGoal.title) {
      await addGoal(newGoal);
      setNewGoal({ title: '', description: '', progress: 0, status: 'not_started' });
      setIsAddingGoal(false);
    }
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
    await updateGoal(goalId, { progress, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Connected goals</div>
      
      {data.goals.length > 0 ? (
        <div className="space-y-3">
          {data.goals.map((goal) => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <NAVIGATION_ICONS.goals className="mt-1 text-blue-500" size={16} />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm" style={{ color: theme.text.primary }}>{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>{goal.description}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                  {goal.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: theme.text.secondary }}>Progress</span>
                  <span className="font-medium" style={{ color: theme.text.primary }}>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="border border-dashed rounded-lg p-6 text-center"
          style={{ 
            borderColor: theme.border.default,
            backgroundColor: theme.background.secondary
          }}
        >
          <NAVIGATION_ICONS.goals className="mx-auto mb-3" size={24} style={{ color: theme.text.muted }} />
          <p className="text-sm mb-3" style={{ color: theme.text.secondary }}>
            Connect or create a goal to link this project to a larger purpose.
          </p>
        </div>
      )}

      {/* Add Goal Section */}
      {isAddingGoal ? (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Goal title"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Goal description (optional)"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddGoal}
              disabled={loading || !newGoal.title}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Goal'}
            </button>
            <button
              onClick={() => setIsAddingGoal(false)}
              className="px-3 py-1.5 border text-sm rounded-md transition-colors"
              style={{
                borderColor: theme.border.default,
                color: theme.text.primary,
                backgroundColor: theme.background.primary
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.secondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.background.primary}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#3b82f6' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
        >
          <ACTION_ICONS.create size={16} />
          <span>Add goal</span>
        </button>
      )}
    </div>
  );
}