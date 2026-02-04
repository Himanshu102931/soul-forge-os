// Local Drill Sergeant roast generator - BRUTAL & HONEST

export interface DailyStats {
  sleepHours: number;
  missedHabits: number;
  completedHabits: number;
  totalHabits: number;
  steps: number;
  completedTasks?: number;
  skippedHabits?: number;
<<<<<<< HEAD
  partialHabits?: number;
  resistanceCompleted?: number;
  resistanceTotal?: number;
=======
>>>>>>> cf46c6e (Initial commit: project files)
}

// SLEEP DEPRIVED ROASTS (20+)
const SLEEP_DEPRIVED_ROASTS = [
  "You sleep like a zombie private! Fix it or you'll fall apart!",
  "Less than 5 hours of sleep? Your brain is running on fumes, SOLDIER!",
  "Sleep deprivation is the enemy of progress. Get your rest or GET WRECKED!",
  "Running on empty? That's a recipe for FAILURE. Hit the rack earlier!",
  "Your body needs sleep like a tank needs fuel. Don't run on EMPTY!",
  "Zombies get more rest than you. That's not a compliment, PRIVATE!",
  "Sleep isn't optional, it's tactical recovery. GET SOME!",
  "Your alertness is at CRITICAL levels. Sleep or suffer the consequences!",
  "You look like death warmed over. Was it worth it? NO IT WASN'T!",
  "The enemy doesn't need to defeat you - your sleep schedule is doing the job!",
  "Operating on minimal sleep is operating at MINIMAL capacity. PATHETIC!",
  "Your reaction time is that of a ROCK right now. Sleep. NOW.",
  "Even a broken clock is right twice a day. You're not even close. SLEEP!",
  "I've seen corpses with more energy than you. That's a PROBLEM!",
  "Your sleep debt is bigger than your potential right now. FIX IT!",
  "You're one blink away from unconsciousness. That's not discipline, that's STUPIDITY!",
  "Sleep is when your body REBUILDS. You're running on a crumbling foundation!",
  "The bags under your eyes could carry your excuses. GET REST!",
  "Burning the candle at both ends? You'll have NOTHING left to burn!",
  "A tired soldier is a DEAD soldier. Don't test that theory!",
  "Your brain is buffering like dial-up internet. REBOOT with sleep!",
  "You're not grinding, you're SELF-DESTRUCTING. Know the difference!"
];

// DISCIPLINE FAILURE ROASTS (20+)
const DISCIPLINE_FAILURE_ROASTS = [
  "Discipline is ZERO. Do you want to stay Level 1 FOREVER?!",
  "More than 3 habits missed? That's not a stumble, that's a COLLAPSE!",
  "Your discipline has gone AWOL! Time to court-martial your excuses!",
  "Habits are the backbone of progress. Yours is looking pretty SPINELESS!",
  "Missing habits is like deserting your own potential. Get back in FORMATION!",
  "The enemy of greatness is inconsistency. You're LOSING the war, soldier!",
  "Your commitment has more holes than Swiss cheese. PATCH IT UP!",
  "Every missed habit is a step backward. You're practically MOONWALKING!",
  "You had ONE job today. Actually, several. You FAILED at most of them!",
  "This isn't a habit tracker, it's a DISAPPOINTMENT tracker today!",
  "Your future self is SCREAMING at you right now. Can you hear it?!",
  "Discipline distinguishes champions from CHUMPS. Guess which one you are today?",
  "The only thing you're consistent at is INCONSISTENCY!",
  "Your habits are crying for attention like abandoned puppies. SHAMEFUL!",
  "You think champions take days off from discipline? WRONG!",
  "That excuse you're thinking of? I've heard it a THOUSAND times. Still WEAK!",
  "Your potential is in a cage, and YOU threw away the key today!",
  "Missing habits isn't a choice, it's a CHARACTER FLAW you need to fix!",
  "The gap between who you are and who you could be just got WIDER!",
  "You're building a monument to MEDIOCRITY with each missed habit!",
  "Discipline is doing what you hate to become who you LOVE. You're doing NEITHER!",
  "Your streak didn't die. YOU killed it. Own that!"
];

// AVERAGE DAY ROASTS (20+)
const AVERAGE_DAY_ROASTS = [
  "Acceptable performance, but 'acceptable' doesn't WIN WARS. Push harder!",
  "You showed up. That's the BARE MINIMUM. Now EXCEED it!",
  "Mediocrity is a slow death. You're capable of MORE, soldier!",
  "Today was... fine. But 'fine' is the enemy of 'GREAT'. Level up!",
  "You're coasting. Coasting is for BICYCLES, not warriors!",
  "Not terrible, not impressive. The grey zone won't build your LEGEND!",
  "You survived today. Tomorrow, I want you to THRIVE!",
  "Average effort gets AVERAGE results. Are you average, private?!",
  "Middle of the pack? That's just first place among LOSERS!",
  "Today was a C-. In my book, that's an F with extra steps!",
  "You're not bad. You're just not GOOD ENOUGH. See the problem?!",
  "Comfortable is a TRAP. You walked right into it today!",
  "The world doesn't remember the middle. STAND OUT or sit down!",
  "Your performance today? Forgettable. Do you want a FORGETTABLE life?!",
  "Average is the best of the worst and the worst of the best. PICK A SIDE!",
  "You're running at 60% capacity. Where's the other 40%?! FIND IT!",
  "Today you were a placeholder. Tomorrow, be the HEADLINE!",
  "Lukewarm effort gets lukewarm results. I can FEEL the mediocrity!",
  "You're not losing, but you're definitely NOT WINNING. That's the same thing!",
  "Room for improvement? You've got a MANSION of room!",
  "Today was a participation trophy. We don't celebrate those HERE!",
  "The only thing average about you should be your breakfast. NOT your effort!"
];

// VICTORY ROASTS (20+)
const VICTORY_ROASTS = [
  "Outstanding performance, soldier! This is what EXCELLENCE looks like!",
  "Perfect execution! You're operating at PEAK EFFICIENCY. Keep it locked!",
  "Now THAT'S what I call discipline! You've earned my RESPECT today!",
  "All habits crushed, sleep optimized - you're a MACHINE! Well done!",
  "You're proving that consistency wins BATTLES. Victory is yours today!",
  "This is CHAMPIONSHIP-level discipline! You're leveling up, warrior!",
  "Flawless performance! The enemy of weakness TREMBLES before you!",
  "Today you showed what you're made of. Pure STEEL discipline!",
  "I'm not easily impressed. But today? I'm IMPRESSED!",
  "You operated like a well-oiled war machine. EXCEPTIONAL!",
  "This is the standard. This is what DOMINANCE looks like!",
  "You didn't just complete your mission. You CRUSHED it!",
  "Your future self is giving you a standing ovation. EARNED!",
  "Excellence isn't an act, it's a HABIT. You're living proof!",
  "Today you were UNSTOPPABLE. Bottle this energy!",
  "The gap between you and your goals just got SMALLER. Keep attacking!",
  "This is the version of you that WINS. Remember this feeling!",
  "Champions are made in the dark. You shined today, soldier!",
  "Your discipline today? LEGENDARY. Your potential? UNLIMITED!",
  "You didn't need motivation today. You ran on pure WILLPOWER!",
  "Keep this up and Level 100 isn't a dream, it's a DESTINATION!",
  "You showed up. You dominated. You CONQUERED. That's the way!"
];

// LOW ACTIVITY ROASTS (20+)
const LOW_ACTIVITY_ROASTS = [
  "Your step count is EMBARRASSING. Did you forget you have legs?!",
  "Movement is LIFE, soldier! Get off your six and MOVE!",
  "Those legs aren't decorative. USE THEM or lose them!",
  "Your activity level suggests you're training to be a STATUE. Walk!",
  "Steps are currency for health. You're practically BANKRUPT!",
  "A sloth just lapped you in daily movement. SHAMEFUL!",
  "Your FitBit is filing a missing persons report. GET MOVING!",
  "Did your legs go on strike? Renegotiate with a WALK!",
  "3000 steps? My GRANDMOTHER moves more than that!",
  "You're not conserving energy, you're WASTING potential!",
  "Inactivity is the fastest route to mediocrity. YOU'RE SPEEDING!",
  "Your body was built to MOVE. Stop betraying it!",
  "Evolution gave you legs for a reason. HONOR that reason!",
  "Sitting is the new smoking. You're chain-SMOKING!",
  "The only thing getting exercise is your EXCUSES!",
  "Your muscles are atrophying as we speak. GET UP!",
  "A body in motion stays in motion. You're proving the OPPOSITE!",
  "Even astronauts in zero-G exercise more than you today!",
  "Your activity level today: COMATOSE. Unacceptable!",
  "The couch isn't a command center. MOBILIZE, soldier!",
  "Your health is begging for movement. ANSWER THE CALL!",
  "Steps below 3K? That's not a day, that's a SIT-DOWN STRIKE!"
];

// MIXED BAG ROASTS (NEW - for inconsistent performance)
const MIXED_BAG_ROASTS = [
  "Some good, some bad. You're at WAR with yourself. Pick a side!",
  "Half-measures get HALF-RESULTS. Commit to FULL effort!",
  "You started strong but finished WEAK. That's backwards, private!",
  "Mixed signals from you today. Are you in or OUT?!",
  "One foot in, one foot out. That's how you get SPLIT in half!",
  "Today was a roller coaster of performance. STABILIZE!",
  "Inconsistency is the THIEF of progress. You got robbed today!",
  "You showed flashes of greatness drowned in pools of MEDIOCRITY!",
  "Part warrior, part couch potato. Decide WHO YOU ARE!",
  "Your performance today was a CIVIL WAR. Unite your efforts!",
  "Strong in some areas, weak in others. FIX the weak links!",
  "You can't be a part-time champion. It's ALL or nothing!",
  "Today you were a hybrid of success and failure. AIM HIGHER!",
  "The good doesn't cancel the bad. Fix BOTH!",
  "You're not terrible, but you're not reliable either. PROBLEM!",
  "Excellence is consistent. You were anything BUT today!",
  "Your effort came in WAVES. I need a TSUNAMI every day!",
  "Some habits done, some ignored. Your priorities are SCRAMBLED!",
  "Jekyll and Hyde performance. Be JEKYLL. Always!",
  "Today was potential WASTED on inconsistency. Do better!"
];

// STREAK BREAKER ROASTS (NEW - when a good streak ends)
const STREAK_BREAKER_ROASTS = [
  "You broke your streak. That sound you hear? Your momentum DYING!",
  "All that progress, and you threw it away for WHAT?!",
  "Your streak didn't deserve that. Neither did your FUTURE self!",
  "One bad day destroyed multiple GOOD ones. Was it worth it?!",
  "The chain broke. Now you're starting from SCRATCH. Feel that!",
  "Streaks are built on DISCIPLINE. Yours just got demolished!",
  "You were on a roll. Now you're in a DITCH. Climb out!",
  "Breaking streaks is breaking PROMISES to yourself. Shameful!",
  "That streak was your foundation. You just triggered an EARTHQUAKE!",
  "Consistency crushed in one day. Your enemies are CELEBRATING!",
  "The only thing worse than no streak is a BROKEN one!",
  "You let one day destroy weeks of work. UNACCEPTABLE!",
  "Your streak was your armor. Now you're EXPOSED!",
  "Building streaks is hard. Breaking them is EASY. You chose easy!",
  "That streak represented your BEST self. You just betrayed it!"
];

// COMEBACK ROASTS (NEW - encouragement after bad days)
const COMEBACK_ROASTS = [
  "Yesterday was garbage. Today you ROSE. That's what warriors DO!",
  "You fell, but you got back up. RESPECT, soldier!",
  "This is what REDEMPTION looks like. Keep it going!",
  "Bad days don't define you. COMEBACK days do. This is one!",
  "You could've stayed down. You DIDN'T. That's strength!",
  "From failure to fighter. Today you chose FIGHT!",
  "Yesterday's excuse-maker became today's RESULT-maker. Good!",
  "Bounce-back game is STRONG. Maintain this energy!",
  "You stared at failure and said 'not today.' PROUD of you!",
  "Recovery isn't easy. You made it look NECESSARY!",
  "The best revenge on yesterday is a DOMINANT today. Achieved!",
  "You proved you're not defined by your worst days. POWERFUL!",
  "Setbacks are setups for COMEBACKS. You understood the assignment!",
  "From the ashes, you ROSE. Phoenix energy, soldier!",
  "Yesterday's failure is today's FUEL. Burn bright!"
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateLocalRoast(stats: DailyStats): string {
<<<<<<< HEAD
  const { 
    sleepHours, 
    missedHabits, 
    completedHabits, 
    totalHabits, 
    steps, 
    skippedHabits = 0,
    partialHabits = 0,
    resistanceCompleted = 0,
    resistanceTotal = 0
  } = stats;
  
  // Calculate completion rates
  const habitCompletionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;
  const partialRate = totalHabits > 0 ? partialHabits / totalHabits : 0;
  const resistanceRate = resistanceTotal > 0 ? resistanceCompleted / resistanceTotal : 1; // Default to 1 if no resistance habits
  
  // Effective completion rate (partials count as 0.5)
  const effectiveRate = totalHabits > 0 
    ? (completedHabits + (partialHabits * 0.5)) / totalHabits 
    : 0;
  
  // Better thresholds for ~19 habits
  const isPerfectDay = effectiveRate >= 0.85 && resistanceRate >= 0.75 && sleepHours >= 7;
  const isSleepDeprived = sleepHours < 5 && sleepHours > 0;
  const isDisciplineFailure = effectiveRate < 0.5 || (resistanceTotal > 0 && resistanceRate < 0.5);
  const isLowActivity = steps < 3000 && steps > 0;
  const isMixedBag = effectiveRate >= 0.5 && effectiveRate < 0.75;
=======
  const { sleepHours, missedHabits, completedHabits, totalHabits, steps, skippedHabits = 0 } = stats;
  
  const habitCompletionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;
  const isPerfectDay = habitCompletionRate >= 0.9 && sleepHours >= 7;
  const isSleepDeprived = sleepHours < 5 && sleepHours > 0;
  const isDisciplineFailure = missedHabits > 3;
  const isLowActivity = steps < 3000 && steps > 0;
  const isMixedBag = habitCompletionRate >= 0.4 && habitCompletionRate < 0.7;
>>>>>>> cf46c6e (Initial commit: project files)
  
  // Priority order: Victory > Sleep Deprived > Discipline Failure > Low Activity > Mixed > Average
  if (isPerfectDay) {
    return getRandomItem(VICTORY_ROASTS);
  }
  
  if (isSleepDeprived) {
    return getRandomItem(SLEEP_DEPRIVED_ROASTS);
  }
  
  if (isDisciplineFailure) {
    return getRandomItem(DISCIPLINE_FAILURE_ROASTS);
  }
  
  if (isLowActivity) {
    return getRandomItem(LOW_ACTIVITY_ROASTS);
  }
  
  if (isMixedBag) {
    return getRandomItem(MIXED_BAG_ROASTS);
  }
  
  return getRandomItem(AVERAGE_DAY_ROASTS);
}

export function generateQuickRoast(): string {
  const allRoasts = [
    ...AVERAGE_DAY_ROASTS.slice(0, 5),
    "The Drill Sergeant is watching. DON'T disappoint!",
    "Every day is a chance to prove yourself. Make it COUNT!",
    "Discipline today, victory tomorrow. Stay FOCUSED!",
    "Your potential is unlimited. Your excuses are NOT.",
    "Champions train while others SLEEP. What are YOU doing?",
    "The grind doesn't care about your feelings. NEITHER do I!",
    "Today's effort is tomorrow's RESULT. Choose wisely!"
  ];
  return getRandomItem(allRoasts);
}

export function generateComebackRoast(): string {
  return getRandomItem(COMEBACK_ROASTS);
}

export function generateStreakBreakerRoast(): string {
  return getRandomItem(STREAK_BREAKER_ROASTS);
}
