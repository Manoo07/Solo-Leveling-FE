import { useMemo } from "react";
import { format, addDays, startOfDay, isToday as isTodayFn } from "date-fns";
import { Trash2, Target, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TodayHabit, WeekHabit } from "@/lib/api/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FireIcon } from "@/components/ui/fire-icon";
import { HabitIcon } from "@/components/ui/habit-icon";

interface HabitTableGridProps {
  habits: (TodayHabit & { dailyEntries?: Record<string, { completed: boolean; value: number | null }> })[];
  startDate: Date;
  onToggle: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
  localToggleState?: Map<string, boolean>; // Track completion by habitId+date
}

export const HabitTableGrid = ({
  habits,
  startDate,
  onToggle,
  onDelete,
  localToggleState,
}: HabitTableGridProps) => {
  const today = startOfDay(new Date());

  // Generate 7 days
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-220px)]">
      {/* Day Headers Row */}
      <div className="flex border-b border-border bg-[hsl(var(--accent)/0.05)] sticky top-0 z-10">
        <div className="w-[120px] sm:w-[180px] flex-shrink-0 px-3 py-2 font-semibold text-xs sm:text-sm bg-[hsl(var(--accent)/0.05)]">
          Habit
        </div>
        {days.map((day) => {
          const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          const isFuture = day > today;
          return (
            <div
              key={format(day, "yyyy-MM-dd")}
              className={cn(
                "flex-1 py-1 sm:py-2 text-center min-w-[28px] sm:min-w-[32px] bg-[hsl(var(--accent)/0.05)]",
                isFuture && "opacity-50"
              )}
            >
              <div className="text-[8px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {format(day, "EEEEE")}
              </div>
              <div
                className={cn(
                  "text-[9px] sm:text-xs font-semibold mt-0.5 mx-auto w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center rounded-full",
                  isToday && "bg-accent text-accent-foreground"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
        <div className="w-[24px] sm:w-[36px] flex-shrink-0 bg-[hsl(var(--accent)/0.05)]" />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Target className="w-12 h-12 mb-3 text-primary" />
            <h3 className="text-base font-semibold mb-2">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start building better habits by creating your first one
            </p>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => window.location.href = '/habits'}
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Your First Habit
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex hover:bg-accent/5 transition-colors group"
              >
                {/* Habit Name Column */}
                <div className="w-[120px] sm:w-[180px] flex-shrink-0 px-2 sm:px-3 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center flex-shrink-0 border border-border bg-muted/30">
                    <HabitIcon iconName={habit.icon || undefined} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium truncate">
                      {habit.name}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
                      <FireIcon className="w-3 h-3 text-orange-500" />
                      <span>{habit.currentStreak} day streak</span>
                    </div>
                  </div>
                </div>

                {/* Day Checkboxes */}
                {days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isFuture = day > today;
                  const isThisToday = isTodayFn(day);
                  const stateKey = `${habit.id}_${dateStr}`;
                  
                  // Priority: 1) Local pending state, 2) API dailyEntries, 3) Today's completed flag, 4) False
                  const apiEntry = habit.dailyEntries?.[dateStr];
                  const isCompleted = localToggleState?.get(stateKey) ?? (
                    apiEntry !== undefined ? apiEntry.completed : (
                      isThisToday ? habit.completed : false
                    )
                  );
                  
                  // Only allow editing today's habits (lock past and future dates)
                  const isPast = day < today;
                  const canEdit = isThisToday && !isPast && !isFuture;

                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        "flex-1 flex items-center justify-center min-w-[28px] sm:min-w-[32px]",
                        isFuture && "opacity-30"
                      )}
                    >
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => canEdit && onToggle(habit.id, dateStr)}
                        disabled={!canEdit}
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 rounded-md",
                          isCompleted &&
                            "data-[state=checked]:bg-[hsl(var(--success))] data-[state=checked]:border-[hsl(var(--success))]"
                        )}
                      />
                    </div>
                  );
                })}

                {/* Delete Column */}
                <div className="w-[24px] sm:w-[36px] flex-shrink-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(habit.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
