import { motion } from 'framer-motion';
import { HabitWithStats, HabitCategory } from '@/types/habit';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface KPICardsProps {
  habits: HabitWithStats[];
  startDate: Date;
}

export const KPICards = ({ habits, startDate }: KPICardsProps) => {
  const habitCompletionStats = habits.map(habit => {
    let completedDays = 0;
    for (let i = 0; i < 21; i++) {
      const dateStr = format(addDays(startDate, i), 'yyyy-MM-dd');
      if (habit.completions[dateStr]) {
        completedDays++;
      }
    }
    const rate = (completedDays / 21) * 100;
    return { habit, completedDays, rate };
  });

  const perfectHabits = habitCompletionStats.filter(h => h.rate === 100).length;
  const goodHabits = habitCompletionStats.filter(h => h.rate >= 50 && h.rate < 100).length;
  const needsWorkHabits = habitCompletionStats.filter(h => h.rate < 50).length;
  
  const averageRate = habits.length > 0
    ? habitCompletionStats.reduce((sum, h) => sum + h.rate, 0) / habits.length
    : 0;

  const cards = [
    {
      label: '100% Complete',
      value: perfectHabits,
      sublabel: perfectHabits === 1 ? 'habit' : 'habits',
      borderColor: 'border-l-success',
      bgColor: 'bg-success-light',
      textColor: 'text-success',
    },
    {
      label: '≥50% Complete',
      value: goodHabits,
      sublabel: goodHabits === 1 ? 'habit' : 'habits',
      borderColor: 'border-l-warning',
      bgColor: 'bg-warning-light',
      textColor: 'text-warning',
    },
    {
      label: '<50% Complete',
      value: needsWorkHabits,
      sublabel: needsWorkHabits === 1 ? 'habit' : 'habits',
      borderColor: 'border-l-destructive',
      bgColor: 'bg-destructive/5',
      textColor: 'text-destructive',
    },
    {
      label: 'Average Rate',
      value: `${Math.round(averageRate)}%`,
      sublabel: 'completion',
      borderColor: 'border-l-accent',
      bgColor: 'bg-accent/5',
      textColor: 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "rounded-lg p-4 border-l-2",
            card.borderColor,
            card.bgColor
          )}
        >
          <p className={cn("text-xs font-medium uppercase tracking-wide", card.textColor)}>
            {card.label}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-1 tabular-nums">
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground">{card.sublabel}</p>
        </motion.div>
      ))}
    </div>
  );
};
