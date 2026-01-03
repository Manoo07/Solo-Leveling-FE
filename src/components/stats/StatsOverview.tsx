import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Trophy, CheckCircle, Calendar } from 'lucide-react';
import { OverviewStats } from '@/types/habit';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  stats: OverviewStats;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon, trend, color, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: color ? `${color}15` : 'hsl(var(--secondary))' }}
      >
        {icon}
      </div>
      {trend !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          <TrendingUp className={cn("w-3 h-3", trend < 0 && "rotate-180")} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground/70">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const todayProgress = stats.todayTotal > 0
    ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Today's Progress"
        value={`${stats.todayCompleted}/${stats.todayTotal}`}
        subtitle={`${todayProgress}% complete`}
        icon={<CheckCircle className="w-5 h-5 text-primary" />}
        color="hsl(168 80% 40%)"
        delay={0}
      />
      <StatCard
        title="Current Streak"
        value={`${stats.currentStreak} days`}
        subtitle="Keep it going!"
        icon={<Flame className="w-5 h-5 text-accent" />}
        color="hsl(38 92% 50%)"
        delay={0.05}
      />
      <StatCard
        title="Best Streak"
        value={`${stats.bestStreak} days`}
        subtitle="Personal record"
        icon={<Trophy className="w-5 h-5 text-category-learning" />}
        color="hsl(271 81% 56%)"
        delay={0.1}
      />
      <StatCard
        title="Completion Rate"
        value={`${Math.round(stats.overallCompletionRate)}%`}
        subtitle={`${stats.activeHabits} active habits`}
        icon={<Target className="w-5 h-5 text-success" />}
        color="hsl(142 76% 36%)"
        delay={0.15}
      />
    </div>
  );
};
