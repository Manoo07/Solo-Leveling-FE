import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { OverviewStats } from '@/types/habit';
import { cn } from '@/lib/utils';

interface WeeklyChartProps {
  weeklyTrend: OverviewStats['weeklyTrend'];
}

export const WeeklyChart = ({ weeklyTrend }: WeeklyChartProps) => {
  const maxRate = 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Overview</h3>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {weeklyTrend.map((day, index) => {
          const height = (day.completionRate / maxRate) * 100;
          const isToday = index === weeklyTrend.length - 1;
          const dayLabel = format(parseISO(day.date), 'EEE');
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex-1 w-full flex items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.4, ease: "easeOut" }}
                  className={cn(
                    "w-full max-w-[32px] rounded-t-lg transition-all",
                    isToday
                      ? "bg-gradient-primary shadow-glow"
                      : day.completionRate >= 80
                      ? "bg-success"
                      : day.completionRate >= 50
                      ? "bg-primary/70"
                      : day.completionRate > 0
                      ? "bg-primary/40"
                      : "bg-secondary"
                  )}
                />
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-xs font-medium",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  {dayLabel}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {day.completedCount}/{day.totalCount}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
