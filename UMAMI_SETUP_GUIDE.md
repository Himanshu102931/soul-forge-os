# Umami Analytics Setup Guide

## What is Umami?

Umami is a **privacy-friendly, GDPR-compliant** analytics platform. Unlike Google Analytics:
- ✅ No cookies required
- ✅ Respects Do Not Track
- ✅ Anonymous data collection
- ✅ Lightweight (< 2KB script)
- ✅ You own your data

## Setup Instructions

### Option 1: Umami Cloud (Recommended - Easiest)

1. **Sign up at https://cloud.umami.is/**
   - Free tier: 100,000 events/month
   - Email signup or GitHub OAuth

2. **Create a Website**
   - Click "Add Website"
   - Name: `Life OS Habit Tracker`
   - Domain: `your-domain.com` (or `localhost` for testing)
   - Click "Save"

3. **Get Your Tracking Code**
   - Click on your website
   - Click "Edit" → "Tracking Code"
   - Copy your **Website ID** (looks like: `a1b2c3d4-e5f6-7890`)

4. **Add to Your .env File**
   ```bash
   # In .env file, uncomment and add your values:
   VITE_UMAMI_WEBSITE_ID=a1b2c3d4-e5f6-7890
   VITE_UMAMI_SRC=https://cloud.umami.is/script.js
   ```

5. **Restart Dev Server**
   ```bash
   npm run dev
   ```

6. **Verify Setup**
   - Open your app
   - Open browser DevTools Console
   - Look for: `[Umami] Analytics loaded successfully`
   - Visit https://cloud.umami.is/ to see realtime data!

---

### Option 2: Self-Hosted Umami (Advanced)

Perfect if you want **complete control** of your data.

1. **Deploy Umami**
   - Railway: https://railway.app/template/umami
   - Vercel: https://vercel.com/new/clone?repository-url=https://github.com/umami-software/umami
   - Docker: https://umami.is/docs/running-on-docker

2. **Get Your Script URL**
   - Your instance: `https://your-umami-instance.com`
   - Script URL: `https://your-umami-instance.com/script.js`

3. **Create Website & Get ID**
   - Log in to your Umami instance
   - Settings → Websites → Add Website
   - Copy Website ID

4. **Add to .env**
   ```bash
   VITE_UMAMI_WEBSITE_ID=your-website-id
   VITE_UMAMI_SRC=https://your-umami-instance.com/script.js
   ```

---

## What Gets Tracked?

### Automatic Tracking
- ✅ **Page views** - Every route change
- ✅ **Session duration** - How long users stay
- ✅ **Referrers** - Where traffic comes from
- ✅ **Device info** - Browser, OS, screen size

### Custom Events (Implemented)
- ✅ `habit-completed` - When user checks off a habit
- ✅ `habit-created` - When user creates new habit
- ✅ `task-completed` - When user completes a task
- ✅ `level-up` - When user reaches new level
- ✅ `ai-suggestions-generated` - AI feature usage
- ✅ `settings-changed` - Settings modifications

All events are **anonymous** - no personal data is collected!

---

## Usage in Code

The setup is already complete! Events are tracked automatically.

### Track Custom Events (Optional)
```typescript
import { analytics } from '@/lib/umami';

// Simple event
analytics.habitCompleted('habit-123', 'Morning Meditation');

// Or use the base function
trackEvent('custom-event', { key: 'value' });
```

### Check if Umami is Enabled
```typescript
import { isUmamiEnabled, isUmamiLoaded } from '@/lib/umami';

if (isUmamiEnabled()) {
  console.log('Umami is configured');
}

if (isUmamiLoaded()) {
  console.log('Umami script is loaded and ready');
}
```

---

## Testing Your Setup

### 1. Check Console Logs
Open DevTools Console and look for:
```
[Umami] Analytics loaded successfully
```

Or if not configured:
```
[Umami] Analytics not configured. See src/lib/umami.ts for setup instructions.
```

### 2. View Realtime Data
- Go to your Umami dashboard
- Click "Realtime"
- Open your app in another tab
- You should see your visit appear instantly!

### 3. Test Events
- Complete a habit
- Check console: `[Umami] Event tracked: habit-completed`
- Check Umami dashboard → Events

---

## Privacy & GDPR Compliance

### Why Umami is Privacy-Friendly

1. **No Cookies** - Uses local storage only
2. **No Personal Data** - Collects only anonymous metrics
3. **IP Anonymization** - IPs are hashed, not stored
4. **GDPR Compliant** - Fully compliant by default
5. **Respects DNT** - Honors Do Not Track header
6. **Open Source** - Fully auditable code

### What Data is Stored?
- Page URL (without query parameters)
- Referrer
- Browser name/version
- OS name/version
- Device type (desktop/mobile/tablet)
- Screen resolution
- Country (from IP, then IP is discarded)

### What is NOT Stored?
- ❌ User names
- ❌ Email addresses
- ❌ IP addresses (hashed and discarded)
- ❌ Cookies
- ❌ Personal identifiers

---

## Disable Analytics (User Choice)

Users can disable tracking by:
1. Enabling "Do Not Track" in browser
2. Using an ad blocker
3. You can add a toggle in Settings if desired

---

## Dashboard Features

### Available Reports
- **Overview** - Traffic, views, visitors
- **Realtime** - Live visitors right now
- **Pages** - Most visited pages
- **Referrers** - Where traffic comes from
- **Devices** - Browser, OS, screen sizes
- **Countries** - Geographic distribution
- **Events** - Custom event tracking

### Useful Insights
- Which habits are completed most?
- When are users most active?
- Which features are used most?
- Are users leveling up?
- How often is AI used?

---

## Troubleshooting

### "Analytics not configured"
✅ **Fix:** Add `VITE_UMAMI_WEBSITE_ID` to `.env` and restart dev server

### Script not loading
- Check VITE_UMAMI_SRC is correct
- Ensure Umami instance is accessible
- Check browser console for errors
- Verify no ad blocker is blocking script

### Events not showing
- Check console for tracking logs
- Wait ~30 seconds (Umami batches data)
- Refresh dashboard
- Check filters aren't hiding data

### No data in dashboard
- Verify Website ID is correct
- Check domain matches or use "localhost"
- Disable ad blocker
- Try in incognito mode

---

## Cost Breakdown

### Umami Cloud
- **Free Tier:** 100,000 events/month
- **Hobby:** $9/mo - 1M events
- **Pro:** $19/mo - 10M events

### Self-Hosted
- **Free** - Just server costs
- Railway: ~$5-10/mo
- Vercel: Free tier available
- VPS: $5/mo (DigitalOcean, Linode)

---

## Next Steps

1. ✅ Setup complete! (already integrated)
2. ⏳ Sign up for Umami Cloud
3. ⏳ Add credentials to `.env`
4. ✅ Restart dev server
5. ✅ Watch your data come in!

**Questions?** Check https://umami.is/docs or see `src/lib/umami.ts`
