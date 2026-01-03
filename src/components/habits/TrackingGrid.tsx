import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TrackingGridProps {
  completions: Record<string, boolean>;
  onToggle: (date: string) => void;
  categoryColor: string;
  daysToShow?: number;
}

export const TrackingGrid = ({
  completions,
  onToggle,
  categoryColor,
  daysToShow = 21,
}: TrackingGridProps) => {
  const today = startOfDay(new Date());
  const startDate = subDays(today, daysToShow - 1);
  const days = eachDayOfInterval({ start: startDate, end: today });

  return (
    <div className="flex gap-1 flex-wrap">
      {days.map((day, index) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isCompleted = completions[dateStr];
        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        const dayLabel = format(day, 'EEE');
        const dateLabel = format(day, 'MMM d');

        return (
          <Tooltip key={dateStr}>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.015, duration: 0.2 }}
                onClick={() => onToggle(dateStr)}
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200",
                  "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  isToday && "ring-2 ring-primary/40",
                  isCompleted
                    ? "shadow-sm"
                    : "bg-secondary/60 hover:bg-secondary"
                )}
                style={{
                  backgroundColor: isCompleted ? categoryColor : undefined,
                }}
              >
                <AnimatePresence mode="wait">
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-medium">{dayLabel}, {dateLabel}</p>
              <p className="text-muted-foreground">
                {isCompleted ? 'Completed ✓' : 'Not completed'}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
