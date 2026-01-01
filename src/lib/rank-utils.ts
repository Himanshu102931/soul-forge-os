/**
 * Rank System: F to ZENITH (1000 levels total)
 * F/D/C/B/A/S/SS/SSS/EX/ALPHA/APEX/ZENITH
 * 
 * Progression uses geometric-like growth:
 * Early ranks (F-A): 8→14→20→26→32 (building foundation)
 * Mid ranks (S-EX): 65→111→136→170 (consistent grind)
 * Late ranks (ALPHA-APEX): 190→227 (final stretch)
 * ZENITH: 1 (ultimate goal at 1000)
 */

export interface Rank {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  badge: string;
  color: string;
  description: string;
}

export const RANKS: Rank[] = [
  {
    id: 'F',
    name: 'F',
    minLevel: 1,
    maxLevel: 8,
    badge: '🔴',
    color: 'text-red-500',
    description: 'Foundational - Building habit foundations',
  },
  {
    id: 'D',
    name: 'D',
    minLevel: 9,
    maxLevel: 22,
    badge: '🟠',
    color: 'text-orange-500',
    description: 'Developing - Consistency is emerging',
  },
  {
    id: 'C',
    name: 'C',
    minLevel: 23,
    maxLevel: 42,
    badge: '🟡',
    color: 'text-yellow-500',
    description: 'Capable - Strong patterns forming',
  },
  {
    id: 'B',
    name: 'B',
    minLevel: 43,
    maxLevel: 68,
    badge: '🟢',
    color: 'text-green-500',
    description: 'Brilliant - Mastery beginning',
  },
  {
    id: 'A',
    name: 'A',
    minLevel: 69,
    maxLevel: 100,
    badge: '🔵',
    color: 'text-blue-500',
    description: 'Advanced - Expert territory (Milestone!)',
  },
  {
    id: 'S',
    name: 'S',
    minLevel: 101,
    maxLevel: 165,
    badge: '🟣',
    color: 'text-purple-500',
    description: 'Superior - Transcendent habits',
  },
  {
    id: 'SS',
    name: 'SS',
    minLevel: 166,
    maxLevel: 276,
    badge: '⭐',
    color: 'text-indigo-500',
    description: 'Super Superior - Legendary status',
  },
  {
    id: 'SSS',
    name: 'SSS',
    minLevel: 277,
    maxLevel: 412,
    badge: '✨',
    color: 'text-cyan-400',
    description: 'Supreme - Mythical mastery',
  },
  {
    id: 'EX',
    name: 'EX',
    minLevel: 413,
    maxLevel: 582,
    badge: '👑',
    color: 'text-amber-400',
    description: 'Exalted - Approaching transcendence',
  },
  {
    id: 'ALPHA',
    name: 'ALPHA',
    minLevel: 583,
    maxLevel: 772,
    badge: '👑✨',
    color: 'text-pink-400',
    description: 'Alpha - Beyond mortal limits',
  },
  {
    id: 'APEX',
    name: 'APEX',
    minLevel: 773,
    maxLevel: 999,
    badge: '👑⭐',
    color: 'text-rose-400',
    description: 'Apex - One step from eternity',
  },
  {
    id: 'ZENITH',
    name: 'ZENITH',
    minLevel: 1000,
    maxLevel: 1000,
    badge: '💎',
    color: 'text-white',
    description: 'Zenith - The ultimate goal achieved',
  },
];

/**
 * Get rank info by level
 */
export function getRankByLevel(level: number): Rank {
  const rank = RANKS.find(r => level >= r.minLevel && level <= r.maxLevel);
  return rank || RANKS[0];
}

/**
 * Get all ranks with unlock status
 */
export function getRanksWithStatus(currentLevel: number) {
  return RANKS.map(rank => ({
    ...rank,
    isUnlocked: currentLevel >= rank.minLevel,
    isCurrentRank: currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel,
    progress: currentLevel >= rank.maxLevel ? 100 : 
              currentLevel < rank.minLevel ? 0 :
              Math.round(((currentLevel - rank.minLevel + 1) / (rank.maxLevel - rank.minLevel + 1)) * 100),
  }));
}

/**
 * Get next rank info
 */
export function getNextRank(currentLevel: number): Rank | null {
  const currentRank = getRankByLevel(currentLevel);
  const currentRankIndex = RANKS.findIndex(r => r.id === currentRank.id);
  return currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
}

/**
 * Get levels needed to reach next rank
 */
export function getLevelsToNextRank(currentLevel: number): number {
  const nextRank = getNextRank(currentLevel);
  if (!nextRank) return 0; // Already at ZENITH
  return nextRank.minLevel - currentLevel;
}
