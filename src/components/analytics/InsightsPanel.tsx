import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Sparkles, Flame, Target
} from 'lucide-react';
import { HabitWithStats, HabitCategory } from '@/types/habit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  habits: HabitWithStats[];
  categories: HabitCategory[];
  dateRange: number;
}

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'neutral';
  icon: typeof TrendingUp;
  title: string;
  description: string;
  color: string;
}

export const InsightsPanel = ({ habits, categories, dateRange }: InsightsPanelProps) => {
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = [];
    const today = new Date();

    // Calculate period comparisons
    habits.forEach(habit => {
      let currentPeriod = 0;
      let previousPeriod = 0;

      for (let i = 0; i < dateRange; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        const prevDate = format(subDays(today, i + dateRange), 'yyyy-MM-dd');
        if (habit.completions[date]) currentPeriod++;
        if (habit.completions[prevDate]) previousPeriod++;
      }

      const change = previousPeriod > 0 
        ? Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100)
        : currentPeriod > 0 ? 100 : 0;

      // Significant improvements
      if (change >= 30 && currentPeriod >= 5) {
        result.push({
          id: `improve-${habit.id}`,
          type: 'positive',
          icon: TrendingUp,
          title: `${habit.name} is trending up!`,
          description: `${change}% increase compared to previous ${dateRange} days`,
          color: 'hsl(var(--success))',
        });
      }

      // Significant drops
      if (change <= -30 && previousPeriod >= 5) {
        result.push({
          id: `drop-${habit.id}`,
          type: 'warning',
          icon: TrendingDown,
          title: `${habit.name} needs attention`,
          description: `${Math.abs(change)}% decrease in completions`,
          color: 'hsl(var(--warning))',
        });
      }
    });

    // Best streak insight
    const bestStreakHabit = habits.reduce((best, h) => 
      h.currentStreak > (best?.currentStreak || 0) ? h : best
    , habits[0]);

    if (bestStreakHabit && bestStreakHabit.currentStreak >= 7) {
      result.push({
        id: 'best-streak',
        type: 'positive',
        icon: Flame,
        title: `${bestStreakHabit.currentStreak}-day streak on ${bestStreakHabit.name}!`,
        description: 'Keep it going! You\'re building a strong habit.',
        color: 'hsl(var(--warning))',
      });
    }

    // Habits at risk (no completion in 3+ days)
    const atRisk = habits.filter(h => {
      for (let i = 0; i < 3; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        if (h.completions[date]) return false;
      }
      return true;
    });

    if (atRisk.length > 0 && atRisk.length <= 2) {
      result.push({
        id: 'at-risk',
        type: 'warning',
        icon: AlertTriangle,
        title: `${atRisk.length} habit${atRisk.length > 1 ? 's' : ''} at risk`,
        description: `${atRisk.map(h => h.name).join(', ')} - no activity in 3+ days`,
        color: 'hsl(var(--destructive))',
      });
    }

    // Perfect day achievements
    const todayStr = format(today, 'yyyy-MM-dd');
    const allCompletedToday = habits.length > 0 && habits.every(h => h.completions[todayStr]);
    
    if (allCompletedToday) {
      result.push({
        id: 'perfect-day',
        type: 'positive',
        icon: Sparkles,
        title: 'Perfect day!',
        description: 'You completed all your habits today!',
        color: 'hsl(var(--accent))',
      });
    }

    // Completion rate milestone
    const avgRate = habits.reduce((sum, h) => sum + h.completionRate, 0) / (habits.length || 1);
    if (avgRate >= 80) {
      result.push({
        id: 'high-rate',
        type: 'positive',
        icon: Target,
        title: 'Excellent consistency!',
        description: `${Math.round(avgRate)}% average completion rate`,
        color: 'hsl(var(--success))',
      });
    }

    return result.slice(0, 4); // Max 4 insights
  }, [habits, dateRange]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          What Changed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-3 rounded-lg flex items-start gap-3",
              insight.type === 'positive' && "bg-[hsl(var(--success))]/5",
              insight.type === 'warning' && "bg-[hsl(var(--warning))]/5",
              insight.type === 'neutral' && "bg-muted/50"
            )}
          >
            <div 
              className="p-1.5 rounded-md mt-0.5"
              style={{ backgroundColor: `${insight.color}20` }}
            >
              <insight.icon className="w-3.5 h-3.5" style={{ color: insight.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
