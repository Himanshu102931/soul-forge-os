# Nightly Review

**Version**: v1.0  
**Last Updated**: January 27, 2026  
**Last Session**: Session 1  
**Total Sessions**: 1  
**Status**: 🟢 Active

---

## 📖 Overview
End-of-day reflection system featuring multi-step wizard (metrics → mood → drill sergeant feedback → finish). Tracks daily stats, calculates XP/HP, provides motivational/constructive feedback, and saves daily summaries. Includes AI-powered "drill sergeant" roast generation.

---

## 📂 Related Files
Primary files for this feature:
- `src/components/NightlyReviewModal.tsx` - Main review wizard UI
- `src/hooks/useNightlyReview.ts` - Review submission logic
- `src/lib/local-roast.ts` - Local drill sergeant logic
- `src/lib/ai-service.ts` - AI-powered roast generation
- `DEBUGGING_NIGHTLY_REVIEW.md` - Error debugging guide

Related features: [AI-Features.md](AI-Features.md), [Profile-Stats.md](Profile-Stats.md), [Calendar.md](Calendar.md)

---

## 🏷️ Cross-Feature Tags
- `#nightly-review` - Daily reflection
- `#drill-sergeant` - Motivational feedback
- `#hp-calculation` - Health point mechanics
- `#xp-calculation` - Experience point rewards

---

<!-- SESSION 1 START -->

## Session 1 (January 2-27, 2026)

### 📝 Problems Reported

**Problem #1: "Failed to save review" Error**
> "XP and HP weren't being updated properly!"

**Symptoms:**
- Error: "Failed to save nightly review"
- XP wasn't being added to profile
- HP wasn't being subtracted correctly
- Multiple separate database operations could fail

**Problem #2: Drill Sergeant Logic Too Harsh**
> "Drill sergeant was too harsh or inaccurate"

**Issues:**
- Used arbitrary thresholds (90% for victory)
- Didn't account for partial habit completions
- Didn't track "bad habits" (resistance) separately
- Used fixed "3 missed habits" rule that didn't scale

**Problem #3: HP Calculation Unclear**
> "Users confused about how HP loss is calculated"

**Confusion:**
- Not clear what triggers HP loss
- How much HP is lost for missed habits?
- Can HP go negative?
- How to restore HP?

### 💡 Solutions Applied  

**Fix #1: Atomic XP/HP Update**
```typescript
// BEFORE (Broken - Multiple Operations):
// 1. Save metrics to DB
await supabase.from('metrics').insert({ steps, sleep });

// 2. Call useAddXP hook (might fail)
await useAddXP(xpEarned);

// 3. Call updateProfile separately (might fail)
await updateProfile({ hp: newHP });

// AFTER (Fixed - Single Atomic Operation):
const { data, error } = await supabase
  .from('profiles')
  .update({
    xp: profile.xp + xpEarned,
    hp: Math.max(0, profile.hp - hpLost),
    level: calculateLevel(profile.xp + xpEarned),
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id)
  .select()
  .single();

if (error) {
  throw new Error('Failed to save XP and HP to profile');
}

// Then save daily summary
await supabase.from('daily_summaries').insert({
  user_id: user.id,
  date: today,
  xp_earned: xpEarned,
  hp_lost: hpLost,
  mood: mood,
  // ...
});
```

**Benefits:**
- ✅ XP + HP updated in ONE operation (atomic)
- ✅ Clear error messages showing exactly what failed
- ✅ Level-up calculation included in update
- ✅ Profile existence validated BEFORE attempting save

**Fix #2: Enhanced Drill Sergeant Logic**
```typescript
// src/lib/local-roast.ts

interface DailyStats {
  completedHabits: number;
  partialHabits: number;        // ✅ NEW: Partial completion credit
  missedHabits: number;
  totalHabits: number;
  resistedBadHabits: number;    // ✅ NEW: Bad habit tracking
  totalBadHabits: number;       // ✅ NEW: Separate resistance tracking
  steps: number;
  sleepHours: number;
  mood: number;
}

// Better Thresholds for 19 Habits
const effectiveCompletion = (completed + partial * 0.5) / total;  // ✅ Partial = 0.5 credit
const resistanceRate = resistedBadHabits / totalBadHabits;

// Victory: 85% effective + 75% resistance + 7hr sleep
if (effectiveCompletion >= 0.85 && resistanceRate >= 0.75 && sleepHours >= 7) {
  return "🔥 LEGENDARY! You crushed today!";
}

// Discipline failure: <50% effective OR <50% resistance
if (effectiveCompletion < 0.50 || resistanceRate < 0.50) {
  return "💀 Discipline failure. Tomorrow, you dominate.";
}

// Mixed performance: 50-75% effective completion
if (effectiveCompletion >= 0.50 && effectiveCompletion < 0.75) {
  return "⚔️ Solid effort, but you can do better.";
}
```

**Improvements:**
- ✅ Partial habits count as 0.5 credit
- ✅ Resistance habits tracked separately (75% threshold)
- ✅ Better thresholds (85% for victory vs old 90%)
- ✅ Scales with total habit count

**Fix #3: HP Calculation System**
```typescript
// HP Loss Calculation
const hpLost = missedHabits * 5;  // 5 HP per missed habit

// HP Rules:
// - Start with 100 HP (max_hp)
// - Lose 5 HP per missed habit
// - HP cannot go below 0 (capped)
// - HP restored by completing habits next day

// Example:
// Total habits: 10
// Completed: 7
// Missed: 3
// HP lost: 3 × 5 = 15 HP

const newHP = Math.max(0, profile.hp - hpLost);  // Can't go negative
```

**HP Restoration:**
- Completing habits doesn't restore HP directly
- HP regenerates passively over time (future feature)
- Can use items/rewards to restore HP (future feature)

### ❌ Errors Encountered

**Error 1: Profile Update Failed**
```
Error: "User profile not loaded. Please try again."
Cause: Profile data didn't load before review submission
Solution: Validate profile exists before attempting save
Code: if (!profile) throw new Error('Profile not loaded');
```

**Error 2: Multiple Database Failures**
```
Issue: XP saved but HP update failed (or vice versa)
Cause: Separate database operations
Impact: Inconsistent state (XP added but HP not subtracted)
Solution: Combined into single atomic UPDATE
```

**Error 3: Negative Steps/Sleep**
```
Validation Error: "Steps and sleep cannot be negative"
Cause: User entered negative numbers in form
Validation: if (steps < 0 || sleep < 0) throw error
Form: type="number" min="0" on inputs
```

**Error 4: Drill Sergeant Too Harsh**
```
User Complaint: "90% completion still got negative feedback"
Old Logic: if (completion < 0.90) → harsh roast
Issue: 90% is too strict for 19 habits
Fix: Lowered to 85% for victory, 75% for decent
```

### ✅ Current Status

**What Works:**
- ✅ Multi-step wizard (Metrics → Mood → Debrief → Finish)
- ✅ Atomic XP/HP update (single database operation)
- ✅ Enhanced drill sergeant with partial credit
- ✅ AI-powered roast generation (optional)
- ✅ Daily summary saves to database
- ✅ HP calculation (5 HP per missed habit)
- ✅ Level-up detection and notification
- ✅ Error handling with clear messages
- ✅ Validation (no negative steps/sleep)

**Review Steps:**
1. **Metrics** - Steps, sleep hours
2. **Mood** - 1-5 scale (emoji picker)
3. **Debrief** - Drill sergeant feedback (local or AI)
4. **Finish** - Summary and XP/HP changes

**Drill Sergeant Features:**
- ✅ Local fallback (no API key needed)
- ✅ AI integration (Gemini/OpenAI/Claude)
- ✅ Sparkle icon (✨) for AI-generated roasts
- ✅ Token usage and cost display
- ✅ "Different Roast" button to regenerate

**What's Broken:**
- None currently

**What's Next:**
- Add HP restoration mechanics
- Add review history view
- Add drill sergeant personality customization
- Add weekly summary comparison

### 📊 Session Statistics
- **Problems Reported**: 3
- **Solutions Applied**: 3
- **Errors Encountered**: 4
- **Files Modified**: 4
- **Success Rate**: 100%

### 🕐 Last Activity
**Session Date**: January 2-27, 2026
**Focus Areas**: Atomic XP/HP updates, drill sergeant logic enhancement, HP calculation clarity

<!-- SESSION 1 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

---

## 📜 Change Log
### v1.0 (January 27, 2026)
- Initial documentation created
- Documented atomic XP/HP update fix
- Added enhanced drill sergeant logic (partial credit, resistance tracking)
- Documented HP calculation system (5 HP per missed habit)

---

**Maintained by**: AI-assisted documentation system
