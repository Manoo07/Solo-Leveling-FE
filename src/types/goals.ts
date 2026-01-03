export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  dueDate?: string;
  linkedHabitIds: string[];
  visibility: 'private' | 'team' | 'org';
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'trophy' | 'medal' | 'star' | 'crown' | 'flame' | 'target' | 'zap' | 'heart';
  criteria: {
    type: 'streak' | 'total_completions' | 'goals_completed' | 'habits_count' | 'perfect_week';
    value: number;
  };
  color: string;
  earnedAt?: string;
  isEarned: boolean;
}

export interface Achievement {
  id: string;
  type: 'badge_earned' | 'goal_completed' | 'milestone_reached' | 'streak_record';
  title: string;
  description: string;
  earnedAt: string;
  relatedId?: string;
  icon: string;
  color: string;
}

export const DEFAULT_BADGES: Omit<Badge, 'earnedAt' | 'isEarned'>[] = [
  {
    id: 'first_habit',
    name: 'First Step',
    description: 'Create your first habit',
    icon: 'star',
    criteria: { type: 'habits_count', value: 1 },
    color: '#f59e0b',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    criteria: { type: 'streak', value: 7 },
    color: '#ef4444',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'flame',
    criteria: { type: 'streak', value: 30 },
    color: '#f97316',
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    icon: 'crown',
    criteria: { type: 'streak', value: 100 },
    color: '#8b5cf6',
  },
  {
    id: 'total_50',
    name: 'Fifty Strong',
    description: 'Complete 50 habit entries',
    icon: 'medal',
    criteria: { type: 'total_completions', value: 50 },
    color: '#22c55e',
  },
  {
    id: 'total_100',
    name: 'Centurion',
    description: 'Complete 100 habit entries',
    icon: 'trophy',
    criteria: { type: 'total_completions', value: 100 },
    color: '#3b82f6',
  },
  {
    id: 'total_500',
    name: 'Habit Legend',
    description: 'Complete 500 habit entries',
    icon: 'crown',
    criteria: { type: 'total_completions', value: 500 },
    color: '#ec4899',
  },
  {
    id: 'habits_5',
    name: 'Multi-Tracker',
    description: 'Track 5 habits simultaneously',
    icon: 'target',
    criteria: { type: 'habits_count', value: 5 },
    color: '#14b8a6',
  },
  {
    id: 'goal_first',
    name: 'Goal Getter',
    description: 'Complete your first goal',
    icon: 'target',
    criteria: { type: 'goals_completed', value: 1 },
    color: '#6366f1',
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all habits for 7 consecutive days',
    icon: 'zap',
    criteria: { type: 'perfect_week', value: 1 },
    color: '#eab308',
  },
];

export interface GoalsState {
  goals: Goal[];
  milestones: Milestone[];
  achievements: Achievement[];
  earnedBadgeIds: string[];
}
