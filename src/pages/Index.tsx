import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { format, subDays, addDays, startOfDay, startOfWeek, isToday as isTodayFn } from 'date-fns';
import { useDashboard } from '@/hooks/api';
import { useCreateHabit, useDeleteHabit } from '@/hooks/api/useHabits';
import { useCategories } from '@/hooks/api/useCategories';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { useDebouncedBulkToggle } from '@/hooks/api/useBulkToggleHabits';
import { HabitTableGrid } from '@/components/habits/HabitTableGrid';
import { HeatMapView } from '@/components/habits/HeatMapView';
import { CreateHabitDialog } from '@/components/habits/CreateHabitDialog';
import { HabitNoteDialog } from '@/components/habits/HabitNoteDialog';
import { ManageCategoriesDialog } from '@/components/habits/ManageCategoriesDialog';
import { MilestoneBadge, useMilestoneTracker } from '@/components/milestones/MilestoneBadge';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { WeeklyProgressChart } from '@/components/stats/WeeklyProgressChart';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, LayoutGrid, Table2, ChevronLeft, ChevronRight, CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  // State
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // Track toggle state by habitId+date combination (e.g., "habitId_2026-01-03")
  const [localToggleState, setLocalToggleState] = useState<Map<string, boolean>>(new Map());
  // Note dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogData, setNoteDialogData] = useState<{
    habitId: string;
    habitName: string;
    date: string;
    existingNote?: string;
    isCompleted: boolean;
  } | null>(null);

  // Calculate start date based on selected date (week containing that date)
  const startDate = useMemo(() => {
    return startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  }, [selectedDate]);
  
  // Calculate end date (6 days after start date)
  const endDate = useMemo(() => {
    return addDays(startDate, 6); // Sunday end
  }, [startDate]);
  
  // Format start date for API call (YYYY-MM-DD)
  const apiStartDate = useMemo(() => {
    return format(startDate, 'yyyy-MM-dd');
  }, [startDate]);

  // Check if viewing current week
  const today = startOfDay(new Date());
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const isCurrentWeek = startDate.getTime() === currentWeekStart.getTime();
  
  // Fetch dashboard data from API with selected week
  const { data: dashboardData, isLoading, error } = useDashboard(
    isCurrentWeek ? undefined : apiStartDate // Only pass startDate if not current week
  );
  
  // Milestone tracking
  const { pendingMilestone, dismissMilestone, addMilestone } = useMilestoneTracker();
  
  const { queueUpdate, flush, pendingCount, isLoading: isSaving } = useDebouncedBulkToggle(
    () => {
      // Clear local state after successful save
      setLocalToggleState(new Map());
    },
    (response) => {
      // Handle milestone achievements from API response
      if (response.streaks && response.streaks.length > 0) {
        response.streaks.forEach(streak => {
          if (streak.milestones?.milestone && streak.milestones?.streakMessage) {
            // Find habit name from dashboard data
            const habit = dashboardData?.weekHabits?.find(h => h.habitId === streak.habitId) 
              || dashboardData?.todayHabits?.find(h => h.habitId === streak.habitId);
            
            if (habit) {
              addMilestone({
                id: `${streak.habitId}_${Date.now()}`,
                habitId: streak.habitId,
                habitName: habit.habitName,
                days: streak.currentStreak,
                type: 'streak',
                earnedAt: new Date().toISOString(),
                message: streak.milestones.streakMessage,
              });
            }
          }
        });
      }
    }
  );
  const createHabitMutation = useCreateHabit();
  const deleteHabitMutation = useDeleteHabit();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Map categories to the format expected by CreateHabitDialog
  const categories = useMemo(() => {
    if (!categoriesData) return [];
    
    // Deduplicate categories by id
    const uniqueCategories = Array.from(
      new Map(categoriesData.map(cat => [cat.id, cat])).values()
    );
    
    return uniqueCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color || '#6366f1',
      icon: cat.icon || 'tag',
    }));
  }, [categoriesData]);
  
  // Apply local toggle state to habits for UI display
  // New backend provides weekHabits with dailyEntries for the entire week
  const habitsWithLocalState = useMemo(() => {
    // Use weekHabits if available (new structure), fallback to todayHabits (legacy)
    const habits = dashboardData?.weekHabits || dashboardData?.todayHabits || [];
    if (habits.length === 0) return [];
    
    // Convert weekHabits to TodayHabit format with today's status
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return habits.map(habit => {
      // For weekHabits, check if we have daily entries
      const isWeekHabit = 'dailyEntries' in habit;
      const todayKey = `${habit.id}_${todayStr}`;
      const pendingToggle = localToggleState.get(todayKey);
      
      // Determine completed status: local state > API data
      const completed = pendingToggle !== undefined 
        ? pendingToggle 
        : habit.completed;
      
      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        type: habit.type,
        completed,
        value: habit.value,
        currentStreak: habit.currentStreak,
        // Include dailyEntries if this is a weekHabit
        ...(isWeekHabit && { dailyEntries: (habit as any).dailyEntries }),
      };
    });
  }, [dashboardData?.weekHabits, dashboardData?.todayHabits, localToggleState]);

  // Transform habits for milestone tracker
  const habits = useMemo(() => 
    habitsWithLocalState.map(h => ({
      id: h.id,
      name: h.name,
      categoryId: '',
      currentStreak: h.currentStreak,
      bestStreak: h.currentStreak,
      completions: {},
    })), 
  [habitsWithLocalState]);

  // Calculate dashboard stats with pending changes
  const adjustedDashboardData = useMemo(() => {
    if (!dashboardData) return dashboardData;

    const completedCount = habitsWithLocalState.filter(h => h.completed).length;
    const totalCount = habitsWithLocalState.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      ...dashboardData,
      todayProgress: {
        ...dashboardData.todayProgress,
        completed: completedCount,
        total: totalCount,
        percentage,
      },
      todayHabits: habitsWithLocalState,
    };
  }, [dashboardData, habitsWithLocalState]);
  
  // Handler for creating habits
  const handleCreateHabit = async (habit: any) => {
    try {
      await createHabitMutation.mutateAsync({
        name: habit.name,
        description: habit.description,
        type: 'BOOLEAN' as const, // Default to BOOLEAN type (simple checkbox)
        frequency: 'DAILY' as const,
        categoryId: habit.categoryId,
        icon: habit.iconName || 'target', // Store icon name instead of emoji
        color: categories.find(c => c.id === habit.categoryId)?.color || '#6366f1',
        reminderEnabled: false,
      });
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const isFuturePeriod = startDate > currentWeekStart;

  const handlePreviousWeek = () => {
    setSelectedDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setSelectedDate(prev => addDays(prev, 7));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleExportCSV = () => {
    if (!dashboardData?.todayHabits) return;
    
    const headers = ['Habit', 'Type', 'Completed', 'Current Streak'];
    const rows = dashboardData.todayHabits.map(h => [
      h.name,
      h.type,
      h.completed ? 'Yes' : 'No',
      h.currentStreak
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solo-leveling-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDelete = () => {
    if (deletingHabitId) {
      deleteHabitMutation.mutate(deletingHabitId, {
        onSuccess: () => {
          setDeletingHabitId(null);
          // Clear any local toggle state for this habit
          setLocalToggleState(prev => {
            const newMap = new Map(prev);
            // Remove all entries for this habit
            Array.from(newMap.keys())
              .filter(key => key.startsWith(`${deletingHabitId}_`))
              .forEach(key => newMap.delete(key));
            return newMap;
          });
        },
        onError: () => {
          // Error toast is already handled in the hook
          setDeletingHabitId(null);
        },
      });
    }
  };

  const handleOpenNoteDialog = (habitId: string, habitName: string, date: string) => {
    const habit = habitsWithLocalState.find(h => h.id === habitId);
    const isWeekHabit = habit && 'dailyEntries' in habit;
    const existingNote = isWeekHabit ? habit.dailyEntries[date]?.notes : undefined;
    const stateKey = `${habitId}_${date}`;
    const isCompleted = localToggleState.get(stateKey) ?? habit?.completed ?? false;
    
    setNoteDialogData({
      habitId,
      habitName,
      date,
      existingNote: existingNote || undefined,
      isCompleted,
    });
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async (habitId: string, date: string, note: string) => {
    try {
      const habit = habits?.find(h => h.id === habitId);
      if (!habit) return;

      // Get current completion status
      const stateKey = `${habitId}_${date}`;
      const isCompleted = localToggleState.get(stateKey) ?? habit?.completed ?? false;

      // Use new save-note API
      const response = await dashboardApi.saveNote({
        habitId,
        date,
        notes: note,
        completed: isCompleted,
      });

      // Check for milestone celebration
      if (response.streak?.milestones?.milestone) {
        const habitName = habit.name;
        addMilestone({
          habitName,
          message: response.streak.milestones.streakMessage,
          currentStreak: response.streak.currentStreak,
        });
      }

      // Refetch dashboard data to update UI
      refetch();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (habitId: string, date: string) => {
    try {
      // Delete note by setting it to empty
      await dashboardApi.saveNote({
        habitId,
        date,
        notes: '',
      });

      // Refetch dashboard data
      refetch();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleToggle = (habitId: string, date: string) => {
    // TEMPORARY: Allow toggling any date for testing
    // TODO: Re-enable this check for production: if (format(new Date(), 'yyyy-MM-dd') !== date) return;
    
    const stateKey = `${habitId}_${date}`;
    
    // Check current state - either from local state or if it's today, from API
    const currentState = localToggleState.get(stateKey) ?? (
      date === format(new Date(), 'yyyy-MM-dd')
        ? habitsWithLocalState.find(h => h.id === habitId)?.completed ?? false
        : false
    );
    
    const newState = !currentState;
    
    // Update local state for instant UI feedback (with habitId+date key)
    setLocalToggleState(prev => new Map(prev).set(stateKey, newState));
    
    // Queue for bulk save with the specific date
    queueUpdate({ habitId, completed: newState, date });
  };

  const handleSaveChanges = () => {
    flush();
    // Keep local state until new data arrives (don't clear immediately)
    toast({
      title: "Saving changes",
      description: `Saving ${pendingCount} habit update${pendingCount !== 1 ? 's' : ''}...`,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Milestone Celebration */}
      <AnimatePresence>
        {pendingMilestone && (
          <MilestoneBadge milestone={pendingMilestone} onDismiss={dismissMilestone} />
        )}
      </AnimatePresence>

      {/* Compact Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-11 sm:h-12">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-foreground">Solo Leveling</h1>
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">· {format(new Date(), 'EEE, MMM d')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CreateHabitDialog
                categories={categories}
                onCreateHabit={handleCreateHabit}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              />
              <Button onClick={handleExportCSV} variant="ghost" size="sm" className="gap-1 h-7 sm:h-8 px-1.5 sm:px-2 text-xs">
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-3 space-y-3 sm:space-y-4">
        
        {/* Quick Stats */}
        <QuickStats dashboardData={adjustedDashboardData} />

        {/* Weekly Progress Chart */}
        <WeeklyProgressChart startDate={startDate} endDate={endDate} />

        {/* Compact Navigation Row */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap px-1 sm:px-0">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousWeek}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-7 gap-1 sm:gap-1.5 px-1.5 sm:px-2 text-[10px] sm:text-xs font-normal"
                >
                  <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden xs:inline">{format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}</span>
                  <span className="xs:hidden">{format(startDate, 'M/d')} - {format(endDate, 'M/d')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border border-border z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextWeek}
              disabled={isFuturePeriod}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {!isCurrentWeek && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              >
                Today
              </Button>
            )}
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'heatmap')}>
            <TabsList className="h-6 sm:h-7">
              <TabsTrigger value="table" className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-[11px] gap-0.5 sm:gap-1">
                <Table2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 
                <span className="hidden xs:inline">Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-[11px] gap-0.5 sm:gap-1">
                <LayoutGrid className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 
                <span className="hidden xs:inline">Heatmap</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            {pendingCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs gap-1 bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                ) : null}
                <span>Save {pendingCount}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {viewMode === 'table' ? (
            <HabitTableGrid
              habits={habitsWithLocalState}
              startDate={startDate}
              onToggle={handleToggle}
              onDelete={setDeletingHabitId}
              onNoteClick={handleOpenNoteDialog}
              localToggleState={localToggleState}
            />
          ) : (
            <HeatMapView />
          )}
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingHabitId} onOpenChange={(open) => !open && setDeletingHabitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this habit and all its tracking data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteHabitMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteHabitMutation.isPending}
            >
              {deleteHabitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Note Dialog */}
      {noteDialogData && (
        <HabitNoteDialog
          habitId={noteDialogData.habitId}
          habitName={noteDialogData.habitName}
          date={noteDialogData.date}
          existingNote={noteDialogData.existingNote}
          isCompleted={noteDialogData.isCompleted}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
        />
      )}
    </div>
  );
};

export default Index;
