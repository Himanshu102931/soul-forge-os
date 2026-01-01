import { motion } from 'framer-motion';

interface RankInfo {
  name: string;
  description: string;
  badge: string;
  minLevel: number;
}

interface UserLevelData {
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
}

interface ProfileData {
  level: number;
}

interface RankDataInfo {
  currentRank: RankInfo;
  nextRank?: RankInfo;
  ranksWithStatus: RankInfo[];
}

interface ZenithPathDisplayProps {
  profile: ProfileData;
  userLevel: UserLevelData;
  rankData: RankDataInfo;
}

export function ZenithPathDisplay({ profile, userLevel, rankData }: ZenithPathDisplayProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-8 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-5xl">{rankData.currentRank.badge}</span>
        <div className="text-left">
          <h2 className="text-3xl font-bold">{rankData.currentRank.name}</h2>
          <p className="text-sm text-muted-foreground">{rankData.currentRank.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-8 mt-6">
        <div>
          <div className="text-4xl font-bold text-primary">{userLevel.totalXP.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total XP Earned</div>
        </div>
        <div className="h-12 w-px bg-border"></div>
        <div>
          <div className="text-4xl font-bold">{profile.level}</div>
          <div className="text-sm text-muted-foreground">Current Level</div>
        </div>
      </div>

      {rankData.nextRank && (
        <div className="mt-6 p-4 bg-background/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Next Milestone</p>
          <p className="font-medium">
            {rankData.nextRank.badge} {rankData.nextRank.name} at Level {rankData.nextRank.minLevel}
          </p>
        </div>
      )}
    </motion.div>
  );
}
