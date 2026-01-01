import { motion } from 'framer-motion';
import { Target, Flame, Trophy, Zap } from 'lucide-react';
import type { HabitStats } from '@/lib/analytics-utils';

interface Milestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  icon: string;
  color: string;
}

interface AnalyticsSummary {
  totalHabits: number;
  totalCompletions: number;
  totalAttempts: number;
  overallCompletionRate: number;
  bestCurrentStreak: number;
  longestEverStreak: number;
  milestones: {
    streak: Milestone[];
    completion: Milestone[];
  };
  topPerformers: HabitStats[];
  strugglingHabits: HabitStats[];
}

interface SummaryCardsProps {
  summary: AnalyticsSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">Completion</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-blue-500">
          {Math.round(summary.overallCompletionRate)}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          overall success rate
        </div>
      </motion.div>

      {/* Current Streak */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-muted-foreground">Best Streak</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-orange-500">
          {summary.bestCurrentStreak}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          days in a row
        </div>
      </motion.div>

      {/* Total Completions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Total Done</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-green-500">
          {summary.totalCompletions}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          habits completed
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-muted-foreground">Badges</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-purple-500">
          {summary.milestones.streak.length + summary.milestones.completion.length}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          achievements
        </div>
      </motion.div>
    </div>
  );
}
