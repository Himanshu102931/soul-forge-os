import { useState } from 'react';
import { useXPVelocity, useVitalsHistory, useHabitMastery } from '@/hooks/useChronicles';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { formatDateShort } from '@/lib/time-utils';
import { Zap, Heart, Award, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type SortMode = 'highest' | 'lowest' | 'alpha';

export function PlayerStats() {
  const { data: xpData, isLoading: xpLoading } = useXPVelocity();
  const { data: vitalsData, isLoading: vitalsLoading } = useVitalsHistory();
  const { data: masteryData, isLoading: masteryLoading } = useHabitMastery();
  const [sortMode, setSortMode] = useState<SortMode>('highest');

  const cycleSortMode = () => {
    const modes: SortMode[] = ['highest', 'lowest', 'alpha'];
    const currentIndex = modes.indexOf(sortMode);
    setSortMode(modes[(currentIndex + 1) % modes.length]);
  };

  const sortedMastery = masteryData ? [...masteryData].sort((a, b) => {
    if (sortMode === 'highest') return b.level - a.level;
    if (sortMode === 'lowest') return a.level - b.level;
    return a.title.localeCompare(b.title);
  }) : [];

  const sortLabel = {
    highest: 'Highest Level',
    lowest: 'Lowest Level',
    alpha: 'A-Z',
  }[sortMode];

  return (
    <div className="space-y-6">
      {/* Skill Mastery - MOVED TO TOP */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Skill Mastery</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleSortMode}
            className="h-8 text-xs"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            {sortLabel}
          </Button>
        </div>
        
        {masteryLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : sortedMastery.length ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sortedMastery.map(habit => {
              // Calculate XP within current level (0-100)
              const currentXP = habit.currentXP || 0;
              const progressPercent = habit.progressPercent || 0;
              
              return (
                <div
                  key={habit.id}
                  className="p-3 bg-secondary/50 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{habit.title}</span>
                    <span className="text-xs font-bold text-amber-400">
                      Lvl {habit.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={progressPercent} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-14 text-right">
                      {currentXP}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No habits mastered yet. Start completing habits!
          </p>
        )}
      </div>

      {/* Vitals Monitor */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-rose-500" />
          <h3 className="font-semibold">Vitals Monitor</h3>
        </div>
        
        {vitalsLoading ? (
          <div className="h-48 bg-muted rounded animate-pulse" />
        ) : vitalsData?.length ? (
          <div className="space-y-6">
            {/* Sleep Chart */}
            <div>
              <p className="text-xs text-purple-400 mb-2">Sleep (hours)</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => formatDateShort(v)}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <YAxis 
                      domain={[0, 12]}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}h`, 'Sleep']}
                      labelFormatter={(label) => formatDateShort(label)}
                    />
                    <ReferenceLine y={7} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="sleep" 
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Steps Chart */}
            <div>
              <p className="text-xs text-blue-400 mb-2">Steps</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => formatDateShort(v)}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value.toLocaleString(), 'Steps']}
                      labelFormatter={(label) => formatDateShort(label)}
                    />
                    <ReferenceLine y={10000} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="steps" 
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No vitals data yet. Track your sleep and steps!
          </p>
        )}
      </div>

      {/* XP Velocity - MOVED TO BOTTOM */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">XP Velocity</h3>
        </div>
        
        {xpLoading ? (
          <div className="h-48 bg-muted rounded animate-pulse" />
        ) : xpData?.length ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(v) => formatDateShort(v)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value} XP`, 'XP Earned']}
                  labelFormatter={(label) => formatDateShort(label)}
                />
                <Bar 
                  dataKey="xp_earned" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No XP data yet. Complete habits to track your velocity!
          </p>
        )}
      </div>
    </div>
  );
}
