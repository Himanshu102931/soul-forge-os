import { useState, useRef, useEffect, memo } from 'react';
import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ANIMATION_TIMINGS, SPRING_CONFIGS } from '@/lib/animation-optimizer';
import { useHoneycombKeyboardNav, generateAriaLabel } from '@/lib/accessibility';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type CategoryType = 'all' | 'streak' | 'completion' | 'consistency' | 'combo' | 'xp' | 'level' | 'time' | 'challenge' | 'seasonal' | 'milestone' | 'health' | 'learning' | 'wellbeing' | 'social' | 'productivity' | 'growth' | 'creative' | 'rare';

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

interface HoneycombProps {
  achievements: AchievementWithStatus[];
  onAchievementSelect: (achievement: AchievementWithStatus) => void;
}

export const AchievementGridHoneycomb = memo(function AchievementGridHoneycomb({
  achievements,
  onAchievementSelect,
}: HoneycombProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [boundaryHit, setBoundaryHit] = useState(false);

  // Sort achievements by priority: unlocked -> near-unlock -> remaining (closest progress first)
  const priorityAchievements = [...achievements].sort((a, b) => {
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
    if ((a.isNearUnlock ?? false) !== (b.isNearUnlock ?? false)) return a.isNearUnlock ? -1 : 1;
    return (b.progress ?? 0) - (a.progress ?? 0);
  });

  // Concentric ring layout (center-outwards)
  const itemSize = 96; // Circle diameter
  const gap = 22;
  const ringSpacing = itemSize + gap;

  const placeInRings = (list: typeof priorityAchievements) => {
    const positions: { x: number; y: number; ring: number; capacity: number }[] = [];
    let ring = 0;
    let placed = 0;
    while (placed < list.length) {
      if (ring === 0) {
        positions.push({ x: 0, y: 0, ring: 0, capacity: 1 });
        placed += 1;
        ring += 1;
        continue;
      }
      const capacity = ring * 6; // hex-style growth per ring
      const radius = ring * ringSpacing;
      for (let i = 0; i < capacity && placed < list.length; i++) {
        const angle = (2 * Math.PI * i) / capacity;
        positions.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
          ring,
          capacity,
        });
        placed += 1;
      }
      ring += 1;
    }

    const lastRing = positions.length === 0 ? 0 : positions[positions.length - 1].ring;
    const lastCapacity = lastRing === 0 ? 1 : lastRing * 6;
    const lastCount = positions.filter(p => p.ring === lastRing).length;
    return { positions, lastRing, lastCapacity, lastCount };
  };

  const { positions: ringPositions, lastCapacity, lastCount } = placeInRings(priorityAchievements);
  const fillersNeeded = Math.max(0, Math.min(4, lastCapacity - lastCount));

  const maxRadius = Math.max(0, ...ringPositions.map(p => Math.hypot(p.x, p.y)));
  const gridWidth = maxRadius * 2 + itemSize + gap * 2;
  const gridHeight = maxRadius * 2 + itemSize + gap * 2;

  const placements = priorityAchievements.map((achievement, index) => ({
    achievement,
    x: ringPositions[index]?.x ?? 0,
    y: ringPositions[index]?.y ?? 0,
    isFiller: false,
  }));

  // Add visual fillers to complete the outer ring shape (non-interactive)
  if (fillersNeeded > 0) {
    const lastRingPositions = ringPositions.filter(p => p.ring === (ringPositions[ringPositions.length - 1]?.ring ?? 0));
    const capacity = lastRingPositions[0]?.capacity ?? (ringPositions[ringPositions.length - 1]?.ring ?? 1) * 6;
    const radius = (ringPositions[ringPositions.length - 1]?.ring ?? 1) * ringSpacing;
    const startIndex = lastRingPositions.length;
    for (let i = 0; i < fillersNeeded; i++) {
      const angle = (2 * Math.PI * (startIndex + i)) / capacity;
      placements.push({
        achievement: {
          id: `filler-${i}`,
          name: 'Filler',
          description: '',
          emoji: '•',
          xpReward: 0,
          condition: '',
          category: 'all',
          rarity: 'common',
          isUnlocked: false,
        },
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        isFiller: true,
      });
    }
  }

  const boundaryPadding = 120;

  // Measure viewport for accurate bounds
  useEffect(() => {
    const updateViewport = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setViewport({ width: rect.width, height: rect.height });
      }
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Reset to center
  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setVelocity({ x: 0, y: 0 });
  };

  const clampPosition = (nextX: number, nextY: number, withBounce = false) => {
    const maxX = Math.max(0, (gridWidth * zoom - viewport.width) / 2 + boundaryPadding);
    const maxY = Math.max(0, (gridHeight * zoom - viewport.height) / 2 + boundaryPadding);

    const clampedX = Math.min(maxX, Math.max(-maxX, nextX));
    const clampedY = Math.min(maxY, Math.max(-maxY, nextY));

    const hit = clampedX !== nextX || clampedY !== nextY;
    if (hit) {
      setBoundaryHit(true);
      if (withBounce) {
        setVelocity(v => ({
          x: clampedX !== nextX ? -Math.sign(nextX) * Math.abs(v.x) * 0.35 : v.x,
          y: clampedY !== nextY ? -Math.sign(nextY) * Math.abs(v.y) * 0.35 : v.y,
        }));
      }
    }

    setPosition({ x: clampedX, y: clampedY });
  };

  useEffect(() => {
    if (!boundaryHit) return;
    const t = setTimeout(() => setBoundaryHit(false), 220);
    return () => clearTimeout(t);
  }, [boundaryHit]);

  // Zoom controls with smooth transitions
  const handleZoomIn = () => {
    setZoom(z => {
      const newZoom = Math.min(2.5, z + 0.25);
      return Number(newZoom.toFixed(2));
    });
  };
  
  const handleZoomOut = () => {
    setZoom(z => {
      const newZoom = Math.max(0.4, z - 0.25);
      return Number(newZoom.toFixed(2));
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    setVelocity({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calculate velocity for momentum
    setVelocity({
      x: (newX - position.x) * 0.5,
      y: (newY - position.y) * 0.5,
    });

    clampPosition(newX, newY, true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      clampPosition(newX, newY, true);
    }
  };

  // Wheel zoom (Ctrl + Scroll) with improved sensitivity
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom(z => {
        const newZoom = Math.max(0.4, Math.min(2.5, z + delta));
        return Number(newZoom.toFixed(2));
      });
    } else {
      // Regular scroll for panning with momentum
      const sensitivity = 0.8;
      const newX = position.x - e.deltaX * sensitivity;
      const newY = position.y - e.deltaY * sensitivity;
      clampPosition(newX, newY, true);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 50;
      switch (e.key) {
        case 'ArrowLeft':
          clampPosition(position.x + step, position.y, true);
          break;
        case 'ArrowRight':
          clampPosition(position.x - step, position.y, true);
          break;
        case 'ArrowUp':
          clampPosition(position.x, position.y + step, true);
          break;
        case 'ArrowDown':
          clampPosition(position.x, position.y - step, true);
          break;
        case 'r':
        case 'R':
          resetPosition();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, gridWidth, gridHeight, position.x, position.y, clampPosition]);

  // Momentum effect
  useEffect(() => {
    if (isDragging || (Math.abs(velocity.x) < 0.1 && Math.abs(velocity.y) < 0.1)) return;

    const momentumInterval = setInterval(() => {
      setVelocity(v => ({
        x: v.x * 0.92,
        y: v.y * 0.92,
      }));
      clampPosition(position.x + velocity.x, position.y + velocity.y, true);
    }, 16);

    return () => clearInterval(momentumInterval);
  }, [velocity, isDragging, position.x, position.y, zoom, gridWidth, gridHeight, clampPosition]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="bg-secondary/30 border rounded-lg p-3 text-sm text-muted-foreground">
          <p><strong>Controls:</strong> Drag to pan • Scroll/Arrow keys to move • Ctrl+Scroll to zoom • R to reset</p>
        </div>

        {/* Honeycomb Viewport */}
        <div
          ref={containerRef}
          className={cn(
            "relative w-full h-[600px] md:h-[700px] overflow-hidden rounded-xl border-2 transition-all",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isDragging ? "cursor-grabbing border-primary/50 bg-secondary/20" : "cursor-grab border-border bg-secondary/10",
            boundaryHit && "border-yellow-500/50"
          )}
          tabIndex={0}
          role="application"
          aria-label="Achievement honeycomb grid - use arrow keys to navigate, +/- to zoom"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
          onWheel={handleWheel}
        >
          {/* Draggable Grid with smooth transitions */}
          <motion.div
            className="absolute left-1/2 top-1/2"
            animate={{
              x: position.x,
              y: position.y,
              scale: zoom,
            }}
            transition={isDragging ? { duration: 0 } : SPRING_CONFIGS.SOFT}
            style={{
              width: gridWidth,
              height: gridHeight,
              translateX: '-50%',
              translateY: '-50%',
            }}
          >
            {placements.map(({ achievement, x, y, isFiller }, index) => {
              const isUnlocked = achievement.isUnlocked;
              const isNearUnlock = achievement.isNearUnlock && !achievement.isUnlocked;

              if (isFiller) {
                return (
                  <motion.div
                    key={`filler-${index}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ delay: index * 0.005 }}
                    className="rounded-full border-2 border-border/40 bg-secondary/30 flex items-center justify-center text-muted-foreground/50"
                    style={{
                      width: `${itemSize}px`,
                      height: `${itemSize}px`,
                      position: 'absolute',
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-2xl">•</span>
                  </motion.div>
                );
              }

              return (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.005 }}
                      whileHover={{ scale: 1.15, transition: SPRING_CONFIGS.STIFF }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAchievementSelect(achievement);
                      }}
                      data-achievement-index={index}
                      aria-label={generateAriaLabel({
                        type: 'achievement',
                        label: achievement.name,
                        state: isUnlocked ? 'unlocked' : 'locked',
                        count: achievement.progress ? Math.round(achievement.progress) : 0,
                      })}
                      className={cn(
                        "rounded-full flex items-center justify-center relative overflow-hidden",
                        "transition-all border-2 flex-shrink-0 select-none",
                        "focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "focus-visible:z-20 focus-visible:scale-110",
                        isUnlocked
                          ? "border-yellow-500/70 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 shadow-lg shadow-yellow-500/40"
                          : isNearUnlock
                            ? "border-sky-500/70 bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-blue-600/20 shadow-lg shadow-sky-500/30 animate-pulse"
                            : "border-border bg-secondary/40 grayscale opacity-60 hover:opacity-80"
                      )}
                      style={{
                        width: `${itemSize}px`,
                        height: `${itemSize}px`,
                        position: 'absolute',
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <span className="text-3xl md:text-4xl leading-none">{achievement.emoji}</span>
                      {isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        </div>
                      )}
                      {isNearUnlock && !isUnlocked && (
                        <div className="absolute inset-0 pointer-events-none bg-sky-400/10" />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-primary">+{achievement.xpReward} XP</p>
                      {isUnlocked && <p className="text-xs text-green-500">✓ Unlocked</p>}
                      {!isUnlocked && achievement.progress !== undefined && (
                        <p className="text-[11px] text-sky-500">{Math.round((achievement.progress ?? 0) * 100)}% toward unlock</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </motion.div>

          {boundaryHit && (
            <div className="pointer-events-none absolute inset-0 ring-2 ring-amber-400/60 rounded-xl animate-pulse" />
          )}
        </div>

        {/* Control Buttons with enhanced styling */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          {/* Zoom Controls - Bottom Left */}
          <div className="flex gap-2 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut} 
                  disabled={zoom <= 0.4}
                  className="transition-all hover:scale-105"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (Ctrl+Scroll)</TooltipContent>
            </Tooltip>
            
            <motion.span 
              key={zoom}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-sm font-medium px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md min-w-[60px] text-center"
            >
              {Math.round(zoom * 100)}%
            </motion.span>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn} 
                  disabled={zoom >= 2.5}
                  className="transition-all hover:scale-105"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (Ctrl+Scroll)</TooltipContent>
            </Tooltip>
          </div>

          {/* Instructions for mobile */}
          <div className="hidden sm:block text-xs text-muted-foreground">
            Drag to pan • Ctrl+Scroll to zoom • Arrow keys to navigate
          </div>

          {/* Reset Button - Bottom Right */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetPosition}
                className="transition-all hover:scale-105"
              >
                <RotateCcw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Reset View (R)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to center position</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
});
