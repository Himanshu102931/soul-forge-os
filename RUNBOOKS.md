# Operations Runbooks

**Last Updated:** January 3, 2026  
**Purpose:** Step-by-step procedures for common operational tasks and incidents  

---

## Table of Contents
1. [Deployment](#deployment)
2. [Rollback](#rollback)
3. [Cache Purge](#cache-purge)
4. [Environment Rotation](#environment-rotation)
5. [Common Incidents](#common-incidents)

---

## Deployment

### Normal Deployment (Automatic)
**Duration:** 3-5 minutes  
**Automated via GitHub Actions**

1. **Trigger:** Push to `main` branch
2. **Checks:** TypeScript, lint, tests, build
3. **Result:** Auto-deploys to GitHub Pages
4. **Verification:** Visit https://himanshu102931.github.io/soul-forge-os/

### Manual Deployment
**Use only if GitHub Actions fails**

```bash
# 1. Clone repo
git clone https://github.com/Himanshu102931/soul-forge-os.git
cd soul-forge-os

# 2. Install dependencies
npm install

# 3. Run checks (verify they pass)
npm run lint          # Should pass
npm run typecheck     # Should pass
npm test              # Should pass 81/81
npm run build         # Should produce dist/

# 4. Deploy to GitHub Pages
npm run deploy        # (if custom script exists)
# OR manually upload dist/ to gh-pages branch

# 5. Verify
# Open https://himanshu102931.github.io/soul-forge-os/
# Check console (F12) for errors
# Test login flow
```

---

## Rollback

### Scenario: Production Deployment Breaks App

**Duration:** 5-10 minutes  
**RTO:** Complete within 10 minutes

### Option 1: Revert Last Commit (Recommended)

```bash
# 1. Identify bad commit
git log --oneline -5

# 2. Revert the commit
git revert HEAD
# OR
git reset --hard HEAD~1

# 3. Push revert to main
git push origin main

# 4. GitHub Actions auto-deploys reverted version
# Deployment takes 3-5 minutes

# 5. Verify
# Open app and test critical flows
# Check Sentry for errors
```

### Option 2: Restore Previous Release Tag

```bash
# 1. List available release tags
git tag -l | grep v

# 2. Checkout previous stable version
git checkout v1.0.0  # or latest working tag

# 3. Create rollback branch
git checkout -b hotfix/rollback-to-v1.0.0

# 4. Push to main to trigger deployment
git push origin hotfix/rollback-to-v1.0.0:main

# 5. Wait for deployment (3-5 minutes)

# 6. Investigate what broke
# Review new commit that caused issue
# Fix the problem
```

---

## Cache Purge

### Scenario: Users See Stale CSS/JS After Deployment

**Duration:** 2 minutes + 15 min cache invalidation

### GitHub Pages Cache

GitHub Pages caches assets for ~15 minutes.

```bash
# 1. Force file updates by bumping version
# Edit package.json:
# "version": "1.0.0" → "1.0.1"

# 2. Rebuild with new assets
npm run build

# 3. Commit and push
git add .
git commit -m "chore: Cache bust for CSS/JS assets"
git push origin main

# 4. GitHub Actions deploys new version
# Asset files get new hash (e.g., index-XjB5we0C.js → index-ABC1DEF2.js)

# 5. Users' browsers fetch fresh files within 15 minutes
# OR manually: Hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)
```

### Browser Cache for Specific User

Send user these instructions:
1. Open DevTools (F12)
2. Right-click refresh button → "Empty cache and hard refresh"
3. OR: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. OR: Clear browser cookies/localStorage:
   ```
   Settings → Privacy → Clear browsing data
   ```

---

## Environment Rotation

### Scenario: Rotate Supabase Keys

**Duration:** 15 minutes  
**Impact:** Zero downtime

### Step 1: Generate New Keys in Supabase

1. **Login to Supabase:** https://app.supabase.com
2. **Select Project:** soul-forge-os
3. **Go to:** Settings → API
4. **Copy new keys:**
   - VITE_SUPABASE_URL (same)
   - VITE_SUPABASE_PUBLISHABLE_KEY (new)
   - VITE_SENTRY_DSN (if rotating Sentry)

### Step 2: Update GitHub Secrets

1. **Go to:** https://github.com/Himanshu102931/soul-forge-os/settings/secrets/actions
2. **Update each secret:**
   - VITE_SUPABASE_PUBLISHABLE_KEY → paste new key
   - VITE_SENTRY_DSN → paste new DSN (if needed)
3. **Click "Update secret"** for each

### Step 3: Update Local .env.local

```bash
# 1. Edit .env.local
VITE_SUPABASE_URL=https://kbyghqwnlrfjqvstmrnz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<NEW_KEY_HERE>
VITE_SENTRY_DSN=<NEW_DSN_HERE>

# 2. Test locally
npm run dev
# Visit http://localhost:8081 and verify login works

# 3. Commit (don't push secrets, just .env.local structure)
git add .env.local
git commit -m "chore: Update env template (secrets in GitHub)"
```

### Step 4: Verify in Production

1. **Wait for next deployment** or trigger manually
2. **Test login flow** at https://himanshu102931.github.io/soul-forge-os/
3. **Check Sentry** for any auth-related errors
4. **Monitor for 1 hour** for spike in errors

---

## Common Incidents

### Incident 1: App Showing Blank Page

**Detection:** Users report "app doesn't load" or white screen  
**Duration:** 5-15 minutes  
**Severity:** CRITICAL

#### Diagnosis

1. **Check browser console** (F12 → Console)
   - Look for red errors
   - Common: "Cannot find module", "TypeError", "Unauthorized"

2. **Check network tab** (F12 → Network)
   - Look for 404, 403, 500 errors
   - Common sources: Supabase, Sentry, API calls

3. **Check Sentry dashboard**
   - Look for spike in errors
   - Filter by "latest" errors

#### Recovery by Symptom

**If: `Cannot read property 'user' of undefined`**
- Cause: Auth context not initialized
- Fix: 
  ```bash
  # 1. Clear localStorage
  # Browser DevTools → Application → LocalStorage → Clear all
  
  # 2. Hard refresh (Ctrl+Shift+R)
  
  # 3. If persists, rollback last commit
  git revert HEAD
  git push origin main
  ```

**If: `403 Forbidden` on Supabase requests**
- Cause: RLS policy blocking queries OR expired token
- Fix:
  ```bash
  # 1. Try login again (new session)
  # 2. If fails, check RLS policies:
  # Supabase → Authentication → RLS policies
  # 3. If policy changed, rollback code changes
  ```

**If: Sentry reports spike in errors**
- Cause: New code deploy introduced bug
- Fix: Rollback (see [Rollback](#rollback) section)

### Incident 2: Slow Performance

**Detection:** Page loads slow, buttons lag  
**Duration:** 10-20 minutes diagnosis  
**Severity:** HIGH

#### Diagnosis

1. **Check Sentry Performance**
   - Transactions tab
   - Look for long-duration transactions
   - Common: API calls, database queries

2. **Check Supabase metrics**
   - Supabase → Project Stats
   - Look for slow queries (>1s)
   - Check CPU/memory usage

3. **Check browser DevTools (Performance tab)**
   - Run performance audit
   - Look for bottlenecks

#### Recovery by Cause

**If: Large API response (>5MB)**
- Add pagination to list views
- Implement lazy loading
- Cache responses

**If: Database query slow**
- Check if indexes are missing
- Run query with EXPLAIN ANALYZE
- Add missing indexes

**If: CPU spike**
- Check if function running in loop
- Look at Sentry profiling data
- Code review recent changes

### Incident 3: Data Corruption / Unexpected Deletions

**Detection:** Users report data missing or incorrect  
**Duration:** 30-60 minutes  
**Severity:** CRITICAL

#### Diagnosis (First 5 minutes)

1. **DO NOT PANIC - DO NOT DELETE ANYTHING ELSE**
2. **Check deletion logs:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM user_ai_config WHERE deleted_at IS NOT NULL LIMIT 10;
   ```

3. **Check Sentry for mutations**
   - Look for unusual DELETE requests
   - Check source (user action vs bug)

4. **Identify scope:**
   - Single user? Single table? All users?
   - When did deletion happen? (Check timestamps)

#### Recovery (30-120 minutes)

1. **Option A: Soft delete recovery** (if soft deletes enabled)
   ```sql
   -- Restore deleted rows
   UPDATE user_ai_config 
   SET deleted_at = NULL 
   WHERE deleted_at > NOW() - INTERVAL '24 hours' 
   AND user_id = '<affected_user_id>';
   ```

2. **Option B: Restore from backup** (see [Backup & Recovery](#backup--recovery-strategy))
   - Duration: 30-60 minutes
   - Data loss: Up to 24 hours (depends on backup)

3. **Option C: Manual data entry** (last resort)
   - For single user: Ask user to re-enter data
   - For many users: Notify + apologize + offer compensation

---

## Incident Response Checklist

For ANY incident:

- [ ] **ASSESS:** What's broken? How many users affected?
- [ ] **ALERT:** Post status message (if >5 min impact)
- [ ] **DIAGNOSE:** Check logs, Sentry, metrics
- [ ] **FIX:** Implement fastest solution
- [ ] **VERIFY:** Test fix in dev, stage, prod
- [ ] **COMMUNICATE:** Update status page
- [ ] **DOCUMENT:** Write incident report
- [ ] **REVIEW:** Schedule postmortem (within 48h)

---

## Quick Reference: Useful Commands

```bash
# View recent deployments
git log --oneline -10

# Check which version is deployed
cat package.json | grep version

# View Sentry errors (via API)
curl -H "Authorization: Bearer <AUTH_TOKEN>" \
  https://sentry.io/api/0/projects/org/project/issues/?query=is%3Aunresolved

# Monitor local app
npm run dev

# Run tests
npm test -- --reporter=verbose

# Run type check
npm run typecheck

# Generate bundle analysis
npm run build -- --profile
```

---

## Escalation Path

| Severity | Response Time | Escalation |
|----------|---------------|-----------|
| 🔴 CRITICAL | <5 min | Immediate notification to all stakeholders |
| 🟠 HIGH | <15 min | Notify team lead + team |
| 🟡 MEDIUM | <1 hour | Log issue + schedule fix |
| 🟢 LOW | <1 day | Add to backlog |

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **GitHub Actions:** https://github.com/Himanshu102931/soul-forge-os/actions
- **Sentry Dashboard:** https://sentry.io/organizations/
- **App Deployed:** https://himanshu102931.github.io/soul-forge-os/

---

**Last Updated By:** AI Engineering Assistant  
**Last Review Date:** 2026-01-03  
**Next Review Due:** 2026-02-03 (monthly)
