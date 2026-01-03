# Sentry Integration - Setup & Configuration

**Status:** ✅ Code integrated | 🔄 Configuration pending  
**What It Does:** Error tracking, performance monitoring, user session tracking  
**Time to Setup:** 10-15 minutes

---

## What Is Sentry?

Sentry tracks:
- 🔴 **Runtime Errors** - Unhandled exceptions, crashes
- 📊 **Performance** - Page load times, API calls, user interactions
- 👥 **Users** - Know who was affected by errors
- 📈 **Trends** - Track error patterns over time
- 🎯 **Context** - Stack traces, console logs, breadcrumbs

**Example:** If 5% of users can't create habits, you'll know immediately.

---

## Setup Instructions

### Step 1: Create Sentry Account (Free Tier Available)

1. Go to: https://sentry.io/
2. Click **Sign Up** (free tier: 5,000 errors/month)
3. Create account
4. Create new project:
   - **Platform:** React
   - **Project name:** soul-forge-os
   - **Team:** Your team
   - Click **Create Project**
5. You'll get a **DSN** (Data Source Name) - looks like:
   ```
   https://<key>@<project-id>.ingest.sentry.io/<id>
   ```

### Step 2: Configure Environment Variables

Add to `.env.local` (local dev):
```bash
VITE_SENTRY_DSN=https://your-key@your-project.ingest.sentry.io/your-id
```

Add to GitHub Secrets (for production):
1. Go to: Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `VITE_SENTRY_DSN`
4. Value: Paste your DSN from Sentry
5. Click **Add secret**

### Step 3: Update GitHub Actions Workflow

Edit `.github/workflows/deploy.yml` to inject Sentry DSN:

```yaml
env:
  VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
```

(This makes Sentry work in production builds)

### Step 4: Test Locally

```bash
# Start dev server
npm run dev

# Go to http://localhost:5173
# Open browser console
# Type: Sentry.captureException(new Error("Test error"))
# Should appear in Sentry dashboard within seconds
```

---

## Code Changes Made

### New File: `src/lib/sentry-init.ts`
- Initializes Sentry with production settings
- Tracks performance (page loads, API calls)
- Captures unhandled errors
- Sets user context (know which user had the error)
- Filters spam errors (ResizeObserver, network timeouts)

**Key Functions:**
```typescript
initializeSentry()      // Call once on app startup
setSentryUser(userId)   // Call after user logs in
clearSentryUser()       // Call on logout
captureException(err)   // Manually report errors
```

### Modified: `src/main.tsx`
- Added `initializeSentry()` call before rendering React
- Ensures errors are captured from the very start

---

## What Gets Tracked (Automatically)

### ✅ Errors
- Unhandled exceptions
- React error boundaries
- Promise rejections
- Console.error() calls

### ✅ Performance
- Page load time
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)
- API request duration
- User interactions

### ✅ Sessions
- User journey (clicks, navigation)
- Duration in app
- Device info (browser, OS)
- Network condition

---

## Using Sentry in Code

### Example 1: Catch & Report Errors
```typescript
try {
  await createHabit(habitData);
} catch (error) {
  captureException(error, { habitData });
}
```

### Example 2: Track Custom Events
```typescript
import { captureMessage } from '@/lib/sentry-init';

// Track important milestones
captureMessage("User completed first streak", "info");
captureMessage("Unusual activity detected", "warning");
```

### Example 3: Set User Context (After Login)
```typescript
import { setSentryUser } from '@/lib/sentry-init';

// After user authenticates
setSentryUser(user.id, user.email);

// Now all errors will show "affected user: john@example.com"
```

### Example 4: Performance Tracking
```typescript
import { startTransaction } from '@/lib/sentry-init';

const transaction = startTransaction("fetch-habits", "http.client");
try {
  const habits = await fetchHabits();
} finally {
  transaction?.finish();
}
```

---

## Sentry Dashboard Features

Once configured, you can:

### Issues Tab
- See all errors grouped by type
- Stack trace with code context
- Affected users and frequency
- Release info (which version had the bug)

### Releases Tab
- Track which version introduced a bug
- See error rate per release
- Rollback alerts if error rate spikes

### Performance Tab
- Page load time trends
- Slow transactions
- API endpoint performance

### Alerts Tab
- Get notified when errors spike
- Set thresholds (e.g., alert if 10 errors in 5 min)
- Integrate with Slack

---

## Sample Sentry Dashboard Data

After setup, you'll see:

```
Issues:
  🔴 TypeError: Cannot read property 'name' of undefined
     Frequency: 23 times in last 24 hours
     Affected users: 3
     First seen: 2 hours ago
     
  🟡 Network Error: Failed to fetch habits
     Frequency: 12 times in last 24 hours
     Status: Needs investigation
     
Performance:
  Page Load: 2.3s avg (good)
  API Calls: 150ms avg (good)
  React Renders: 45ms avg (good)
```

---

## Privacy Considerations

Sentry config masks:
- ✅ User passwords
- ✅ API keys
- ✅ Sensitive form data
- ✅ Personal information in replay
- ✅ Media (images, videos)

---

## Production vs Development

| Mode | Tracking | Replays | Sampl Rate |
|------|----------|---------|-----------|
| **Development** | 100% | 100% | 100% |
| **Production** | 10% | 10% | 10% |

In production, we sample 10% to:
- Reduce costs
- Avoid tracking every single user
- Focus on patterns, not individual sessions

---

## Troubleshooting

### Sentry Not Capturing Errors
1. Check DSN is correct in `.env.local`
2. Verify Sentry project exists
3. Check browser console for Sentry errors
4. Make sure `initializeSentry()` is called

### Errors Not Appearing in Dashboard
1. Wait 5-10 seconds (slight delay)
2. Refresh Sentry dashboard
3. Check "Issues" tab (not "All Events")
4. Verify release version matches

### DSN Leaking in Public
1. Sentry DSN is OK to expose (it's intentional)
2. Contains no sensitive information
3. Built-in rate limiting prevents abuse
4. Only accepts errors from your domain

---

## Cost

**Sentry Free Tier:**
- 5,000 errors/month
- 1 project
- Basic alerts
- Good for small projects

**Paid Plans:**
- $29+/month for more events
- Increased replays
- Advanced features

---

## Next Steps

1. **Create Sentry account** (5 min)
2. **Get DSN** (1 min)
3. **Add to `.env.local`** (1 min)
4. **Update GitHub secrets** (2 min)
5. **Test locally** (5 min)
6. **Deploy** (automatic via GitHub Actions)

---

## Checklist

- [ ] Create Sentry account
- [ ] Create soul-forge-os project
- [ ] Copy DSN
- [ ] Add `VITE_SENTRY_DSN` to `.env.local`
- [ ] Add `VITE_SENTRY_DSN` to GitHub Secrets
- [ ] Test error capture locally
- [ ] Deploy (git push)
- [ ] Verify errors appear in Sentry dashboard

---

## Commands Reference

```bash
# Test Sentry locally
npm run dev
# In browser console:
# Sentry.captureException(new Error("Test"))

# Build for production
npm run build

# Deploy to GitHub Pages
git push origin main
```

---

## Resources

- **Sentry Docs:** https://docs.sentry.io/
- **React Integration:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Environment Variables:** https://docs.sentry.io/platforms/javascript/configuration/
- **Performance Monitoring:** https://docs.sentry.io/platforms/javascript/performance/

---

**Status:** Code integrated, awaiting configuration  
**Estimated Setup Time:** 15 minutes  
**Expected Benefit:** Catch production errors immediately
