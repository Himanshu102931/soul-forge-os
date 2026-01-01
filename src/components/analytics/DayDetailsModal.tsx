import { format, isFuture } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDaySummary, useDayHabitLogs, useDayMetrics } from '@/hooks/useChronicles';
import { useAllHabits } from '@/hooks/useHabits';
import { VictoriesTab } from '@/components/chronicles/tabs/VictoriesTab';
import { Calendar, Sparkles, Shield, Check, Circle, Pause, Bed, Footprints, Trophy, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HabitStatus } from '@/lib/rpg-utils';

interface DayDetailsModalProps {
  date: string | null;
  onClose: () => void;
}

export function DayDetailsModal({ date, onClose }: DayDetailsModalProps) {
  const { data: summary } = useDaySummary(date || '');
  const { data: habitLogs } = useDayHabitLogs(date || '');
  const { data: allHabits } = useAllHabits();
  const { data: metrics } = useDayMetrics(date || '');

  if (!date) return null;

  const dateObj = new Date(date);
  const isFutureDate = isFuture(dateObj);
  const selectedDayOfWeek = dateObj.getDay();

  // Filter habits scheduled for this day
  const scheduledHabits = allHabits?.filter(h => 
    !h.archived && !h.is_bad_habit && h.frequency_days.includes(selectedDayOfWeek)
  ) || [];

  const completedHabits = habitLogs?.filter(l => l.status === 'completed').length || 0;
  const totalHabits = scheduledHabits.length;
  const sleep = metrics?.sleep || 0;
  const steps = metrics?.steps || 0;

  const getHabitStatus = (habitId: string): HabitStatus => {
    const log = habitLogs?.find(l => l.habit_id === habitId);
    return log?.status || null;
  };

  const getStatusIcon = (status: HabitStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3" />;
      case 'partial':
        return <Circle className="w-3 h-3 fill-current" />;
      case 'skipped':
        return <Pause className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: HabitStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'partial':
        return 'bg-yellow-500 text-white';
      case 'skipped':
        return 'bg-blue-500 text-white';
      default:
        return 'border border-muted-foreground';
    }
  };

  const getCardStyles = (status: HabitStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 border border-emerald-500/30';
      case 'partial':
        return 'bg-yellow-500/10 border border-yellow-500/30';
      case 'skipped':
        return 'bg-blue-500/10 border border-blue-500/30';
      default:
        return 'bg-secondary/50';
    }
  };

  const getXPLabel = (status: HabitStatus, xpReward: number) => {
    switch (status) {
      case 'completed':
        return `+${xpReward} XP`;
      case 'partial':
        return `+${Math.floor(xpReward / 2)} XP`;
      case 'skipped':
        return 'Skipped';
      default:
        return null;
    }
  };

  const regularHabits = allHabits?.filter(h => 
    !h.archived && !h.is_bad_habit && h.frequency_days.includes(selectedDayOfWeek)
  ) || [];
  
  const badHabits = allHabits?.filter(h => !h.archived && h.is_bad_habit) || [];

  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {format(dateObj, 'EEEE, MMMM d, yyyy')}
            </span>
            {summary && !isFutureDate && (
              <span className="text-sm font-normal text-primary flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                +{summary.xp_earned} XP
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isFutureDate ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Future Date</h3>
            <p className="text-sm text-muted-foreground">
              This date hasn't arrived yet. Check back later to see your progress!
            </p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="journal">Journal</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="victories">Victories</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {/* Read-only Overview */}
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Trophy className="w-3 h-3" />
                      <span>Completed</span>
                    </div>
                    <div className="text-lg font-bold">{completedHabits}/{totalHabits}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Bed className="w-3 h-3" />
                      <span>Sleep</span>
                    </div>
                    <div className="text-lg font-bold">{sleep}h</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Footprints className="w-3 h-3" />
                      <span>Steps</span>
                    </div>
                    <div className="text-lg font-bold">{steps.toLocaleString()}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Smile className="w-3 h-3" />
                      <span>Mood</span>
                    </div>
                    <div className="text-lg font-bold">
                      {summary?.mood_score ? ['😢', '😕', '😐', '🙂', '😄'][summary.mood_score - 1] : '—'}
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                {summary?.ai_response && (
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm italic text-muted-foreground">"{summary.ai_response}"</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="journal" className="mt-4">
              {/* Read-only Journal */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Smile className="w-4 h-4" />
                    Mood
                  </label>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    {summary?.mood_score ? (
                      <div className="text-sm">
                        {['😢 Terrible (1)', '😕 Bad (2)', '😐 Neutral (3)', '🙂 Good (4)', '😄 Excellent (5)'][summary.mood_score - 1]}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No mood recorded</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Journal Notes</label>
                  <div className="bg-secondary/50 p-3 rounded-lg min-h-[120px]">
                    {summary?.notes ? (
                      <p className="text-sm whitespace-pre-wrap">{summary.notes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No notes for this day</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="habits" className="mt-4">
              {/* Read-only Habits View */}
              <div className="space-y-6">
                {/* Regular Habits */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Protocols <span className="text-xs opacity-70">({dateObj.toLocaleDateString('en-US', { weekday: 'long' })})</span>
                  </h4>
                  <div className="space-y-2">
                    {regularHabits.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No habits scheduled for this day</p>
                    ) : (
                      regularHabits.map((habit) => {
                        const status = getHabitStatus(habit.id);
                        return (
                          <div
                            key={habit.id}
                            className={cn(
                              'p-3 rounded-lg transition-colors cursor-default',
                              getCardStyles(status)
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn('w-6 h-6 rounded flex items-center justify-center', getStatusStyles(status))}>
                                  {getStatusIcon(status)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{habit.title}</p>
                                  {habit.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs font-medium text-primary ml-2">
                                {getXPLabel(status, habit.xp_reward || 10)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Bad Habits */}
                {badHabits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Resistances (Every Day)
                    </h4>
                    <div className="space-y-2">
                      {badHabits.map((habit) => {
                        const status = getHabitStatus(habit.id);
                        return (
                          <div
                            key={habit.id}
                            className={cn(
                              'p-3 rounded-lg transition-colors cursor-default',
                              getCardStyles(status)
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn('w-6 h-6 rounded flex items-center justify-center', getStatusStyles(status))}>
                                  {getStatusIcon(status)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{habit.title}</p>
                                  {habit.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs font-medium text-primary ml-2">
                                {getXPLabel(status, habit.xp_reward || 10)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="victories" className="mt-4">
              <VictoriesTab date={date} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
