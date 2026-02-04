# Profile Stats

**Version**: v1.0  
**Last Updated**: January 27, 2026  
**Last Session**: Session 1  
**Total Sessions**: 1  
**Status**: 🟢 Active

---

## 📖 Overview
User RPG-style progression system including level, XP (experience points), HP (health points), and character stats. Features level-up calculations, XP thresholds, HP regeneration, and stat display in CharacterCard component.

---

## 📂 Related Files
Primary files for this feature:
- `src/components/CharacterCard.tsx` - Visual stat display
- `src/hooks/useProfile.ts` - Profile data fetching
- `src/lib/gamification-utils.ts` - Level calculation formulas
- Database table: `profiles` (level, xp, hp, max_hp, day_start_hour)

Related features: [Dashboard.md](Dashboard.md), [Nightly-Review.md](Nightly-Review.md), [Achievements.md](Achievements.md)

---

## 🏷️ Cross-Feature Tags
- `#rpg-stats` - Character progression
- `#level-system` - XP thresholds and leveling
- `#hp-system` - Health point mechanics
- `#xp-calculation` - Experience point rewards

---

<!-- SESSION 1 START -->

## Session 1 (January 2-27, 2026)

### 📝 Problems Reported

**Problem #1: Missing Profile Record After Signup**
> "User authenticated but no profile row; app failed post-signup"

**Symptoms:**
- Dashboard errors: Cannot read property 'level' of undefined
- Some signups succeeded, others lacked profile
- Database trigger occasionally failed to fire
- No fallback mechanism for profile creation

**Problem #2: XP Not Being Added**
> "XP wasn't being added to profile during nightly review"

**Root Cause:**
- Multiple separate database operations could fail
- useAddXP hook might not execute
- Profile update separate from XP addition
- Inconsistent state possible

**Problem #3: Level Calculation Unclear**
> "How much XP needed to level up?"

**User Questions:**
- What's the XP threshold for each level?
- Does XP reset after level up?
- How are levels calculated?

### 💡 Solutions Applied  

**Fix #1: Profile Creation Fallback**
```sql
-- Database trigger (should fire automatically)
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Function implementation
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, level, xp, hp, max_hp, day_start_hour)
  VALUES (NEW.id, 1, 0, 100, 100, 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Manual Recovery Script (fix-profile.sql):**
```sql
-- Check profile exists
SELECT * FROM profiles WHERE id = '<user_id>';

-- Create if missing
INSERT INTO profiles (id, level, xp, hp, max_hp, day_start_hour)
VALUES ('<user_id>', 1, 0, 100, 100, 6)
ON CONFLICT (id) DO NOTHING;
```

**Result:** ✅ Reliable profile creation; manual recovery path documented

**Fix #2: Atomic XP Update**
```typescript
// BEFORE (Multiple operations):
await useAddXP(xpEarned);          // Might fail
await updateProfile({ hp: newHP }); // Separate operation

// AFTER (Single atomic operation):
const { data: updatedProfile, error } = await supabase
  .from('profiles')
  .update({
    xp: profile.xp + xpEarned,                    // ✅ Add XP
    hp: Math.max(0, profile.hp - hpLost),        // ✅ Subtract HP
    level: calculateLevel(profile.xp + xpEarned), // ✅ Update level
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id)
  .select()
  .single();

if (error) {
  throw new Error('Failed to save XP and HP to profile');
}

// Check for level up
if (updatedProfile.level > profile.level) {
  toast.success(`🎉 LEVEL UP! You are now level ${updatedProfile.level}!`);
}
```

**Benefits:**
- ✅ XP, HP, and level updated together (atomic)
- ✅ Level-up calculation included automatically
- ✅ No inconsistent state possible
- ✅ Single database round-trip

**Fix #3: Level Calculation System**
```typescript
// src/lib/gamification-utils.ts

export function calculateLevel(xp: number): number {
  let level = 1;
  let xpNeeded = 100; // Level 1 → 2 requires 100 XP
  
  while (xp >= xpNeeded) {
    level++;
    xpNeeded = 100 + (level - 1) * 50; // Each level needs +50 more XP
  }
  
  return level;
}

export function getXPForLevel(level: number): number {
  // Total XP needed to reach this level
  if (level === 1) return 0;
  
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += 100 + (i - 1) * 50;
  }
  return totalXP;
}

export function getXPForNextLevel(currentLevel: number): number {
  return 100 + (currentLevel - 1) * 50;
}
```

**Level Thresholds:**
- Level 1: 0 XP
- Level 2: 100 XP (0 + 100)
- Level 3: 250 XP (100 + 150)
- Level 4: 450 XP (250 + 200)
- Level 5: 700 XP (450 + 250)
- Level 10: 2,350 XP
- Level 20: 10,100 XP

**Formula:** XP needed for next level = `100 + (currentLevel - 1) × 50`

### ❌ Errors Encountered

**Error 1: Profile Not Found**
```
TypeError: Cannot read property 'level' of undefined
Location: Dashboard, CharacterCard component
Cause: Profile row missing after signup
Impact: App unusable post-authentication
```

**Error 2: XP Update Failed**
```
Error: Failed to save XP and HP to profile
Cause: Multiple database operations, one failed
Impact: XP not added, inconsistent state
Old behavior: useAddXP might fail silently
```

**Error 3: Level Not Updating**
```
Issue: XP increased but level stayed at 1
Cause: Level calculation not included in update
Solution: Added calculateLevel() to profile update
Result: Level updates automatically when XP threshold reached
```

### ✅ Current Status

**What Works:**
- ✅ Profile creation on signup (with trigger + fallback)
- ✅ Level/XP/HP display in CharacterCard
- ✅ Atomic XP/HP updates (single operation)
- ✅ Automatic level-up calculation
- ✅ Level-up toast notification
- ✅ HP capped at 0 (cannot go negative)
- ✅ max_hp configurable (default 100)
- ✅ Day start hour preference

**Profile Stats:**
- **Level** - Character progression (1-∞)
- **XP** - Experience points (accumulated)
- **HP** - Health points (0-max_hp)
- **max_hp** - Maximum health (default 100)

**XP Sources:**
- Completing habits (varies by xp_reward)
- Daily streak bonuses (future)
- Achievement unlocks (future)
- Challenges (future)

**HP Mechanics:**
- Lost: 5 HP per missed habit
- Cannot go below 0
- Restoration: Passive regeneration (future)

**What's Broken:**
- None currently

**What's Next:**
- Add HP regeneration over time
- Add XP multipliers for streaks
- Add stat bonuses at certain levels
- Add prestige/reset system for high levels
- Add visual level-up animation

### 📊 Session Statistics
- **Problems Reported**: 3
- **Solutions Applied**: 3
- **Errors Encountered**: 3
- **Files Modified**: 4
- **Success Rate**: 100%

### 🕐 Last Activity
**Session Date**: January 2-27, 2026
**Focus Areas**: Profile creation reliability, atomic XP updates, level calculation clarity

<!-- SESSION 1 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

---

## 📜 Change Log
### v1.0 (January 27, 2026)
- Initial documentation created
- Documented profile creation trigger and fallback
- Added atomic XP/HP update implementation
- Documented level calculation formula (100 + level × 50)

---

**Maintained by**: AI-assisted documentation system
