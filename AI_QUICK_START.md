# AI Integration - Quick Start Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Get an API Key (Choose One)

**Option A: Google Gemini (Recommended - Cheapest)**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key
4. Copy it (you won't see it again!)

**Option B: OpenAI GPT-3.5**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys section
4. Create new secret key
5. Copy it

**Option C: Anthropic Claude (Premium)**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Log in
3. Go to API Keys
4. Create key
5. Copy it

---

### Step 2: Configure in Life OS

1. **Open Settings Page**
   - Click your profile in the header
   - Or navigate to Settings tab

2. **Find AI Integration Section**
   - Scroll down past "My System" and "Brain & Data"
   - Look for section with ✨ icon: "AI Integration"
   - Click to expand

3. **Enter Your Configuration**
   ```
   [AI Provider] ▼ Select...
   ┌─────────────────────────────┐
   │ Local Only (No AI)          │ ← Default
   │ Google Gemini Pro (~$0.0005)│ ← Recommended
   │ OpenAI GPT-3.5 (~$0.0015)   │
   │ Anthropic Claude (~$0.008)  │
   └─────────────────────────────┘

   [API Key]  [________________] 👁️
   Get your key from: ai.google.dev

   [Test Connection] ← Click to validate
   
   ☑️ Enable AI Features
   
   [Save AI Configuration]
   ```

4. **Test It**
   - Click "Test Connection"
   - Wait for ✅ success message
   - If it fails, double-check your API key

5. **Save**
   - Click "Save AI Configuration"
   - You'll see: "✨ AI Configuration Saved"

---

### Step 3: Use AI in Nightly Review

That's it! Next time you do your nightly review:

1. Complete all steps normally (Metrics → Exceptions → Journal → Summary)
2. On the **Debrief** step, you'll see:
   ```
   💀 Drill Sergeant ✨ ← Sparkle means AI!
   
   "YOUR AI-POWERED ROAST HERE"
   
   🤖 AI-powered roast
   750 tokens • $0.0004 estimated cost
   
   [Different Roast] ← Regenerate with AI
   ```

**That's it!** Your drill sergeant is now AI-powered.

---

## 💰 Cost Breakdown

### Daily Usage (1 nightly review)
| Provider | Per Review | Per Month (30 days) | Per Year |
|----------|-----------|---------------------|----------|
| Gemini   | $0.0005   | ~$0.015             | ~$0.18   |
| GPT-3.5  | $0.0015   | ~$0.045             | ~$0.54   |
| Claude   | $0.008    | ~$0.24              | ~$2.88   |

### With Future Features (5 AI calls/day)
| Provider | Per Day | Per Month | Per Year |
|----------|---------|-----------|----------|
| Gemini   | $0.0025 | ~$0.075   | ~$0.90   |
| GPT-3.5  | $0.0075 | ~$0.225   | ~$2.70   |
| Claude   | $0.040  | ~$1.20    | ~$14.40  |

**Recommendation:** Start with Gemini. It's the cheapest and works great!

---

## 🔐 Security & Privacy

### What happens to your API key?
1. ✅ Encrypted using XOR cipher + Base64 encoding
2. ✅ Stored in browser localStorage ONLY
3. ✅ Never sent to our servers
4. ✅ Only used to call AI provider directly
5. ✅ Removable anytime (Clear AI Configuration button)

### What data is sent to AI providers?
Only your performance stats for the day:
- Sleep hours
- Habits completed/missed/partial
- Steps taken
- Resistance habits (bad habits resisted)

**NOT sent:**
- ❌ Your habit names
- ❌ Task details
- ❌ Journal entries
- ❌ Personal information
- ❌ Email/username

---

## 🎨 Visual Indicators

### How to tell if AI is active:

**Settings Page:**
```
AI Integration  ✨ Active ← Badge appears when enabled
```

**Nightly Review - Debrief Step:**
```
💀 Drill Sergeant ✨ ← Sparkle icon = AI-generated

"YOUR ROAST"

🤖 AI-powered roast      ← Metadata shows it's AI
750 tokens • $0.0004
```

**Without AI:**
```
💀 Drill Sergeant ← No sparkle

"YOUR ROAST"

[Different Roast] ← Uses local generator
```

---

## 🔧 Troubleshooting

### "Connection Failed" when testing
- ✅ Double-check API key (no spaces, complete)
- ✅ Make sure you selected correct provider
- ✅ Check if you have credits/billing enabled
- ✅ Try copying key again (might have copied wrong)

### AI roast not appearing
- ✅ Make sure "Enable AI Features" is checked
- ✅ Click "Save AI Configuration" after changes
- ✅ Check browser console for errors (F12)
- ✅ Try "Different Roast" button to regenerate

### "AI Unavailable" toast notification
- App automatically fell back to local roast
- Reasons:
  - Network issue
  - API rate limit reached
  - Invalid API key
  - Provider outage
- **Don't worry:** Local roast still works!

### API key disappeared after refresh
- ✅ Check localStorage not cleared
- ✅ Check browser privacy settings
- ✅ Incognito mode clears on close
- ✅ Re-enter and save again

---

## 🚀 Coming Soon (Future AI Features)

Once you have AI configured, these features will automatically work:

1. **AI Onboarding Guide** 📚
   - Smart setup wizard for new users
   - Personalized habit recommendations
   - XP reward optimization

2. **Habit Suggestions** 💡
   - Weekly AI analysis of your patterns
   - Gap identification (missing areas)
   - Habit stacking recommendations

3. **Weekly Insights** 📊
   - Sunday AI-generated performance review
   - Trend spotting
   - Motivational summary

4. **Goal Planning** 🎯
   - Break big goals into habits
   - AI-powered roadmaps
   - Progress predictions

All using the same API key you set up today!

---

## 🎯 Best Practices

### Minimize Costs
1. Use Gemini (cheapest)
2. Don't spam "Different Roast" excessively
3. Disable AI when not needed (toggle off)

### Maximize Value
1. Do nightly reviews consistently (AI learns patterns)
2. Be honest with metrics (garbage in = garbage out)
3. Read the roast - AI spots patterns you might miss

### Security
1. Never share your API key
2. Use a dedicated API key for Life OS (not your main one)
3. Set spending limits in your AI provider dashboard
4. Regenerate key if compromised

---

## ❓ FAQ

**Q: Is AI required?**
A: No! App works perfectly without AI. Local drill sergeant is always available.

**Q: Can I switch AI providers?**
A: Yes! Just select different provider and enter new API key. Old config is replaced.

**Q: Will AI roasts get better over time?**
A: Currently no "learning" (stateless). Future: last 7 days context will improve relevance.

**Q: Can I customize the drill sergeant personality?**
A: Not yet. Advanced prompt customization coming in future phase.

**Q: What if I run out of credits?**
A: AI will fail gracefully and fall back to local roast. You'll see a toast notification.

**Q: Can AI see my journal entries?**
A: No. Only performance metrics (numbers) are sent, never text content.

**Q: Is my data encrypted in transit?**
A: Yes. All AI providers use HTTPS. Your key is also encrypted in localStorage.

**Q: Can I use multiple AI providers?**
A: Not simultaneously. Select one at a time. You can switch anytime.

---

## 📝 Example AI Roast

**Input Stats:**
- Sleep: 6.5 hours
- Habits: 12/19 completed (63%)
- Partial: 2
- Resistance: 3/4 (75%)
- Steps: 4,200

**AI-Generated Roast:**
> "SIX AND A HALF HOURS? That's ROOKIE sleep right there! You dragged yourself through 63% of your habits like a zombie - no wonder you barely hit 4K steps. At least you resisted most bad habits, but DON'T get comfortable. Tomorrow, SLEEP PROPERLY and finish what you start!"

**vs Local Roast:**
> "PATHETIC! You're running on fumes with that sleep, and it shows in your weak 63% completion. Those 2 partial habits? That's just you giving up halfway. At least you didn't cave to bad habits, but that's the BARE MINIMUM. Step it up!"

**Notice:** AI is more contextual and connects the dots (low sleep → low steps).

---

## 🎉 You're All Set!

Your Life OS now has AI superpowers! 

**What you can do now:**
- ✅ Get personalized, contextual drill sergeant roasts
- ✅ See actual cost per review
- ✅ Track token usage
- ✅ Switch providers anytime
- ✅ Disable when not needed

**Remember:**
- Start with Gemini (cheapest)
- Set spending limits in provider dashboard
- AI is optional - local roast always works

**Need help?**
- Check `PHASE_4_AI_INTEGRATION.md` for technical details
- Review your Settings → AI Integration section
- Test connection if issues arise

**Enjoy your AI-powered Life OS!** 🚀✨
