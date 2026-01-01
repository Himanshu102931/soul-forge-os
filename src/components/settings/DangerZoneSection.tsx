/**
 * Settings - Danger Zone Section
 * Level/XP management and sign out
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, LogOut } from 'lucide-react';

interface Profile {
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
}

interface DangerZoneSectionProps {
  profile: Profile | undefined;
  xpInput: string;
  onXpInputChange: (value: string) => void;
  onLevelChange: (delta: number) => void;
  onSetXP: () => void;
  onResetRound: () => void;
  onSignOut: () => void;
}

export function DangerZoneSection({
  profile,
  xpInput,
  onXpInputChange,
  onLevelChange,
  onSetXP,
  onResetRound,
  onSignOut,
}: DangerZoneSectionProps): JSX.Element {
  return (
    <div className="space-y-4">
      {profile && (
        <>
          {/* Level Manager */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Level: {profile.level}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onLevelChange(-1)}
                disabled={profile.level <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onLevelChange(1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* XP Manager */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder={`Current: ${profile.xp} XP`}
              value={xpInput}
              onChange={(e) => onXpInputChange(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={onSetXP}>
              Set XP
            </Button>
          </div>
          
          {/* Reset Round */}
          <Button 
            variant="outline" 
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={onResetRound}
          >
            Reset Round (XP=0, HP=100)
          </Button>
        </>
      )}

      <Button variant="destructive" className="w-full justify-start gap-2" onClick={onSignOut}>
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}
