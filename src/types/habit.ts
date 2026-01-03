import {
  Activity,
  Book,
  Brain,
  Briefcase,
  Coffee,
  Dumbbell,
  Heart,
  Leaf,
  Moon,
  Music,
  Palette,
  PenTool,
  Target,
  Timer,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  Sun,
  Droplets,
  type LucideIcon,
} from 'lucide-react';

export type HabitIconName = 
  | 'activity' | 'book' | 'brain' | 'briefcase' | 'coffee' 
  | 'dumbbell' | 'heart' | 'leaf' | 'moon' | 'music'
  | 'palette' | 'pen-tool' | 'target' | 'timer' | 'trending-up'
  | 'utensils' | 'wallet' | 'zap' | 'sun' | 'droplets';

export const HABIT_ICONS: Record<HabitIconName, LucideIcon> = {
  'activity': Activity,
  'book': Book,
  'brain': Brain,
  'briefcase': Briefcase,
  'coffee': Coffee,
  'dumbbell': Dumbbell,
  'heart': Heart,
  'leaf': Leaf,
  'moon': Moon,
  'music': Music,
  'palette': Palette,
  'pen-tool': PenTool,
  'target': Target,
  'timer': Timer,
  'trending-up': TrendingUp,
  'utensils': Utensils,
  'wallet': Wallet,
  'zap': Zap,
  'sun': Sun,
  'droplets': Droplets,
};

export const ICON_LIST: { name: HabitIconName; label: string }[] = [
  { name: 'activity', label: 'Activity' },
  { name: 'dumbbell', label: 'Exercise' },
  { name: 'heart', label: 'Health' },
  { name: 'brain', label: 'Mind' },
  { name: 'book', label: 'Reading' },
  { name: 'pen-tool', label: 'Writing' },
  { name: 'briefcase', label: 'Work' },
  { name: 'target', label: 'Goals' },
  { name: 'timer', label: 'Time' },
  { name: 'trending-up', label: 'Growth' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'utensils', label: 'Nutrition' },
  { name: 'droplets', label: 'Water' },
  { name: 'moon', label: 'Sleep' },
  { name: 'sun', label: 'Morning' },
  { name: 'leaf', label: 'Nature' },
  { name: 'music', label: 'Music' },
  { name: 'palette', label: 'Creative' },
  { name: 'wallet', label: 'Finance' },
  { name: 'zap', label: 'Energy' },
];

export interface HabitCategory {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: HabitCategory[] = [
  { id: 'health', name: 'Health', color: '#22c55e' },
  { id: 'productivity', name: 'Productivity', color: '#3b82f6' },
  { id: 'learning', name: 'Learning', color: '#8b5cf6' },
  { id: 'wellness', name: 'Wellness', color: '#14b8a6' },
  { id: 'creative', name: 'Creative', color: '#ec4899' },
  { id: 'finance', name: 'Finance', color: '#f59e0b' },
];

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  iconName: HabitIconName;
  frequency: HabitFrequency;
  frequencyDays?: number[];
  targetValue?: number;
  targetUnit?: string;
  startDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  isCompleted: boolean;
  actualValue?: number;
  notes?: string;
  completedAt: string;
}

export interface HabitWithStats extends Habit {
  completions: Record<string, boolean>;
  notes: Record<string, string>;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompletions: number;
}

export interface DailyStats {
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface OverviewStats {
  totalHabits: number;
  activeHabits: number;
  todayCompleted: number;
  todayTotal: number;
  overallCompletionRate: number;
  currentStreak: number;
  bestStreak: number;
  weeklyTrend: DailyStats[];
}
