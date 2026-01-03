import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Trophy, Star, Target, Crown, Flame, Zap, Heart, Medal,
  Plus, Check, Award, Sparkles, Lock
} from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useGoals } from '@/hooks/useGoals';
import { Badge } from '@/types/goals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoalCard } from '@/components/goals/GoalCard';
import { ShareAchievement } from '@/components/goals/ShareAchievement';

const BADGE_ICONS: Record<Badge['icon'], typeof Trophy> = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  crown: Crown,
  flame: Flame,
  target: Target,
  zap: Zap,
  heart: Heart,
};

const Goals = () => {
  const { habits } = useHabits();
  const { 
    goals, badges, achievements, milestones, stats,
    addGoal, deleteGoal, completeGoal,
    addMilestone, completeMilestone
  } = useGoals(habits);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: 30,
    dueDate: '',
    linkedHabitIds: [] as string[],
  });

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) return;
    
    addGoal({
      title: newGoal.title,
      description: newGoal.description,
      targetValue: newGoal.targetValue,
      dueDate: newGoal.dueDate || undefined,
      linkedHabitIds: newGoal.linkedHabitIds,
      visibility: 'private',
    });
    
    setNewGoal({ title: '', description: '', targetValue: 30, dueDate: '', linkedHabitIds: [] });
    setIsCreateOpen(false);
  };

  const toggleLinkedHabit = (habitId: string) => {
    setNewGoal(prev => ({
      ...prev,
      linkedHabitIds: prev.linkedHabitIds.includes(habitId)
        ? prev.linkedHabitIds.filter(id => id !== habitId)
        : [...prev.linkedHabitIds, habitId],
    }));
  };

  const earnedBadges = badges.filter(b => b.isEarned);
  const lockedBadges = badges.filter(b => !b.isEarned);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals & Achievements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set goals, earn badges, and track your progress
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a goal and link habits to track your progress automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Read 30 books this year"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Why is this goal important to you?"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Target (completions)</Label>
                  <Input
                    id="target"
                    type="number"
                    min={1}
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              {habits.length > 0 && (
                <div className="space-y-2">
                  <Label>Link Habits (progress auto-tracks)</Label>
                  <ScrollArea className="h-32 rounded-md border p-2">
                    <div className="space-y-2">
                      {habits.map(habit => (
                        <div key={habit.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`habit-${habit.id}`}
                            checked={newGoal.linkedHabitIds.includes(habit.id)}
                            onCheckedChange={() => toggleLinkedHabit(habit.id)}
                          />
                          <label 
                            htmlFor={`habit-${habit.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {habit.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGoal} disabled={!newGoal.title.trim()}>
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">Active Goals</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.activeGoals}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--success))]">{stats.completedGoals}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium">Badges Earned</span>
          </div>
          <p className="text-2xl font-bold text-accent">{stats.earnedBadges}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">Progress</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats.totalBadges > 0 ? Math.round((stats.earnedBadges / stats.totalBadges) * 100) : 0}%
          </p>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="goals" className="gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          {goals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No goals yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                  Create your first goal to start tracking progress toward something meaningful.
                </p>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  habits={habits}
                  milestones={milestones}
                  index={index}
                  onComplete={completeGoal}
                  onDelete={deleteGoal}
                  onAddMilestone={addMilestone}
                  onCompleteMilestone={completeMilestone}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          {/* Earned Badges */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Earned Badges ({earnedBadges.length})
            </h3>
            {earnedBadges.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Keep tracking your habits to earn your first badge!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {earnedBadges.map((badge, index) => {
                  const Icon = BADGE_ICONS[badge.icon];
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow h-full">
                        <div 
                          className="absolute inset-0 opacity-10"
                          style={{ backgroundColor: badge.color }}
                        />
                        <CardContent className="p-4 text-center relative h-full flex flex-col">
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${badge.color}20` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: badge.color }} />
                          </div>
                          <h4 className="font-medium text-sm text-foreground">{badge.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 flex-1">
                            {badge.description}
                          </p>
                          {badge.earnedAt && (
                            <p className="text-[10px] text-muted-foreground/70 mt-2">
                              {format(new Date(badge.earnedAt), 'MMM d, yyyy')}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Locked Badges */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Locked Badges ({lockedBadges.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {lockedBadges.map((badge, index) => {
                const Icon = BADGE_ICONS[badge.icon];
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="opacity-60 grayscale h-full">
                      <CardContent className="p-4 text-center h-full flex flex-col">
                        <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-muted flex-shrink-0">
                          <Icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h4 className="font-medium text-sm text-foreground">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 flex-1">
                          {badge.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Achievements Feed Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No achievements yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Start tracking habits and completing goals to see your achievements here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const iconMap: Record<string, typeof Trophy> = {
                  trophy: Trophy,
                  medal: Medal,
                  star: Star,
                  crown: Crown,
                  flame: Flame,
                  target: Target,
                  zap: Zap,
                  heart: Heart,
                };
                const Icon = iconMap[achievement.icon] || Star;
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${achievement.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: achievement.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(achievement.earnedAt), 'MMM d')}
                          </span>
                          <ShareAchievement achievement={achievement} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;
