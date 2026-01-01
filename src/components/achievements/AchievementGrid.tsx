import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid3x3, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGamificationStats } from '@/hooks/useGamification';
import { GAMIFICATION_ACHIEVEMENTS } from '@/lib/gamification-utils';
import { AchievementDetailModal } from './AchievementDetailModal';
import { AchievementGridHoneycomb } from './AchievementGridHoneycomb';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useStaggeredAnimation, ANIMATION_TIMINGS } from '@/lib/animation-optimizer';
import { generateAriaLabel } from '@/lib/accessibility';

type FilterType = 'all' | 'unlocked' | 'locked';
type CategoryType = 'all' | 'streak' | 'completion' | 'consistency' | 'combo' | 'xp' | 'level' | 'time' | 'challenge' | 'seasonal' | 'milestone' | 'health' | 'learning' | 'wellbeing' | 'social' | 'productivity' | 'growth' | 'creative' | 'rare';
type ViewLayout = 'grid' | 'circles';

interface AchievementWithStatus {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  condition: string;
  category: CategoryType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  isNearUnlock?: boolean;
}

export function AchievementGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<CategoryType>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithStatus | null>(null);
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');
  
  const { data: stats, isLoading } = useGamificationStats();
  const staggerVariants = useStaggeredAnimation(24); // Default to 24 items per page

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-10 flex-1 min-w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(24)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Map all achievements with unlock status and inferred progress
  const metricValues: Record<string, number> = {
    streak: stats.currentStreak ?? 0,
    total_completions: stats.totalCompletions ?? 0,
    daily_completions: stats.todayCompletions ?? 0,
    total_xp: stats.totalXP ?? 0,
    level: stats.level ?? 0,
    unlocked_achievements: stats.unlockedAchievements.length ?? 0,
  };

  const parseThresholdCondition = (condition: string) => {
    const match = condition.match(/([a-zA-Z_]+)\s*>?=\s*(\d+)/);
    if (!match) return null;
    return { metric: match[1], target: Number(match[2]) };
  };

  const calculateProgress = (achievement: AchievementWithStatus) => {
    if (achievement.isUnlocked) return 1;
    const parsed = parseThresholdCondition(achievement.condition);
    if (!parsed) return 0;
    const current = metricValues[parsed.metric] ?? 0;
    if (parsed.target === 0) return 0;
    return Math.max(0, Math.min(1, current / parsed.target));
  };

  const baseAchievements: AchievementWithStatus[] = GAMIFICATION_ACHIEVEMENTS.map(achievement => {
    const unlocked = stats.unlockedAchievements.find(u => u.id === achievement.id);
    return {
      ...achievement,
      isUnlocked: !!unlocked,
    } as AchievementWithStatus;
  });

  const nearUnlockIds = baseAchievements
    .filter(a => !a.isUnlocked)
    .map(a => ({ ...a, progress: calculateProgress(a) }))
    .filter(a => (a.progress ?? 0) > 0)
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
    .slice(0, 5)
    .map(a => a.id);

  const allAchievements: AchievementWithStatus[] = baseAchievements.map(a => ({
    ...a,
    progress: calculateProgress(a),
    isNearUnlock: nearUnlockIds.includes(a.id),
  }));

  // Filter achievements
  const filteredAchievements = allAchievements.filter(achievement => {
    // Search filter
    if (searchQuery && !achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterStatus === 'unlocked' && !achievement.isUnlocked) return false;
    if (filterStatus === 'locked' && achievement.isUnlocked) return false;

    // Category filter
    if (filterCategory !== 'all' && achievement.category !== filterCategory) return false;

    return true;
  });

  const unlockedCount = allAchievements.filter(a => a.isUnlocked).length;

  // Grid view component with pagination
  const GridView = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 44; // Page 1: 44, Page 2: 43, Page 3: 43
    const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);
    
    // Paginate achievements
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAchievements = filteredAchievements.slice(startIndex, endIndex);

    return (
      <>
        {/* Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unlockedCount} / {allAchievements.length} achievements unlocked
          </p>
          <Badge variant="secondary">
            {filteredAchievements.length} shown
          </Badge>
        </div>

        {/* Achievement Grid */}
        <TooltipProvider delayDuration={200}>
          <motion.div 
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
            role="grid"
            aria-label="Achievements grid"
          >
            <AnimatePresence mode="popLayout">
              {paginatedAchievements.map((achievement, index) => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: ANIMATION_TIMINGS.DEFAULT, delay: index * ANIMATION_TIMINGS.STAGGER_ITEM }}
                    onClick={() => setSelectedAchievement(achievement)}
                    className={cn(
                      "aspect-square rounded-xl border-2 p-4 transition-all",
                      "flex items-center justify-center relative group",
                      "hover:scale-105 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2",
                      achievement.isUnlocked
                        ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 shadow-md shadow-yellow-500/20"
                        : "border-border bg-secondary/30 grayscale opacity-60 hover:opacity-80"
                    )}
                    aria-label={generateAriaLabel({
                      type: 'achievement',
                      label: achievement.name,
                      state: achievement.isUnlocked ? 'unlocked' : 'locked',
                      count: achievement.progress ? Math.round(achievement.progress) : 0,
                    })}
                    role="gridcell"
                  >
                    <span className="text-4xl md:text-5xl">{achievement.emoji}</span>
                    {achievement.isUnlocked && (
                      <div className="absolute top-1 right-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-primary">+{achievement.xpReward} XP</p>
                    {achievement.isUnlocked && (
                      <p className="text-xs text-green-500">✓ Unlocked</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </AnimatePresence>
        </motion.div>
      </TooltipProvider>

      {/* Pagination Controls */}
      {totalPages > 1 && filteredAchievements.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className="w-10"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No achievements found matching your filters</p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterCategory('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </>
  );
};

  return (
    <div className="space-y-6">
      {/* Filters & View Toggle */}
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => {
                  // Keyboard navigation: Arrow keys to switch views
                  if (e.key === 'ArrowLeft') {
                    const views: ViewLayout[] = ['grid', 'circles'];
                    const currentIndex = views.indexOf(viewLayout);
                    setViewLayout(views[(currentIndex - 1 + views.length) % views.length]);
                  } else if (e.key === 'ArrowRight') {
                    const views: ViewLayout[] = ['grid', 'circles'];
                    const currentIndex = views.indexOf(viewLayout);
                    setViewLayout(views[(currentIndex + 1) % views.length]);
                  }
                }}
              />
            </div>

            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterType)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unlocked">Unlocked</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as CategoryType)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="consistency">Consistency</SelectItem>
                <SelectItem value="combo">Combo</SelectItem>
                <SelectItem value="xp">XP</SelectItem>
                <SelectItem value="level">Level</SelectItem>
                <SelectItem value="time">Time-Based</SelectItem>
                <SelectItem value="challenge">Challenge</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="wellbeing">Wellbeing</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-1 border rounded-lg p-1 bg-secondary/30 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewLayout === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewLayout('grid')}
                    className="h-9 w-9 p-0"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Grid View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewLayout === 'circles' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewLayout('circles')}
                    className="h-9 w-9 p-0"
                  >
                    <Circle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Honeycomb Circles</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Conditional View Rendering with Transition Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewLayout}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewLayout === 'grid' && <GridView />}
          {viewLayout === 'circles' && (
            <AchievementGridHoneycomb
              achievements={allAchievements}
              onAchievementSelect={setSelectedAchievement}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
}
