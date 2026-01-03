import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval, startOfDay, getDay, startOfYear, endOfYear, isAfter } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import { useHeatmap } from '@/hooks/api/useHeatmap';
import { useHabits } from '@/hooks/api/useHabits';
import { HabitIcon } from '@/components/ui/habit-icon';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const HeatMapView = () => {
  const currentYear = new Date().getFullYear();
  const [selectedHabitId, setSelectedHabitId] = useState<string | undefined>();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const { data: habitsData } = useHabits({ includeArchived: false });
  const { data, isLoading } = useHeatmap(selectedHabitId, selectedYear);
  
  const today = startOfDay(new Date());
  
  // Calculate date range based on selected year
  const { startDate, endDate } = useMemo(() => {
    if (selectedYear === currentYear) {
      // Current year: show from start of year to today
      return {
        startDate: startOfYear(today),
        endDate: today
      };
    } else {
      // Past year: show entire year
      const yearStart = new Date(selectedYear, 0, 1);
      const yearEnd = endOfYear(yearStart);
      return {
        startDate: yearStart,
        endDate: yearEnd
      };
    }
  }, [selectedYear, currentYear, today]);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Generate year options (current year and 4 years back)
  const yearOptions = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  // Create a map for quick lookup
  const heatmapMap = useMemo(() => {
    if (!data?.heatmap) return new Map();
    return new Map(data.heatmap.map(day => [day.date, day]));
  }, [data?.heatmap]);

  // Group days by week
  const weeks: Date[][] = useMemo(() => {
    const result: Date[][] = [];
    let currentWeek: Date[] = [];
    
    days.forEach((day, index) => {
      currentWeek.push(day);
      if (getDay(day) === 6 || index === days.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return result;
  }, [days]);

  // Get heat level from API data
  const getHeatLevel = (dateStr: string): number => {
    const dayData = heatmapMap.get(dateStr);
    return dayData?.intensity || 0;
  };

  // Get completion info for tooltip
  const getCompletionInfo = (dateStr: string) => {
    const dayData = heatmapMap.get(dateStr);
    if (!dayData) return { count: 0, hasData: false };
    return { count: dayData.count, hasData: true };
  };

  const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading heatmap...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 sm:space-y-4 p-3 sm:p-4"
    >
      {/* Header with dropdowns */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div>
            <h4 className="font-medium text-foreground text-xs sm:text-sm">Activity Heatmap</h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {data?.stats?.currentStreak || 0} day streak · {selectedYear === currentYear ? 'Year to date' : selectedYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Year Filter */}
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[80px] sm:w-[100px] h-7 sm:h-8 text-xs sm:text-sm bg-card border-border/60 hover:border-border transition-colors px-2 sm:px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border/60 shadow-lg z-50">
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()} className="text-xs py-1.5 cursor-pointer">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Habit Filter */}
          <Select value={selectedHabitId || 'all'} onValueChange={(v) => setSelectedHabitId(v === 'all' ? undefined : v)}>
            <SelectTrigger className="flex-1 sm:w-[180px] h-7 sm:h-8 text-xs sm:text-sm bg-card border-border/60 hover:border-border transition-colors px-2 sm:px-3">
              <SelectValue placeholder="Select habit" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border/60 shadow-lg z-50 min-w-[180px]">
              <SelectItem value="all" className="text-xs py-1.5 cursor-pointer">
                All Habits
              </SelectItem>
              {habitsData?.map(habit => (
              <SelectItem key={habit.id} value={habit.id} className="text-xs py-1.5 cursor-pointer">
                <div className="flex items-center gap-2">
                  <HabitIcon iconName={habit.icon || undefined} className="w-3.5 h-3.5" />
                  <span>{habit.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Combined Heat Map - Centered */}
      <div className="flex flex-col items-center w-full">
        <div className="inline-flex gap-1">
          {/* Day labels */}
          <div className="hidden sm:flex flex-col gap-[3px] pr-1.5 sm:pr-2">
            {weekLabels.map((label, i) => (
              <div key={i} className="h-[10px] sm:h-3 text-[8px] sm:text-[9px] text-muted-foreground leading-[10px] sm:leading-3 flex items-center">
                {i % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>

          {/* Heat map grid */}
          <div className="flex gap-[2px] sm:gap-[3px] overflow-x-auto pb-1 max-w-full">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px] sm:gap-[3px]">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = week.find(d => getDay(d) === dayOfWeek);
                  if (!day) {
                    return <div key={dayOfWeek} className="w-[10px] h-[10px] sm:w-3 sm:h-3" />;
                  }

                  const dateStr = format(day, 'yyyy-MM-dd');
                  const heatLevel = getHeatLevel(dateStr);
                  const info = getCompletionInfo(dateStr);
                  const isToday = dateStr === format(today, 'yyyy-MM-dd');

                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/30",
                            isToday && "ring-1 ring-foreground/50",
                            heatLevel === 0 && "bg-heat-0",
                            heatLevel === 1 && "bg-heat-1",
                            heatLevel === 2 && "bg-heat-2",
                            heatLevel === 3 && "bg-heat-3",
                            heatLevel === 4 && "bg-heat-4"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs bg-popover border border-border">
                        <p className="font-medium">{format(day, 'MMM d, yyyy')}</p>
                        <p className="text-muted-foreground">
                          {info.hasData ? `${info.count} completion${info.count !== 1 ? 's' : ''}` : 'No data'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Month labels - aligned with tiles */}
        <div className="inline-flex pl-0 sm:pl-[42px] text-[8px] sm:text-[9px] text-muted-foreground overflow-x-auto pb-1 mt-1">
          {weeks.map((week, weekIndex) => {
            const firstDay = week[0];
            const isFirstWeekOfMonth = firstDay && (firstDay.getDate() <= 7);
            
            return (
              <div key={weekIndex} className="w-[12px] sm:w-[15px] flex-shrink-0 text-center">
                {isFirstWeekOfMonth ? format(firstDay, 'MMM') : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-sm bg-heat-0" />
        <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-sm bg-heat-1" />
        <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-sm bg-heat-2" />
        <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-sm bg-heat-3" />
        <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-sm bg-heat-4" />
        <span>More</span>
      </div>

      {(!data?.habits || data.habits.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No habits to display.</p>
        </div>
      )}
    </motion.div>
  );
};
