import { useState, useEffect } from 'react';
import { GoalListItem } from '@/types/goals';
import { getTeamGoals } from '@/services/progressService';

export function useTeamGoals() {
  const [goals, setGoals] = useState<GoalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamGoals = await getTeamGoals();
      setGoals(teamGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const refreshGoals = () => {
    fetchGoals();
  };

  const toggleGoalExpanded = (goalId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, isExpanded: !goal.isExpanded }
          : goal
      )
    );
  };

  return {
    goals,
    loading,
    error,
    refreshGoals,
    toggleGoalExpanded
  };
}
