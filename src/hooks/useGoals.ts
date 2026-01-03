import { useState, useCallback, useMemo, useEffect } from 'react';
import { Goal, Milestone, Achievement, Badge, DEFAULT_BADGES, GoalsState } from '@/types/goals';
import { HabitWithStats } from '@/types/habit';

const STORAGE_KEY = 'solo-leveling-goals';

const loadFromStorage = (): GoalsState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load goals from storage:', e);
  }
  return {
    goals: [],
    milestones: [],
    achievements: [],
    earnedBadgeIds: [],
  };
};

const saveToStorage = (state: GoalsState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save goals to storage:', e);
  }
};

export const useGoals = (habits: HabitWithStats[]) => {
  const [state, setState] = useState<GoalsState>(loadFromStorage);

  // Save to storage when state changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Calculate badge eligibility based on habits
  const badges: Badge[] = useMemo(() => {
    const maxStreak = Math.max(0, ...habits.map(h => h.currentStreak));
    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
    const habitsCount = habits.length;
    const goalsCompleted = state.goals.filter(g => g.status === 'completed').length;

    // Check for perfect week (all habits completed for 7 days)
    let hasPerfectWeek = false;
    if (habits.length > 0) {
      const today = new Date();
      let perfectDays = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const allCompleted = habits.every(h => h.completions[dateStr]);
        if (allCompleted) perfectDays++;
      }
      hasPerfectWeek = perfectDays >= 7;
    }

    return DEFAULT_BADGES.map(badge => {
      let isEarned = state.earnedBadgeIds.includes(badge.id);
      
      if (!isEarned) {
        switch (badge.criteria.type) {
          case 'streak':
            isEarned = maxStreak >= badge.criteria.value;
            break;
          case 'total_completions':
            isEarned = totalCompletions >= badge.criteria.value;
            break;
          case 'habits_count':
            isEarned = habitsCount >= badge.criteria.value;
            break;
          case 'goals_completed':
            isEarned = goalsCompleted >= badge.criteria.value;
            break;
          case 'perfect_week':
            isEarned = hasPerfectWeek;
            break;
        }
      }

      return {
        ...badge,
        isEarned,
        earnedAt: isEarned && !state.earnedBadgeIds.includes(badge.id) 
          ? new Date().toISOString() 
          : state.achievements.find(a => a.relatedId === badge.id)?.earnedAt,
      };
    });
  }, [habits, state.goals, state.earnedBadgeIds, state.achievements]);

  // Check for newly earned badges and create achievements
  useEffect(() => {
    const newlyEarned = badges.filter(b => b.isEarned && !state.earnedBadgeIds.includes(b.id));
    
    if (newlyEarned.length > 0) {
      const newAchievements: Achievement[] = newlyEarned.map(badge => ({
        id: `achievement-${Date.now()}-${badge.id}`,
        type: 'badge_earned',
        title: `Earned: ${badge.name}`,
        description: badge.description,
        earnedAt: new Date().toISOString(),
        relatedId: badge.id,
        icon: badge.icon,
        color: badge.color,
      }));

      setState(prev => ({
        ...prev,
        earnedBadgeIds: [...prev.earnedBadgeIds, ...newlyEarned.map(b => b.id)],
        achievements: [...newAchievements, ...prev.achievements],
      }));
    }
  }, [badges, state.earnedBadgeIds]);

  // Goals CRUD
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'currentValue' | 'status'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentValue: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));

    return newGoal;
  }, []);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === goalId ? { ...g, ...updates } : g
      ),
    }));
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId),
      milestones: prev.milestones.filter(m => m.goalId !== goalId),
    }));
  }, []);

  const completeGoal = useCallback((goalId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const achievement: Achievement = {
      id: `achievement-${Date.now()}`,
      type: 'goal_completed',
      title: `Goal Completed: ${goal.title}`,
      description: `You've completed your goal!`,
      earnedAt: new Date().toISOString(),
      relatedId: goalId,
      icon: 'target',
      color: '#22c55e',
    };

    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === goalId 
          ? { ...g, status: 'completed', completedAt: new Date().toISOString() } 
          : g
      ),
      achievements: [achievement, ...prev.achievements],
    }));
  }, [state.goals]);

  // Auto-update goal progress based on linked habits
  useEffect(() => {
    const updatedGoals = state.goals.map(goal => {
      if (goal.status !== 'active' || goal.linkedHabitIds.length === 0) {
        return goal;
      }

      const linkedHabits = habits.filter(h => goal.linkedHabitIds.includes(h.id));
      const totalCompletions = linkedHabits.reduce((sum, h) => sum + h.totalCompletions, 0);
      
      return {
        ...goal,
        currentValue: totalCompletions,
      };
    });

    const hasChanges = updatedGoals.some((g, i) => g.currentValue !== state.goals[i]?.currentValue);
    
    if (hasChanges) {
      setState(prev => ({ ...prev, goals: updatedGoals }));
    }
  }, [habits, state.goals]);

  // Milestones
  const addMilestone = useCallback((milestone: Omit<Milestone, 'id' | 'isCompleted'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: `milestone-${Date.now()}`,
      isCompleted: false,
    };

    setState(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  }, []);

  const completeMilestone = useCallback((milestoneId: string) => {
    const milestone = state.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const achievement: Achievement = {
      id: `achievement-${Date.now()}`,
      type: 'milestone_reached',
      title: `Milestone: ${milestone.title}`,
      description: `Reached milestone in your goal!`,
      earnedAt: new Date().toISOString(),
      relatedId: milestoneId,
      icon: 'star',
      color: '#f59e0b',
    };

    setState(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => 
        m.id === milestoneId 
          ? { ...m, isCompleted: true, completedAt: new Date().toISOString() } 
          : m
      ),
      achievements: [achievement, ...prev.achievements],
    }));
  }, [state.milestones]);

  // Stats
  const stats = useMemo(() => ({
    totalGoals: state.goals.length,
    activeGoals: state.goals.filter(g => g.status === 'active').length,
    completedGoals: state.goals.filter(g => g.status === 'completed').length,
    earnedBadges: badges.filter(b => b.isEarned).length,
    totalBadges: badges.length,
    recentAchievements: state.achievements.slice(0, 5),
  }), [state.goals, badges, state.achievements]);

  return {
    goals: state.goals,
    milestones: state.milestones,
    achievements: state.achievements,
    badges,
    stats,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    addMilestone,
    completeMilestone,
  };
};
