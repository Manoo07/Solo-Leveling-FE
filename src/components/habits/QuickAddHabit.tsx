import { useState } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Habit, HabitCategory, HABIT_ICONS, ICON_LIST, HabitIconName } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuickAddHabitProps {
  categories: HabitCategory[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

export const QuickAddHabit = ({ categories, onAddHabit }: QuickAddHabitProps) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddHabit({
      name: name.trim(),
      categoryId,
      iconName: 'target',
      frequency: 'daily',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
    });

    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New habit..."
        className="flex-1 h-8 text-sm"
      />
      <Select value={categoryId} onValueChange={setCategoryId}>
        <SelectTrigger className="w-[120px] h-8 text-xs bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border z-50">
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id} className="text-xs">
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
      <Button type="submit" disabled={!name.trim()} size="sm" className="gap-1 h-8 px-3">
        <Plus className="w-3.5 h-3.5" />
        Add
      </Button>
    </form>
  );
};
