import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Trash2, Calendar, ChevronDown, ChevronUp, Plus, Flag
} from 'lucide-react';
import { Goal, Milestone } from '@/types/goals';
import { HabitWithStats } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  habits: HabitWithStats[];
  milestones: Milestone[];
  index: number;
  onComplete: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id' | 'isCompleted'>) => void;
  onCompleteMilestone: (milestoneId: string) => void;
}

export const GoalCard = ({
  goal,
  habits,
  milestones,
  index,
  onComplete,
  onDelete,
  onAddMilestone,
  onCompleteMilestone,
}: GoalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);

  const progress = goal.targetValue > 0 
    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    : 0;
  const linkedHabits = habits.filter(h => goal.linkedHabitIds.includes(h.id));
  const goalMilestones = milestones.filter(m => m.goalId === goal.id);
  const completedMilestones = goalMilestones.filter(m => m.isCompleted).length;

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    onAddMilestone({
      goalId: goal.id,
      title: newMilestoneTitle,
      targetValue: Math.round(goal.targetValue * 0.25), // Default to 25% milestone
    });
    setNewMilestoneTitle('');
    setShowMilestoneInput(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(
        "transition-all",
        goal.status === 'completed' && "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
      )}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
                {goal.status === 'completed' && (
                  <UIBadge variant="secondary" className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
                    <Check className="w-3 h-3 mr-1" />
                    Completed
                  </UIBadge>
                )}
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                  {goal.description}
                </p>
              )}
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {goal.currentValue} / {goal.targetValue}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Milestones Summary */}
              {goalMilestones.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Flag className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {completedMilestones}/{goalMilestones.length} milestones
                  </span>
                </div>
              )}

              {/* Linked Habits */}
              {linkedHabits.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs text-muted-foreground">Linked:</span>
                  {linkedHabits.slice(0, 3).map(h => (
                    <UIBadge key={h.id} variant="outline" className="text-xs">
                      {h.name}
                    </UIBadge>
                  ))}
                  {linkedHabits.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{linkedHabits.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              {goal.dueDate && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Due {format(new Date(goal.dueDate), 'MMM d, yyyy')}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {goal.status === 'active' && progress >= 100 && (
                <Button
                  size="sm"
                  onClick={() => onComplete(goal.id)}
                  className="gap-1 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90"
                >
                  <Check className="w-3.5 h-3.5" />
                  Complete
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(goal.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Expanded Milestones Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Flag className="w-3.5 h-3.5 text-accent" />
                      Milestones
                    </h4>
                    {goal.status === 'active' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowMilestoneInput(true)}
                        className="h-7 text-xs gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                    )}
                  </div>

                  {/* Milestones List */}
                  {goalMilestones.length === 0 && !showMilestoneInput ? (
                    <p className="text-xs text-muted-foreground py-2">
                      No milestones yet. Add checkpoints to track progress.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {goalMilestones.map(milestone => (
                        <div
                          key={milestone.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg",
                            milestone.isCompleted 
                              ? "bg-[hsl(var(--success))]/5" 
                              : "bg-muted/50"
                          )}
                        >
                          <button
                            onClick={() => !milestone.isCompleted && onCompleteMilestone(milestone.id)}
                            disabled={milestone.isCompleted}
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              milestone.isCompleted
                                ? "bg-[hsl(var(--success))] border-[hsl(var(--success))]"
                                : "border-muted-foreground/30 hover:border-accent"
                            )}
                          >
                            {milestone.isCompleted && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <span className={cn(
                            "text-sm flex-1",
                            milestone.isCompleted && "line-through text-muted-foreground"
                          )}>
                            {milestone.title}
                          </span>
                          {milestone.completedAt && (
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(milestone.completedAt), 'MMM d')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Milestone Input */}
                  <AnimatePresence>
                    {showMilestoneInput && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <Input
                          placeholder="Milestone title..."
                          value={newMilestoneTitle}
                          onChange={(e) => setNewMilestoneTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleAddMilestone} className="h-8">
                          Add
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setShowMilestoneInput(false)}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
