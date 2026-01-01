import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ANIMATION_TIMINGS } from '@/lib/animation-optimizer';
import { useHoneycombKeyboardNav, generateAriaLabel } from '@/lib/accessibility';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type FilterType = 'all' | 'unlocked' | 'locked';
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
}

interface HexagonsProps {
  achievements: AchievementWithStatus[];
  isLoading: boolean;
  searchQuery: string;
  filterStatus: FilterType;
  filterCategory: CategoryType;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: FilterType) => void;
  onCategoryFilterChange: (category: CategoryType) => void;
  onAchievementSelect: (achievement: AchievementWithStatus) => void;
}

// Hexagon SVG component
function HexagonTile({
  achievement,
  onClick,
  size = 90,
}: {
  achievement: AchievementWithStatus;
  onClick: () => void;
  size?: number;
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          aria-label={`${achievement.name} - ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
          className={cn(
            "relative transition-all cursor-pointer flex-shrink-0",
            "focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
            "focus-visible:z-20 focus-visible:scale-110",
            achievement.isUnlocked && "drop-shadow-xl"
          )}
          style={{ width: `${size}px`, height: `${size * 1.15}px` }}
        >
          {/* Hexagon SVG */}
          <svg
            viewBox="0 0 100 115"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id={`hex-grad-${achievement.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {achievement.isUnlocked ? (
                  <>
                    <stop offset="0%" stopColor="rgba(234, 179, 8, 0.2)" />
                    <stop offset="100%" stopColor="rgba(217, 119, 6, 0.2)" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="rgba(107, 114, 128, 0.1)" />
                    <stop offset="100%" stopColor="rgba(75, 85, 99, 0.1)" />
                  </>
                )}
              </linearGradient>
            </defs>

            {/* Hexagon shape */}
            <polygon
              points="50,5 93,31 93,85 50,111 7,85 7,31"
              fill={`url(#hex-grad-${achievement.id})`}
              stroke={achievement.isUnlocked ? "#eab308" : "#e5e7eb"}
              strokeWidth="2"
              strokeOpacity={achievement.isUnlocked ? "0.7" : "0.5"}
              className={achievement.isUnlocked ? "drop-shadow-lg" : ""}
            />
          </svg>

          {/* Emoji centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl drop-shadow-sm">{achievement.emoji}</span>
          </div>

          {/* Unlock badge */}
          {achievement.isUnlocked && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-background drop-shadow-sm" />
          )}

          {/* Grayscale overlay for locked */}
          {!achievement.isUnlocked && (
            <div className="absolute inset-0 bg-black/20 opacity-40 pointer-events-none" />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold text-sm">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          <p className="text-xs text-primary">+{achievement.xpReward} XP</p>
          {achievement.isUnlocked && <p className="text-xs text-green-500">✓ Unlocked</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function AchievementGridHexagon({
  achievements,
  onAchievementSelect,
}: HexagonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  // Sort achievements: unlocked in center, locked radiating outward
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    return 0;
  });

  // Grid dimensions
  const cols = 9; // Hexagon grid
  const itemSize = 90;
  const gap = 15;
  const gridWidth = cols * (itemSize + gap);
  const gridHeight = Math.ceil(sortedAchievements.length / cols) * (itemSize + gap);

  // Reset to center
  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setVelocity({ x: 0, y: 0 });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.2));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.2));

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    setVelocity({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setVelocity({
      x: (newX - position.x) * 0.5,
      y: (newY - position.y) * 0.5
    });
    
    const maxX = gridWidth * zoom / 4;
    const maxY = gridHeight * zoom / 4;
    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
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
      
      const maxX = gridWidth * zoom / 4;
      const maxY = gridHeight * zoom / 4;
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.5, Math.min(2, z + delta)));
    } else {
      const newX = position.x - e.deltaX;
      const newY = position.y - e.deltaY;
      const maxX = gridWidth * zoom / 4;
      const maxY = gridHeight * zoom / 4;
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 50;
      const maxX = gridWidth * zoom / 4;
      const maxY = gridHeight * zoom / 4;

      switch (e.key) {
        case 'ArrowLeft':
          setPosition(p => ({ ...p, x: Math.min(maxX, p.x + step) }));
          break;
        case 'ArrowRight':
          setPosition(p => ({ ...p, x: Math.max(-maxX, p.x - step) }));
          break;
        case 'ArrowUp':
          setPosition(p => ({ ...p, y: Math.min(maxY, p.y + step) }));
          break;
        case 'ArrowDown':
          setPosition(p => ({ ...p, y: Math.max(-maxY, p.y - step) }));
          break;
        case 'r':
        case 'R':
          resetPosition();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, gridWidth, gridHeight]);

  // Momentum
  useEffect(() => {
    if (isDragging || Math.abs(velocity.x) < 0.1 && Math.abs(velocity.y) < 0.1) return;
    
    const momentumInterval = setInterval(() => {
      setVelocity(v => ({
        x: v.x * 0.95,
        y: v.y * 0.95
      }));
      setPosition(p => ({
        x: p.x + velocity.x,
        y: p.y + velocity.y
      }));
    }, 16);

    return () => clearInterval(momentumInterval);
  }, [velocity, isDragging]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="bg-secondary/30 border rounded-lg p-3 text-sm text-muted-foreground">
          <p><strong>Controls:</strong> Drag to pan • Scroll/Arrow keys to move • Ctrl+Scroll to zoom • R to reset</p>
        </div>

        {/* Hexagon Viewport */}
        <div
          ref={containerRef}
          className={cn(
            "relative w-full h-[600px] overflow-hidden rounded-xl border-2 border-border bg-secondary/10",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
          onWheel={handleWheel}
        >
          {/* Draggable Grid */}
          <motion.div
            className="absolute inset-0 flex flex-wrap justify-center items-center content-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {sortedAchievements.map((achievement, index) => {
              const row = Math.floor(index / cols);
              const isOffsetRow = row % 2 === 1;
              
              return (
                <div
                  key={achievement.id}
                  style={{
                    marginLeft: isOffsetRow ? `${gap / 2}px` : '0',
                    marginRight: `${gap / 2}px`,
                    marginBottom: `${gap / 2}px`
                  }}
                >
                  <HexagonTile
                    achievement={achievement}
                    onClick={() => onAchievementSelect(achievement)}
                    size={itemSize}
                  />
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-between items-center">
          {/* Zoom Controls */}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (Ctrl+Scroll)</TooltipContent>
            </Tooltip>
            <span className="text-sm px-3 py-2 bg-secondary rounded-md">{Math.round(zoom * 100)}%</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 2}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (Ctrl+Scroll)</TooltipContent>
            </Tooltip>
          </div>

          {/* Reset Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={resetPosition}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset View (R)
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to center position</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
