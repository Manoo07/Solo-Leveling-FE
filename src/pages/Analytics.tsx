import { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Calendar, Flame, Target, Download
} from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { InsightsPanel } from '@/components/analytics/InsightsPanel';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const { habits, categories } = useHabits();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const days = parseInt(dateRange);

  // Calculate completion trend data
  const completionTrend = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let completed = 0;
      let total = habits.length;
      
      habits.forEach(habit => {
        if (habit.completions[dateStr]) completed++;
      });
      
      return {
        date: dateStr,
        label: format(date, 'MMM d'),
        completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [habits, days]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    return categories.map(category => {
      const categoryHabits = habits.filter(h => h.categoryId === category.id);
      const totalCompletions = categoryHabits.reduce((sum, h) => sum + h.totalCompletions, 0);
      return {
        name: category.name,
        color: category.color,
        count: categoryHabits.length,
        completions: totalCompletions,
      };
    }).filter(c => c.count > 0);
  }, [habits, categories]);

  // Calculate streak data
  const streakData = useMemo(() => {
    return habits
      .map(h => ({
        name: h.name,
        current: h.currentStreak,
        best: h.bestStreak,
        color: categories.find(c => c.id === h.categoryId)?.color || '#888',
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 8);
  }, [habits, categories]);

  // Calculate heatmap data for the last 12 weeks
  const heatmapData = useMemo(() => {
    const weeks: { week: number; days: { date: string; rate: number }[] }[] = [];
    const today = new Date();
    
    for (let w = 11; w >= 0; w--) {
      const weekStart = startOfWeek(subDays(today, w * 7), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const days = weekDays.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        let completed = 0;
        habits.forEach(h => {
          if (h.completions[dateStr]) completed++;
        });
        return {
          date: dateStr,
          rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
        };
      });
      
      weeks.push({ week: 11 - w, days });
    }
    
    return weeks;
  }, [habits]);

  const avgCompletionRate = useMemo(() => {
    if (completionTrend.length === 0) return 0;
    return Math.round(completionTrend.reduce((sum, d) => sum + d.rate, 0) / completionTrend.length);
  }, [completionTrend]);

  const maxStreak = useMemo(() => {
    return Math.max(0, ...habits.map(h => h.currentStreak));
  }, [habits]);

  const totalCompletions = useMemo(() => {
    return habits.reduce((sum, h) => sum + h.totalCompletions, 0);
  }, [habits]);

  const handleExport = () => {
    const data = completionTrend.map(d => ({
      Date: d.date,
      Completed: d.completed,
      Total: d.total,
      Rate: `${d.rate}%`,
    }));
    
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solo-leveling-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHeatColor = (rate: number) => {
    if (rate === 0) return 'bg-[hsl(var(--heat-0))]';
    if (rate < 25) return 'bg-[hsl(var(--heat-1))]';
    if (rate < 50) return 'bg-[hsl(var(--heat-2))]';
    if (rate < 75) return 'bg-[hsl(var(--heat-3))]';
    return 'bg-[hsl(var(--heat-4))]';
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your progress and discover insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as '7' | '30' | '90')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Active Habits</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{habits.length}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Avg. Completion</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{avgCompletionRate}%</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-medium">Best Streak</span>
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--warning))]">{maxStreak} days</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Total Completions</span>
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--success))]">{totalCompletions}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights Panel - What Changed */}
      <InsightsPanel habits={habits} categories={categories} dateRange={days} />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Completion Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completionTrend}>
                  <defs>
                    <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    fill="url(#completionGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Streak Rankings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} days`,
                      name === 'current' ? 'Current' : 'Best'
                    ]}
                  />
                  <Bar dataKey="current" radius={[0, 4, 4, 0]}>
                    {streakData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap & Category Breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Activity Heatmap (12 weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex gap-0.5 text-[10px] text-muted-foreground mb-1 pl-8">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="w-4 h-4 flex items-center justify-center">{d}</div>
                ))}
              </div>
              <div className="flex gap-0.5">
                <div className="flex flex-col gap-0.5 mr-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="w-6 h-4" />
                  ))}
                </div>
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-0.5">
                    {week.days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={cn(
                          "w-4 h-4 rounded-sm transition-colors",
                          getHeatColor(day.rate)
                        )}
                        title={`${day.date}: ${day.rate}%`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div key={level} className={cn("w-3 h-3 rounded-sm", getHeatColor(level * 25))} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No habits yet
              </p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {cat.count} habit{cat.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Progress 
                      value={(cat.completions / (totalCompletions || 1)) * 100} 
                      className="h-1.5"
                      style={{ 
                        // @ts-ignore
                        '--progress-background': cat.color 
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
