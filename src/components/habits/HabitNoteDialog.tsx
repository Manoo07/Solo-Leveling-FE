import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface HabitNoteDialogProps {
  habitId: string;
  habitName: string;
  date: string;
  existingNote?: string;
  isCompleted: boolean;
  onSaveNote: (habitId: string, date: string, note: string) => void;
  onDeleteNote: (habitId: string, date: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HabitNoteDialog = ({
  habitId,
  habitName,
  date,
  existingNote = '',
  isCompleted,
  onSaveNote,
  onDeleteNote,
  open,
  onOpenChange,
}: HabitNoteDialogProps) => {
  const [note, setNote] = useState(existingNote);

  const handleSave = () => {
    if (note.trim()) {
      onSaveNote(habitId, date, note.trim());
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDeleteNote(habitId, date);
    setNote('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4 text-accent" />
            Note for {habitName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              isCompleted 
                ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" 
                : "bg-muted text-muted-foreground"
            )}>
              {isCompleted ? 'Completed' : 'Not completed'}
            </span>
          </div>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this entry... (e.g., how you felt, what you did, any observations)"
            rows={4}
            className="resize-none"
            autoFocus
          />

          <div className="flex justify-between gap-2">
            {existingNote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Note
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!note.trim()} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
