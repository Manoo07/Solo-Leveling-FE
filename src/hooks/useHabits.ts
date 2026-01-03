import { useState, useCallback, useMemo } from 'react';
import { Habit, HabitWithStats, OverviewStats, HabitCategory, DailyStats, DEFAULT_CATEGORIES, HabitIconName } from '@/types/habit';
import { 
  format, 
  subDays, 
  startOfDay, 
  eachDayOfInterval,
  differenceInDays,
  parseISO
} from 'date-fns';

// Generate initial demo habits
const generateDemoHabits = (): Habit[] => {
  const today = new Date();
  return [
    {
      id: '1',
      name: 'Morning Exercise',
      description: '30 minutes of workout',
      categoryId: 'health',
      iconName: 'dumbbell',
      frequency: 'daily',
      startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
      isActive: true,
      createdAt: format(subDays(today, 30), 'yyyy-MM-dd'),
    },
    {
      id: '2',
      name: 'Read 30 Pages',
      description: 'Daily reading habit',
      categoryId: 'learning',
      iconName: 'book',
      frequency: 'daily',
      startDate: format(subDays(today, 25), 'yyyy-MM-dd'),
      isActive: true,
      createdAt: format(subDays(today, 25), 'yyyy-MM-dd'),
    },
    {
      id: '3',
      name: 'Meditate',
      description: '10 minutes of mindfulness',
      categoryId: 'wellness',
      iconName: 'brain',
      frequency: 'daily',
      startDate: format(subDays(today, 20), 'yyyy-MM-dd'),
      isActive: true,
      createdAt: format(subDays(today, 20), 'yyyy-MM-dd'),
    },
    {
      id: '4',
      name: 'Deep Work',
      description: '2 hours focused work',
      categoryId: 'productivity',
      iconName: 'target',
      frequency: 'daily',
      startDate: format(subDays(today, 15), 'yyyy-MM-dd'),
      isActive: true,
      createdAt: format(subDays(today, 15), 'yyyy-MM-dd'),
    },
    {
      id: '5',
      name: 'Drink Water',
      description: '8 glasses per day',
      categoryId: 'health',
      iconName: 'droplets',
      frequency: 'daily',
      startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
      isActive: true,
      createdAt: format(subDays(today, 10), 'yyyy-MM-dd'),
    },
  ];
};

// Generate random completions for demo
const generateDemoCompletions = (habits: Habit[]): Record<string, Record<string, boolean>> => {
  const completions: Record<string, Record<string, boolean>> = {};
  const today = startOfDay(new Date());
  
  habits.forEach(habit => {
    completions[habit.id] = {};
    const startDate = parseISO(habit.startDate);
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    days.forEach((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const baseRate = 0.7;
      const streakBonus = index > 7 ? 0.1 : 0;
      const randomness = Math.random();
      completions[habit.id][dateStr] = randomness < (baseRate + streakBonus);
    });
  });
  
  return completions;
};

const STORAGE_KEY = 'solo-leveling_v2';

interface StoredData {
  habits: Habit[];
  completions: Record<string, Record<string, boolean>>;
  notes: Record<string, Record<string, string>>;
  categories: HabitCategory[];
}

const loadFromStorage = (): StoredData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load habits from storage:', e);
  }
  return null;
};

const saveToStorage = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save habits to storage:', e);
  }
};

export const useHabits = () => {
  const [data, setData] = useState<StoredData>(() => {
    const stored = loadFromStorage();
    if (stored) {
      // Ensure notes field exists for backwards compatibility
      return { ...stored, notes: stored.notes || {} };
    }
    
    const habits = generateDemoHabits();
    const completions = generateDemoCompletions(habits);
    const initialData = { habits, completions, notes: {}, categories: DEFAULT_CATEGORIES };
    saveToStorage(initialData);
    return initialData;
  });

  const { habits, completions, notes, categories } = data;

  const updateData = useCallback((updater: (prev: StoredData) => StoredData) => {
    setData(prev => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }, []);

  const calculateStreak = useCallback((habitId: string, habitCompletions: Record<string, boolean>): { current: number; best: number } => {
    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    
    let current = 0;
    let best = 0;
    
    if (habitCompletions[todayStr] || habitCompletions[yesterdayStr]) {
      const startFrom = habitCompletions[todayStr] ? today : subDays(today, 1);
      let checkDate = startFrom;
      
      while (habitCompletions[format(checkDate, 'yyyy-MM-dd')]) {
        current++;
        checkDate = subDays(checkDate, 1);
      }
    }
    
    const allDates = Object.keys(habitCompletions).sort();
    let tempStreak = 0;
    allDates.forEach((date, index) => {
      if (habitCompletions[date]) {
        tempStreak++;
        if (index === allDates.length - 1 || !habitCompletions[allDates[index + 1]] || 
            differenceInDays(parseISO(allDates[index + 1]), parseISO(date)) > 1) {
          best = Math.max(best, tempStreak);
          tempStreak = 0;
        }
      }
    });
    
    return { current, best: Math.max(best, current) };
  }, []);

  const habitsWithStats = useMemo((): HabitWithStats[] => {
    return habits.map(habit => {
      const habitCompletions = completions[habit.id] || {};
      const habitNotes = notes[habit.id] || {};
      const { current, best } = calculateStreak(habit.id, habitCompletions);
      const totalDays = Object.keys(habitCompletions).length;
      const completedDays = Object.values(habitCompletions).filter(Boolean).length;
      
      return {
        ...habit,
        completions: habitCompletions,
        notes: habitNotes,
        currentStreak: current,
        bestStreak: best,
        completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
        totalCompletions: completedDays,
      };
    });
  }, [habits, completions, notes, calculateStreak]);

  const overviewStats = useMemo((): OverviewStats => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const activeHabits = habits.filter(h => h.isActive);
    
    let todayCompleted = 0;
    activeHabits.forEach(habit => {
      if (completions[habit.id]?.[today]) {
        todayCompleted++;
      }
    });
    
    let totalDays = 0;
    let totalCompleted = 0;
    Object.values(completions).forEach(habitCompletions => {
      totalDays += Object.keys(habitCompletions).length;
      totalCompleted += Object.values(habitCompletions).filter(Boolean).length;
    });
    
    let bestStreak = 0;
    let currentStreak = 0;
    habitsWithStats.forEach(habit => {
      bestStreak = Math.max(bestStreak, habit.bestStreak);
      currentStreak = Math.max(currentStreak, habit.currentStreak);
    });
    
    const weeklyTrend: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      let completed = 0;
      let total = activeHabits.length;
      
      activeHabits.forEach(habit => {
        if (completions[habit.id]?.[date]) {
          completed++;
        }
      });
      
      weeklyTrend.push({
        date,
        completedCount: completed,
        totalCount: total,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      });
    }
    
    return {
      totalHabits: habits.length,
      activeHabits: activeHabits.length,
      todayCompleted,
      todayTotal: activeHabits.length,
      overallCompletionRate: totalDays > 0 ? (totalCompleted / totalDays) * 100 : 0,
      currentStreak,
      bestStreak,
      weeklyTrend,
    };
  }, [habits, completions, habitsWithStats]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    
    updateData(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit],
      completions: { ...prev.completions, [newHabit.id]: {} },
      notes: { ...prev.notes, [newHabit.id]: {} },
    }));
    
    return newHabit;
  }, [updateData]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    updateData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h),
    }));
  }, [updateData]);

  const deleteHabit = useCallback((id: string) => {
    updateData(prev => {
      const newCompletions = { ...prev.completions };
      const newNotes = { ...prev.notes };
      delete newCompletions[id];
      delete newNotes[id];
      return {
        ...prev,
        habits: prev.habits.filter(h => h.id !== id),
        completions: newCompletions,
        notes: newNotes,
      };
    });
  }, [updateData]);

  const toggleCompletion = useCallback((habitId: string, date: string) => {
    updateData(prev => {
      const habitCompletions = prev.completions[habitId] || {};
      const isCompleted = !habitCompletions[date];
      
      return {
        ...prev,
        completions: {
          ...prev.completions,
          [habitId]: {
            ...habitCompletions,
            [date]: isCompleted,
          },
        },
      };
    });
  }, [updateData]);

  const addCategory = useCallback((category: Omit<HabitCategory, 'id'>) => {
    const newCategory: HabitCategory = {
      ...category,
      id: crypto.randomUUID(),
    };
    
    updateData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    
    return newCategory;
  }, [updateData]);

  const deleteCategory = useCallback((id: string) => {
    updateData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  }, [updateData]);

  const addNote = useCallback((habitId: string, date: string, note: string) => {
    updateData(prev => {
      const habitNotes = prev.notes[habitId] || {};
      return {
        ...prev,
        notes: {
          ...prev.notes,
          [habitId]: {
            ...habitNotes,
            [date]: note,
          },
        },
      };
    });
  }, [updateData]);

  const deleteNote = useCallback((habitId: string, date: string) => {
    updateData(prev => {
      const habitNotes = { ...(prev.notes[habitId] || {}) };
      delete habitNotes[date];
      return {
        ...prev,
        notes: {
          ...prev.notes,
          [habitId]: habitNotes,
        },
      };
    });
  }, [updateData]);

  return {
    habits: habitsWithStats,
    categories,
    overviewStats,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    addCategory,
    deleteCategory,
    addNote,
    deleteNote,
  };
};
