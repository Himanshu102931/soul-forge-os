# 🎬 NEW SESSION STARTER TEMPLATE

**Copy-paste this when you start a new conversation!**

---

## 📋 CONTEXT FOR AI ASSISTANT

```
Hi! I'm continuing development on Life OS habit tracker.

📅 PROJECT INFO:
- Launch Date: February 1, 2026
- Days Remaining: [Calculate from today]
- Daily Availability: 5-6 hours
- Current Week: [1, 2, 3, or 4]
- Current Day: [What day of the week]

🔧 CURRENT TASK:
- Week: [e.g., Week 1]
- Day: [e.g., Day 1]
- Task: [e.g., Fix 3 TODOs in AI components]
- Expected Time: [e.g., 1 hour]

✅ SETUP COMPLETED:
- Supabase (Project ID: abugumajinzeoorgoxrw)
- Git repository initialized
- GitHub repo: [Your repo URL]
- Current branch: [e.g., feature/week1]
- Umami analytics: [Installed / Not yet]
- Development environment: Working

📂 FILES I'M WORKING WITH:
- [e.g., src/components/HabitSuggestionsDialog.tsx]
- [e.g., src/components/AICoachCard.tsx]

❓ WHAT I NEED:
[Choose one or describe your need]

Option 1 - Step-by-step coding:
"I need step-by-step guidance to [implement X feature]. Please provide exact code with line numbers."

Option 2 - Debugging help:
"I'm getting this error: [paste error]
My code: [paste code]
What's wrong?"

Option 3 - Planning help:
"I'm starting [Week X, Day Y]. What should I focus on today?"

Option 4 - Testing help:
"I built [feature X]. How should I test it works correctly?"

Option 5 - Git help:
"I need to [merge/commit/fix] but not sure how."
```

---

## 🎯 EXAMPLE: STARTING WEEK 1, DAY 1

```
Hi! I'm continuing development on Life OS habit tracker.

📅 PROJECT INFO:
- Launch Date: February 1, 2026
- Days Remaining: 30
- Daily Availability: 5-6 hours
- Current Week: 1
- Current Day: Wednesday (Day 1)

🔧 CURRENT TASK:
- Week: Week 1
- Day: Day 1
- Task: Fix 3 TODOs in AI components
- Expected Time: 1 hour

✅ SETUP COMPLETED:
- Supabase (Project ID: abugumajinzeoorgoxrw)
- Git repository initialized
- GitHub repo: https://github.com/yourusername/life-os
- Current branch: feature/week1
- Umami analytics: Not yet installed
- Development environment: Working (npm run dev successful)

📂 FILES I'M WORKING WITH:
- src/components/HabitSuggestionsDialog.tsx (Lines 38-43 have TODOs)
- src/components/AICoachCard.tsx (Lines 213, 230 have TODOs)

❓ WHAT I NEED:
"I need step-by-step guidance to fix the 3 TODOs. Please provide exact code with line numbers and explanation of what the calculations do."
```

---

## 🎯 EXAMPLE: MID-WEEK PROGRESS UPDATE

```
Hi! I'm continuing Week 1, Day 3 of Life OS development.

📅 PROGRESS UPDATE:
- Launch: Feb 1, 2026 (27 days left)
- Week 1, Day 3: Streak Freeze Database

✅ COMPLETED THIS WEEK:
- Day 1: Fixed all 3 TODOs ✅
- Day 2: Added timezone support ✅
- Day 2: Set up Umami analytics ✅

🔧 CURRENT TASK:
- Creating Supabase migration for streak freeze
- Adding columns: streak_freezes_used, streak_freeze_date
- Expected time: 2 hours

❓ WHAT I NEED:
"I need help creating the migration SQL file. Where should I create it and what should the exact SQL be?"

[Then paste any error you're getting if applicable]
```

---

## 🎯 EXAMPLE: DEBUGGING HELP

```
Hi! I'm on Week 1, Day 4 implementing streak freeze UI.

🐛 PROBLEM:
Getting this error when I click the freeze button:
[paste exact error message from console]

📂 MY CODE:
File: src/components/StreakFreezeModal.tsx
[paste relevant code snippet]

❓ WHAT I TRIED:
1. Checked that useStreakFreeze hook exists
2. Verified Supabase columns were added
3. Console logged the freezesRemaining value

None of these fixed it. What am I missing?
```

---

## 🎯 EXAMPLE: END OF WEEK REVIEW

```
Hi! I'm finishing Week 1 and planning Week 2.

✅ WEEK 1 COMPLETED:
- Fixed TODOs ✅
- Added timezone support ✅
- Set up Umami analytics ✅
- Implemented streak freeze (DB + UI) ✅
- Enhanced auth UI ✅
- Total time: 43 hours (target was 45)

📊 TESTING RESULTS:
- All features working in dev
- Tested on mobile view
- 0 console errors
- Ready to merge to main

❓ NEXT STEPS:
"I want to merge feature/week1 to main and start feature/week2. What are the exact Git commands?"

Then:
"What's the plan for Week 2, Day 1? What should I tackle first?"
```

---

## 🎯 EXAMPLE: STUCK ON SOMETHING

```
Hi! I'm on Week 2, Day 8 implementing push notifications.

😓 STUCK:
I've been trying to get the service worker to register for 2 hours but keep getting:
[paste error]

📂 WHAT I'VE DONE:
1. Created public/service-worker.js
2. Added registration code to main.tsx
3. Checked HTTPS is enabled (using localhost)
4. Tried 3 different tutorials

📂 MY CODE:
[paste service-worker.js]
[paste main.tsx registration code]

❓ HELP:
"Can you spot what's wrong? Or suggest a simpler approach to PWA notifications that will work for the MVP?"
```

---

## 💡 TIPS FOR EFFECTIVE HELP

### **DO ✅**
- Provide exact error messages (copy-paste)
- Share relevant code snippets
- Mention what you've already tried
- Say what you expect vs what's happening
- Include file names and line numbers

### **DON'T ❌**
- Say "it's not working" without details
- Share screenshots instead of text (I can't read images well)
- Skip context about what you're building
- Assume I remember previous conversations (I don't)
- Wait hours stuck before asking

---

## 📞 ESCALATION TEMPLATE (If Really Stuck)

```
🆘 URGENT HELP NEEDED

I've been stuck for [X hours] on [task].

PROBLEM:
[Describe the issue]

GOAL:
[What you're trying to achieve]

WHAT I'VE TRIED:
1. [First attempt]
2. [Second attempt]
3. [Third attempt]

ERROR MESSAGES:
[Paste all errors]

CODE:
[Paste all relevant code]

QUESTION:
Should I:
A) Keep trying to fix this
B) Try a different approach
C) Skip this feature for now
D) Something else

I don't want to waste the whole day stuck!
```

---

## 🎓 LEARNING AS YOU GO

**Good questions to ask:**
- "Why does this code work this way?"
- "What's the best practice for [X] in React?"
- "Is there a simpler way to do this?"
- "What could go wrong with this approach?"
- "How should I test this feature?"

**Building understanding:**
- Ask for explanations, not just code
- Request comments in complex sections
- Learn Git commands, don't just copy-paste blindly
- Understand the "why", not just the "how"

---

## ✅ SESSION END TEMPLATE

**At the end of each coding session, say:**

```
📊 SESSION SUMMARY

⏱️ TIME TODAY:
- Worked: [X hours]
- Task: [What you worked on]

✅ COMPLETED:
- [What you finished]

🔄 IN PROGRESS:
- [What you started but didn't finish]

📝 COMMITTED:
- Branch: feature/week[X]
- Commits: [Number] commits
- Last commit: "[commit message]"

🎯 NEXT TIME:
- Start with: [Next task]
- Estimated time: [X hours]

❓ QUESTIONS FOR NEXT SESSION:
- [Any questions you thought of]

Status: [On track / Behind / Ahead] of schedule
```

This helps me understand your progress when you return!

---

## 🗓️ WEEKLY REVIEW TEMPLATE (Every Sunday)

```
📅 WEEK [X] REVIEW

✅ PLANNED vs ACTUAL:
- Planned hours: 45
- Actual hours: [X]
- Planned features: [List]
- Completed features: [List]

📊 METRICS:
- Commits this week: [X]
- Files changed: [X]
- Features shipped: [X]
- Bugs fixed: [X]

🎯 WINS:
- [What went well]
- [What you're proud of]

😓 CHALLENGES:
- [What was difficult]
- [What took longer than expected]

📝 LEARNINGS:
- [What you learned this week]

🚀 WEEK [X+1] PLAN:
- Goals: [What to build]
- Concerns: [What might be tricky]
- Help needed: [Where you'll need guidance]

Launch countdown: [X] days remaining
On track for Feb 1? [Yes/No/Maybe]
```

---

**SAVE THIS FILE! Use it every time you start a new conversation! 💾**

---

**Last Updated:** January 1, 2026  
**Version:** 1.0
