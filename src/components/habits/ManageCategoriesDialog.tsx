import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { HabitCategory } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
  '#eab308', '#84cc16', '#64748b',
];

interface ManageCategoriesDialogProps {
  categories: HabitCategory[];
  onAddCategory: (category: Omit<HabitCategory, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

export const ManageCategoriesDialog = ({
  categories,
  onAddCategory,
  onDeleteCategory,
}: ManageCategoriesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddCategory({
      name: newName.trim(),
      color: newColor,
    });

    setNewName('');
    setNewColor(PRESET_COLORS[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs">
          <span className="hidden sm:inline">Manage Categories</span>
          <span className="sm:hidden">Categories</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Existing Categories */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Categories</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Category */}
          <form onSubmit={handleAddCategory} className="space-y-3 pt-2 border-t border-border">
            <Label className="text-sm font-medium">Add New Category</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name..."
              className="h-9"
            />
            <div>
              <Label className="text-xs text-muted-foreground">Color</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform hover:scale-110",
                      newColor === color && "ring-2 ring-offset-2 ring-foreground"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" size="sm" disabled={!newName.trim()} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
