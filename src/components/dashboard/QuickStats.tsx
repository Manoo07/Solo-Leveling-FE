import { motion } from 'framer-motion';
import { 
  Flame, Target, TrendingUp, Award
} from 'lucide-react';
import { DashboardData } from '@/lib/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  dashboardData: DashboardData;
}

export const QuickStats = ({ dashboardData }: QuickStatsProps) => {
  const statItems = [
    {
      label: "Today's Progress",
      value: `${dashboardData.todayProgress.completed}/${dashboardData.todayProgress.total}`,
      subValue: `${dashboardData.todayProgress.percentage}%`,
      icon: Target,
      color: dashboardData.todayProgress.percentage >= 80 ? 'hsl(var(--success))' : 
             dashboardData.todayProgress.percentage >= 50 ? 'hsl(var(--warning))' : 
             'hsl(var(--muted-foreground))',
    },
    {
      label: 'Best Streak',
      value: `${dashboardData.bestStreak.days}`,
      subValue: 'days',
      icon: Flame,
      color: 'hsl(var(--warning))',
    },
    {
      label: 'This Week',
      value: dashboardData.thisWeek.completions.toString(),
      subValue: dashboardData.thisWeek.change >= 0 ? `+${dashboardData.thisWeek.change}%` : `${dashboardData.thisWeek.change}%`,
      icon: TrendingUp,
      color: dashboardData.thisWeek.change >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
      trend: dashboardData.thisWeek.change,
    },
    {
      label: 'Total Completions',
      value: dashboardData.totalCompletions.count.toString(),
      subValue: 'all time',
      icon: Award,
      color: 'hsl(var(--accent))',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-soft transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    {item.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold text-foreground">
                      {item.value}
                    </span>
                    <span 
                      className={cn(
                        "text-[10px] sm:text-xs font-medium",
                        item.trend !== undefined 
                          ? item.trend >= 0 
                            ? "text-[hsl(var(--success))]" 
                            : "text-[hsl(var(--destructive))]"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.subValue}
                    </span>
                  </div>
                </div>
                <div 
                  className="p-1.5 sm:p-2 rounded-lg"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                    style={{ color: item.color }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
