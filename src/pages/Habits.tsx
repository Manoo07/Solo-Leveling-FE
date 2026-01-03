import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, subDays, addDays, startOfDay, startOfWeek } from 'date-fns';
import { useHabits } from '@/hooks/useHabits';
import { HabitTableGrid } from '@/components/habits/HabitTableGrid';
import { HeatMapView } from '@/components/habits/HeatMapView';
import { CreateHabitDialog } from '@/components/habits/CreateHabitDialog';
import { ManageCategoriesDialog } from '@/components/habits/ManageCategoriesDialog';
import { MilestoneBadge, useMilestoneTracker } from '@/components/milestones/MilestoneBadge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, LayoutGrid, Table2, ChevronLeft, ChevronRight, CalendarIcon,
  Trash2, Archive, X, CheckSquare
} from 'lucide-react';
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
import { toast } from 'sonner';

const Habits = () => {
  const { habits, categories, addHabit, deleteHabit, updateHabit, toggleCompletion, addCategory, deleteCategory, addNote, deleteNote } = useHabits();
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  
  const { pendingMilestone, dismissMilestone } = useMilestoneTracker(habits);

  const isSelecting = selectedHabits.size > 0;

  const startDate = useMemo(() => {
    return startOfWeek(selectedDate, { weekStartsOn: 0 });
  }, [selectedDate]);

  const endDate = useMemo(() => addDays(startDate, 6), [startDate]);

  const today = startOfDay(new Date());
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const isCurrentPeriod = startDate.getTime() === currentWeekStart.getTime();
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
    const headers = ['Habit', 'Category', 'Period Completion', 'Current Streak', 'Best Streak'];
    const rows = habits.map(h => {
      const cat = categories.find(c => c.id === h.categoryId);
      let periodComplete = 0;
      for (let i = 0; i < 7; i++) {
        if (h.completions[format(addDays(startDate, i), 'yyyy-MM-dd')]) periodComplete++;
      }
      return [h.name, cat?.name || '', `${Math.round((periodComplete/7)*100)}%`, h.currentStreak, h.bestStreak];
    });
    
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
      deleteHabit(deletingHabitId);
      setDeletingHabitId(null);
    }
  };

  // Bulk selection handlers
  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabits(prev => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  };

  const selectAllHabits = () => {
    if (selectedHabits.size === habits.length) {
      setSelectedHabits(new Set());
    } else {
      setSelectedHabits(new Set(habits.map(h => h.id)));
    }
  };

  const clearSelection = () => {
    setSelectedHabits(new Set());
  };

  const handleBulkArchive = () => {
    selectedHabits.forEach(id => {
      updateHabit(id, { isActive: false });
    });
    toast.success(`${selectedHabits.size} habit(s) archived`);
    clearSelection();
  };

  const handleBulkDelete = () => {
    selectedHabits.forEach(id => {
      deleteHabit(id);
    });
    toast.success(`${selectedHabits.size} habit(s) deleted`);
    clearSelection();
    setBulkDeleteOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Milestone Celebration */}
      <AnimatePresence>
        {pendingMilestone && (
          <MilestoneBadge milestone={pendingMilestone} onDismiss={dismissMilestone} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateHabitDialog categories={categories} onCreateHabit={addHabit} />
          <ManageCategoriesDialog
            categories={categories}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
          />
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedHabits.size === habits.length}
                onCheckedChange={selectAllHabits}
              />
              <span className="text-sm font-medium">
                {selectedHabits.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkArchive}
                className="gap-1.5 h-8"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
                className="gap-1.5 h-8"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={clearSelection}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {/* Select Mode Toggle */}
          <Button
            variant={isSelecting ? "secondary" : "ghost"}
            size="sm"
            onClick={() => isSelecting ? clearSelection() : selectAllHabits()}
            className="h-8 gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Select</span>
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs font-normal"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
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
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {!isCurrentPeriod && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-xs h-8 px-2"
            >
              Today
            </Button>
          )}
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'heatmap')}>
          <TabsList className="h-8">
            <TabsTrigger value="table" className="h-7 px-2.5 text-xs gap-1">
              <Table2 className="w-3.5 h-3.5" /> 
              Weekly
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="h-7 px-2.5 text-xs gap-1">
              <LayoutGrid className="w-3.5 h-3.5" /> 
              Heatmap
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {viewMode === 'table' ? (
          <HabitTableGrid
            habits={habits}
            categories={categories}
            startDate={startDate}
            onToggle={toggleCompletion}
            onDelete={setDeletingHabitId}
            selectedHabits={selectedHabits}
            onToggleSelection={toggleHabitSelection}
            isSelecting={isSelecting}
            onAddNote={addNote}
            onDeleteNote={deleteNote}
          />
        ) : (
          <div className="p-4">
            <HeatMapView habits={habits} categories={categories} />
          </div>
        )}
      </div>

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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedHabits.size} Habits</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected habits and all their tracking data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Habits;
