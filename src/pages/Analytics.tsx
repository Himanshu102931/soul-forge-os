<<<<<<< HEAD
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useAnalyticsSummary, 
  useHabitStatistics, 
  useCompletionTrend,
  useCompletionHeatmap 
} from '@/hooks/useAdvancedAnalytics';
import { TrendingUp, Sparkles, Crown } from 'lucide-react';
import { RankTiersCard } from '@/components/RankTiersCard';
import { AchievementMilestoneSummary } from '@/components/analytics/AchievementMilestoneSummary';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';
import { useUserLevel, useUserRank } from '@/hooks/useGamification';
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { CompletionTrendChart } from '@/components/analytics/CompletionTrendChart';
import { ActivityHeatmapSection } from '@/components/analytics/ActivityHeatmapSection';
import { TopPerformers } from '@/components/analytics/TopPerformers';
import { ZenithPathDisplay } from '@/components/analytics/ZenithPathDisplay';

export default function Analytics() {
  const [dateRange, setDateRange] = useState(30);
  const [topPerformersOpen, setTopPerformersOpen] = useState(false);
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(dateRange);
  const { data: habitStats, isLoading: statsLoading } = useHabitStatistics(dateRange);
  const { data: trendData, isLoading: trendLoading } = useCompletionTrend(dateRange);
  const { data: heatmapData, isLoading: heatmapLoading } = useCompletionHeatmap(90);
  const { data: profile } = useProfile();
  const { data: userLevel } = useUserLevel();
  const { data: rankData } = useUserRank();

  // Check if there's any data
  const hasData = !!((summary?.totalCompletions ?? 0) > 0 || (habitStats?.length ?? 0) > 0);

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep dive into your habit journey</p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="zenith" className="gap-2">
            <Crown className="w-4 h-4" />
            Path to Zenith
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Empty State for New Users */}
          {!summaryLoading && !hasData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-8 text-center"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-bold mb-2">Your Analytics Await!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking habits to unlock powerful insights about your journey
              </p>
            </motion.div>
          )}

          {hasData && (
            <>
              {/* Date Range Selector - Only show if has data */}
              <DateRangeSelector 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />

              {/* Summary Cards */}
              {summary && <SummaryCards summary={summary} />}

              {/* Summary Cards Loading */}
              {!summary && summaryLoading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl p-4 border border-border">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              )}

              {/* Completion Trend Chart */}
              {hasData && (
                trendLoading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5" />
                      <h3 className="font-semibold">Completion Trend</h3>
                    </div>
                    <div className="h-48 bg-secondary/30 rounded animate-pulse" />
                  </motion.div>
                ) : trendData && trendData.length > 0 && (
                  <CompletionTrendChart data={trendData} />
                )
              )}

              {/* Completion Heatmap */}
              {hasData && (
                heatmapLoading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5" />
                      <h3 className="font-semibold">Activity Heatmap</h3>
                    </div>
                    <div className="h-32 bg-secondary/30 rounded animate-pulse" />
                  </motion.div>
                ) : heatmapData && (
                  <ActivityHeatmapSection data={heatmapData} />
                )
              )}

              {/* Top Performing Habits */}
              <TopPerformers 
                habitStats={habitStats || []}
                statsLoading={statsLoading}
                isOpen={topPerformersOpen}
                onOpenChange={setTopPerformersOpen}
              />

              {/* Achievements Milestone Summary */}
              {hasData && <AchievementMilestoneSummary />}
            </>
          )}
        </TabsContent>

        {/* Path to Zenith Tab */}
        <TabsContent value="zenith" className="space-y-6">
          {/* Title & Total XP Display */}
          {profile && userLevel && rankData && (
            <ZenithPathDisplay 
              profile={profile}
              userLevel={userLevel}
              rankData={{ ...rankData, nextRank: rankData.nextRank ?? undefined }}
            />
          )}

          {/* Rank Tiers */}
          <RankTiersCard />
        </TabsContent>
      </Tabs>
=======
import { motion } from 'framer-motion';
import { useConsistencyScore } from '@/hooks/useAnalytics';
import { useDailySummaries } from '@/hooks/useDailySummary';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, BookOpen } from 'lucide-react';
import { formatDateShort } from '@/lib/time-utils';
import { HabitHeatmap } from '@/components/analytics/HabitHeatmap';
import { XPHPChart } from '@/components/analytics/XPHPChart';
import { TopPerformers } from '@/components/analytics/TopPerformers';
import { StreakCard } from '@/components/analytics/StreakCard';

export default function Analytics() {
  const { data: consistency, isLoading: consistencyLoading } = useConsistencyScore();
  const { data: summaries, isLoading: summariesLoading } = useDailySummaries();

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl md:text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your progress over time</p>
      </motion.div>

      {/* XP & HP Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <XPHPChart />
      </motion.div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HabitHeatmap />
      </motion.div>

      {/* Two-column layout for Streaks and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StreakCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <TopPerformers />
        </motion.div>
      </div>

      {/* Consistency Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-6 text-center"
      >
        <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
        <div className="text-5xl font-bold text-primary mb-1">
          {consistencyLoading ? '--' : `${consistency?.score || 0}%`}
        </div>
        <p className="text-sm text-muted-foreground">Consistency Score (Last 30 Days)</p>
      </motion.div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <h3 className="font-semibold mb-4">Consistency Trend</h3>
        {consistency?.data && (
          <div className="h-48 w-full overflow-x-auto -mx-4 px-4">
            <div className="min-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consistency.data.slice(-14)}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(v) => formatDateShort(v)}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consistency" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </motion.div>

      {/* Journal Archive */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-semibold">Journal Archive</h3>
        </div>
        
        {summariesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : summaries?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No journal entries yet. Complete a nightly review to start.
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {summaries?.map(summary => (
              <div key={summary.id} className="p-3 bg-secondary/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{formatDateShort(summary.date)}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-primary">+{summary.xp_earned} XP</span>
                    <span className="text-destructive">-{summary.hp_lost} HP</span>
                  </div>
                </div>
                {summary.notes && (
                  <p className="text-sm line-clamp-2">{summary.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
>>>>>>> cf46c6e (Initial commit: project files)
    </div>
  );
}
