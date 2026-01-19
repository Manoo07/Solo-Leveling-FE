import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Habit, HabitCategory, HABIT_ICONS, ICON_LIST, HabitIconName } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Habit templates for quick onboarding
const HABIT_TEMPLATES = [
  {
    category: 'Fitness',
    habits: [
      { name: 'Morning Exercise', description: '30 minutes of workout', iconName: 'dumbbell' as HabitIconName, categoryId: 'health' },
      { name: 'Take 10,000 Steps', description: 'Daily walking goal', iconName: 'activity' as HabitIconName, categoryId: 'health' },
      { name: 'Stretch Routine', description: '10 minutes of stretching', iconName: 'heart' as HabitIconName, categoryId: 'wellness' },
    ],
  },
  {
    category: 'Wellness',
    habits: [
      { name: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', iconName: 'droplets' as HabitIconName, categoryId: 'health' },
      { name: 'Meditate', description: '10 minutes of mindfulness', iconName: 'brain' as HabitIconName, categoryId: 'wellness' },
      { name: 'Sleep by 11 PM', description: 'Maintain healthy sleep schedule', iconName: 'moon' as HabitIconName, categoryId: 'wellness' },
    ],
  },
  {
    category: 'Productivity',
    habits: [
      { name: 'Deep Work Session', description: '2 hours focused work', iconName: 'target' as HabitIconName, categoryId: 'productivity' },
      { name: 'No Social Media', description: 'Avoid distractions during work', iconName: 'zap' as HabitIconName, categoryId: 'productivity' },
      { name: 'Plan Tomorrow', description: 'Prepare tasks for the next day', iconName: 'briefcase' as HabitIconName, categoryId: 'productivity' },
    ],
  },
  {
    category: 'Learning',
    habits: [
      { name: 'Read 30 Pages', description: 'Daily reading habit', iconName: 'book' as HabitIconName, categoryId: 'learning' },
      { name: 'Practice New Skill', description: '30 minutes of practice', iconName: 'trending-up' as HabitIconName, categoryId: 'learning' },
      { name: 'Journal Entry', description: 'Write daily reflections', iconName: 'pen-tool' as HabitIconName, categoryId: 'learning' },
    ],
  },
];

interface CreateHabitDialogProps {
  categories: HabitCategory[];
  onCreateHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  editHabit?: Habit | null;
  onUpdateHabit?: (id: string, updates: Partial<Habit>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateHabitDialog = ({
  categories,
  onCreateHabit,
  editHabit,
  onUpdateHabit,
  open,
  onOpenChange,
}: CreateHabitDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [name, setName] = useState(editHabit?.name || '');
  const [description, setDescription] = useState(editHabit?.description || '');
  const [categoryId, setCategoryId] = useState(editHabit?.categoryId || categories[0]?.id || '');
  const [selectedIcon, setSelectedIcon] = useState<HabitIconName>(editHabit?.iconName || 'target');
  const [activeTab, setActiveTab] = useState<'create' | 'templates'>(editHabit ? 'create' : 'templates');

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setSelectedIcon('target');
    setActiveTab('templates');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editHabit && onUpdateHabit) {
      onUpdateHabit(editHabit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        categoryId,
        iconName: selectedIcon,
      });
    } else {
      onCreateHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        categoryId,
        iconName: selectedIcon,
      });
    }

    resetForm();
    setIsOpen(false);
  };

  const handleUseTemplate = (template: { name: string; description: string; iconName: HabitIconName; categoryId: string }) => {
    // Map template categoryId (name-based) to actual category UUID
    const categoryName = template.categoryId.toLowerCase();
    const actualCategory = categories.find(cat => 
      cat.name.toLowerCase() === categoryName || 
      cat.name.toLowerCase().includes(categoryName)
    );
    
    onCreateHabit({
      name: template.name,
      description: template.description,
      categoryId: actualCategory?.id || categories[0]?.id || '',
      iconName: template.iconName,
    });
    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      {!editHabit && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3 text-xs">
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">New Habit</span>
            <span className="sm:hidden">New</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-[95vw] sm:max-w-[520px] max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            {editHabit ? 'Edit Habit' : 'Add New Habit'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editHabit ? 'Edit your habit details including name, icon, description and category' : 'Create a new habit by choosing from templates or creating a custom one'}
          </DialogDescription>
        </DialogHeader>

        {!editHabit && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'templates')} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
              <TabsTrigger value="templates" className="gap-1 sm:gap-1.5 text-xs sm:text-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-1 sm:gap-1.5 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Custom
              </TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-3 sm:pr-4">
              {HABIT_TEMPLATES.map((templateGroup) => (
                <div key={templateGroup.category}>
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2 px-0.5">
                    {templateGroup.category}
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    {templateGroup.habits.map((template) => {
                      const IconComponent = HABIT_ICONS[template.iconName];
                      return (
                        <button
                          key={template.name}
                          type="button"
                          onClick={() => handleUseTemplate(template)}
                          className="w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-border bg-card hover:bg-accent/10 hover:border-accent/30 transition-all text-left group"
                        >
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                            <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary group-hover:text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm text-foreground">{template.name}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{template.description}</p>
                          </div>
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Custom Tab */}
            <TabsContent value="create" className="mt-3 sm:mt-4 overflow-y-auto flex-1 pr-3 sm:pr-4">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
                {/* Icon Selection */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Icon</Label>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {ICON_LIST.map(({ name: iconName, label }) => {
                      const IconComponent = HABIT_ICONS[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setSelectedIcon(iconName)}
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center transition-all",
                            "hover:bg-secondary border",
                            selectedIcon === iconName
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border text-muted-foreground hover:text-foreground"
                          )}
                          title={label}
                        >
                          <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Exercise"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this habit involve?"
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span>{cat.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!name.trim()} className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4">
                    Create Habit
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {/* Edit mode - no tabs */}
        {editHabit && (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5 pt-3 sm:pt-4 overflow-y-auto flex-1 pr-3 sm:pr-4">
            {/* Icon Selection */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Icon</Label>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {ICON_LIST.map(({ name: iconName, label }) => {
                  const IconComponent = HABIT_ICONS[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={cn(
                        "w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center transition-all",
                        "hover:bg-secondary border",
                        selectedIcon === iconName
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      )}
                      title={label}
                    >
                      <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Exercise"
                className="h-9 sm:h-10 text-sm"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this habit involve?"
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 sm:gap-3 pt-1 sm:pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()} className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
