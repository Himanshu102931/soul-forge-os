import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  habitTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showLongest?: boolean;
}

export function StreakDisplay({ 
  currentStreak, 
  longestStreak, 
  habitTitle,
  size = 'md',
  showLongest = true 
}: StreakDisplayProps) {
  
  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'text-purple-500';
    if (streak >= 30) return 'text-blue-500';
    if (streak >= 7) return 'text-orange-500';
    if (streak >= 3) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 365) return { icon: '👑', label: 'Year', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' };
    if (streak >= 100) return { icon: '💯', label: 'Century', color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' };
    if (streak >= 30) return { icon: '💪', label: 'Month', color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' };
    if (streak >= 7) return { icon: '🔥', label: 'Week', color: 'bg-orange-500/20 text-orange-600 border-orange-500/30' };
    return null;
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const badge = getStreakBadge(currentStreak);

  return (
    <div className="space-y-2">
      {habitTitle && (
        <h4 className="text-sm font-medium text-muted-foreground">{habitTitle}</h4>
      )}
      
      <div className="flex items-center gap-3">
        {/* Current Streak */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Flame className={cn('w-5 h-5', getStreakColor(currentStreak))} />
          <div>
            <div className={cn('font-bold', sizeClasses[size], getStreakColor(currentStreak))}>
              {currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">day streak</div>
          </div>
        </motion.div>

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <Badge className={cn('gap-1', badge.color)}>
              <span>{badge.icon}</span>
              {badge.label}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Longest Streak */}
      {showLongest && longestStreak > currentStreak && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="w-3 h-3" />
          <span>Best: {longestStreak} days</span>
        </div>
      )}
      
      {/* Streak Status */}
      {currentStreak === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Target className="w-3 h-3" />
          <span>Start your streak today!</span>
        </div>
      )}
    </div>
  );
}

// Mini streak indicator for cards
export function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null;
  
  const getColor = (s: number) => {
    if (s >= 30) return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
    if (s >= 7) return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
  };

  return (
    <Badge variant="outline" className={cn('gap-1', getColor(streak))}>
      <Flame className="w-3 h-3" />
      {streak}
    </Badge>
  );
}
