import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Flame, Star, Trophy, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export interface Milestone {
  id: string;
  habitId: string;
  habitName: string;
  days: number;
  type: 'streak' | 'total';
  earnedAt: string;
}

interface MilestoneBadgeProps {
  milestone: Milestone;
  onDismiss: () => void;
}

const getBadgeConfig = (days: number) => {
  if (days >= 100) return { icon: Crown, color: '#fbbf24', label: 'Legendary', gradient: 'from-amber-400 to-yellow-500' };
  if (days >= 50) return { icon: Trophy, color: '#a855f7', label: 'Master', gradient: 'from-purple-400 to-violet-500' };
  if (days >= 30) return { icon: Star, color: '#3b82f6', label: 'Champion', gradient: 'from-blue-400 to-indigo-500' };
  if (days >= 21) return { icon: Zap, color: '#22c55e', label: 'Achiever', gradient: 'from-green-400 to-emerald-500' };
  if (days >= 14) return { icon: Flame, color: '#f97316', label: 'Dedicated', gradient: 'from-orange-400 to-amber-500' };
  return { icon: Award, color: '#64748b', label: 'Started', gradient: 'from-slate-400 to-gray-500' };
};

export const MilestoneBadge = ({ milestone, onDismiss }: MilestoneBadgeProps) => {
  const config = getBadgeConfig(milestone.days);
  const Icon = config.icon;

  useEffect(() => {
    // Fire confetti on mount
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: [config.color, '#fbbf24', '#22c55e'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: [config.color, '#fbbf24', '#22c55e'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [config.color]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative bg-card border border-border rounded-2xl p-8 shadow-float max-w-sm mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className={cn(
            "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
            `bg-gradient-to-br ${config.gradient}`
          )}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: 2, duration: 0.5, delay: 0.5 }}
          >
            <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            {config.label}
          </p>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {milestone.days} Day{milestone.days > 1 ? 's' : ''}!
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {milestone.type === 'streak' ? 'Streak' : 'Total completions'} for
          </p>
          <p className="text-lg font-semibold text-foreground">
            {milestone.habitName}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onDismiss}
          className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

interface MilestoneTrackerProps {
  habits: Array<{
    id: string;
    name: string;
    currentStreak: number;
    totalCompletions: number;
  }>;
}

const MILESTONE_THRESHOLDS = [7, 14, 21, 30, 50, 100, 365];

export const useMilestoneTracker = (habits: MilestoneTrackerProps['habits']) => {
  const [pendingMilestone, setPendingMilestone] = useState<Milestone | null>(null);
  const [shownMilestones, setShownMilestones] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('solo-leveling_milestones');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    // Check for new milestones
    for (const habit of habits) {
      for (const threshold of MILESTONE_THRESHOLDS) {
        const streakKey = `${habit.id}-streak-${threshold}`;
        if (habit.currentStreak >= threshold && !shownMilestones.has(streakKey)) {
          setPendingMilestone({
            id: streakKey,
            habitId: habit.id,
            habitName: habit.name,
            days: threshold,
            type: 'streak',
            earnedAt: new Date().toISOString(),
          });
          return;
        }
      }
    }
  }, [habits, shownMilestones]);

  const dismissMilestone = () => {
    if (pendingMilestone) {
      const newShown = new Set(shownMilestones);
      newShown.add(pendingMilestone.id);
      setShownMilestones(newShown);
      localStorage.setItem('solo-leveling_milestones', JSON.stringify([...newShown]));
      setPendingMilestone(null);
    }
  };

  return { pendingMilestone, dismissMilestone };
};
