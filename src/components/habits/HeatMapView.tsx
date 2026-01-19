import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval, startOfDay, getDay, startOfYear, endOfYear, isAfter, startOfWeek, getMonth, isSameMonth } from 'date-fns';
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

  // Group days by week, starting from Sunday
  const { weeks, monthLabels } = useMemo(() => {
    const weeksList: Date[][] = [];
    const monthLabelsList: { weekIndex: number; label: string }[] = [];
    let currentWeek: Date[] = [];
    let lastMonth = -1;
    
    // Pad the beginning to start on Sunday
    const firstDayOfWeek = getDay(days[0]);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null as any);
    }
    
    days.forEach((day, index) => {
      const month = getMonth(day);
      
      // Track month changes for labels
      if (month !== lastMonth && (currentWeek.length === 0 || currentWeek.length >= 7)) {
        monthLabelsList.push({
          weekIndex: weeksList.length,
          label: format(day, 'MMM')
        });
        lastMonth = month;
      }
      
      currentWeek.push(day);
      
      // Start new week on Saturday or at the end
      if (getDay(day) === 6 || index === days.length - 1) {
        // Pad the end if necessary
        while (currentWeek.length < 7) {
          currentWeek.push(null as any);
        }
        weeksList.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return { weeks: weeksList, monthLabels: monthLabelsList };
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

  const weekDayLabels = ['Mon', 'Wed', 'Fri'];

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
      className="space-y-4 sm:space-y-6"
    >
      {/* Header with dropdowns */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-1">
        <div className="p-2 flex items-center gap-3">
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Activity Heatmap</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground">{data?.stats?.currentStreak || 0}</span> day streak · {selectedYear === currentYear ? 'Year to date' : selectedYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Year Filter */}
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[90px] sm:w-[110px] h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()} className="text-xs sm:text-sm">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Habit Filter */}
          <Select value={selectedHabitId || 'all'} onValueChange={(v) => setSelectedHabitId(v === 'all' ? undefined : v)}>
            <SelectTrigger className="flex-1 sm:w-[200px] h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Select habit" />
            </SelectTrigger>
            <SelectContent className="max-w-[280px]">
              <SelectItem value="all" className="text-xs sm:text-sm">
                All Habits
              </SelectItem>
              {habitsData?.map(habit => (
                <SelectItem key={habit.id} value={habit.id} className="text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <HabitIcon iconName={habit.icon || undefined} className="w-3.5 h-3.5" />
                    <span className="truncate">{habit.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Heatmap Container */}
      <div className="rounded-lg bg-card p-6 sm:p-8">
        <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 flex-shrink-0" /> {/* Space for day labels */}
              <div className="flex gap-[2px] sm:gap-[3px]">
                {weeks.map((week, weekIndex) => {
                  const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex);
                  return (
                    <div 
                      key={weekIndex} 
                      className="w-[11px] sm:w-[13px] md:w-[15px] text-[9px] sm:text-[10px] text-muted-foreground font-medium"
                    >
                      {monthLabel?.label || ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heatmap grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] sm:gap-[3px] w-10 sm:w-12 flex-shrink-0 pr-3 sm:pr-4">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const labelIndex = Math.floor(dayIndex / 2);
                  const showLabel = dayIndex % 2 === 1 && labelIndex < weekDayLabels.length;
                  return (
                    <div 
                      key={dayIndex} 
                      className="h-[11px] sm:h-[13px] md:h-[15px] text-[9px] sm:text-[10px] text-muted-foreground flex items-center"
                    >
                      {showLabel ? weekDayLabels[labelIndex] : ''}
                    </div>
                  );
                })}
              </div>

              {/* Heat map tiles */}
              <div className="flex gap-[2px] sm:gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px] sm:gap-[3px]">
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return (
                          <div 
                            key={`empty-${dayIndex}`} 
                            className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] md:w-[15px] md:h-[15px]" 
                          />
                        );
                      }

                      const dateStr = format(day, 'yyyy-MM-dd');
                      const heatLevel = getHeatLevel(dateStr);
                      const info = getCompletionInfo(dateStr);
                      const isToday = dateStr === format(today, 'yyyy-MM-dd');
                      const isFuture = isAfter(day, today);

                      return (
                        <Tooltip key={dateStr}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] md:w-[15px] md:h-[15px] rounded-sm transition-all cursor-pointer",
                                "hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:ring-offset-background",
                                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                                isFuture && "opacity-30",
                                !isFuture && heatLevel === 0 && "bg-[hsl(var(--heat-0))] border border-border/40",
                                !isFuture && heatLevel === 1 && "bg-[hsl(var(--heat-1))]",
                                !isFuture && heatLevel === 2 && "bg-[hsl(var(--heat-2))]",
                                !isFuture && heatLevel === 3 && "bg-[hsl(var(--heat-3))]",
                                !isFuture && heatLevel === 4 && "bg-[hsl(var(--heat-4))]",
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs px-3 py-2">
                            <p className="font-semibold mb-1">{format(day, 'EEE, MMM d, yyyy')}</p>
                            <p className="text-muted-foreground">
                              {isFuture ? 'Future date' : info.hasData ? `${info.count} completion${info.count !== 1 ? 's' : ''}` : 'No activity'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-6 sm:mt-8 text-[10px] sm:text-xs text-muted-foreground">
              <span className="mr-1">Less</span>
              <div className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-sm bg-[hsl(var(--heat-0))] border border-border/40" />
              <div className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-sm bg-[hsl(var(--heat-1))]" />
              <div className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-sm bg-[hsl(var(--heat-2))]" />
              <div className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-sm bg-[hsl(var(--heat-3))]" />
              <div className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-sm bg-[hsl(var(--heat-4))]" />
              <span className="ml-1">More</span>
            </div>
          </div>
        </div>
      </div>

      {(!data?.habits || data.habits.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No habits to display</p>
          <p className="text-xs mt-1">Create some habits to see your activity heatmap</p>
        </div>
      )}
    </motion.div>
  );
};

