# 🎯 START HERE - STEP-BY-STEP SETUP GUIDE

**Created:** January 1, 2026  
**Follow these steps IN ORDER before coding**

---

## ✅ STEP 1: GIT INITIALIZATION (5 minutes)

### **A. Create .gitignore file**
Run these commands in PowerShell:

```powershell
cd "E:\App\Habit Checker\soul-forge-os-main"

# Create .gitignore (if doesn't exist)
@"
# Dependencies
node_modules
dist
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.*.local

# Editor directories
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
lerna-debug.log*

# Temporary files
.temp
.cache

# Supabase
.supabase

# OS
Thumbs.db
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
```

### **B. Create .env.example (no secrets)**
```powershell
@"
# Supabase Configuration (Get these from https://supabase.com/dashboard)
VITE_SUPABASE_PROJECT_ID=your-project-id-here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# Optional (Week 2+)
# VITE_SENDGRID_API_KEY=your-sendgrid-key
# VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
# VITE_UMAMI_WEBSITE_ID=your-umami-website-id
"@ | Out-File -FilePath ".env.example" -Encoding utf8
```

### **C. Initialize Git**
```powershell
git init
git add .
git commit -m "Initial commit - Life OS MVP ready for Feb 1, 2026 launch"
```

### **D. Create GitHub Repository**

**Option 1: Using GitHub CLI (recommended)**
```powershell
# Install GitHub CLI if you don't have it
# Download from: https://cli.github.com/

gh auth login
gh repo create life-os --public --source=. --remote=origin
git push -u origin main
```

**Option 2: Manual (if no GitHub CLI)**
1. Go to https://github.com/new
2. Repository name: `life-os` (or `habit-tracker-rpg`)
3. Description: "Personal habit tracker with RPG mechanics. Launching Feb 1, 2026 🚀"
4. Public ✅ (for portfolio)
5. Don't initialize with README (you already have files)
6. Create repository
7. Copy the URL (e.g., https://github.com/yourusername/life-os.git)

Then run:
```powershell
git remote add origin https://github.com/yourusername/life-os.git
git branch -M main
git push -u origin main
```

---

## ✅ STEP 2: VERIFY SUPABASE SETUP (Already Done ✅)

**Your Configuration:**
```
✅ Project ID: abugumajinzeoorgoxrw
✅ URL: https://abugumajinzeoorgoxrw.supabase.co
✅ Anon Key: Present in .env file
✅ Database: 6 tables created
✅ RLS: 20 policies active
✅ Migration: Applied successfully
```

**No action needed** - Everything working correctly!

To verify anytime, go to:
https://supabase.com/dashboard/project/abugumajinzeoorgoxrw

---

## ✅ STEP 3: UMAMI ANALYTICS SETUP (20 minutes)

### **Option A: Self-Hosted on Vercel (FREE) - Recommended**

**1. Fork Umami Repository**
```
1. Go to: https://github.com/umami-software/umami
2. Click "Fork" (top right)
3. Creates: https://github.com/yourusername/umami
```

**2. Deploy to Vercel**
```
1. Go to: https://vercel.com/new
2. Import Git Repository
3. Select your forked `umami` repo
4. Environment Variables:
   - DATABASE_URL: (use Supabase or Vercel Postgres)
     For Supabase: 
     postgresql://postgres:[YOUR-PASSWORD]@db.abugumajinzeoorgoxrw.supabase.co:5432/postgres
   - HASH_SALT: (random string, e.g., "abc123xyz789")
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your Umami URL: https://umami-yourusername.vercel.app
```

**3. Create Website in Umami**
```
1. Visit your Umami URL
2. Default login:
   - Username: admin
   - Password: umami
3. Settings → Websites → Add Website
4. Name: "Life OS"
5. Domain: (your production URL or localhost for now)
6. Copy the tracking code
```

**4. Add Tracking to Life OS**

Edit: `soul-forge-os-main/index.html`

Add before closing `</head>` tag:
```html
<!-- Umami Analytics -->
<script
  defer
  src="https://umami-yourusername.vercel.app/script.js"
  data-website-id="YOUR-WEBSITE-ID-FROM-STEP-3"
></script>
```

**5. Test It Works**
```
1. Run: npm run dev
2. Visit: http://localhost:5173
3. Click around the app
4. Go to Umami dashboard
5. Should see 1 visitor (you!)
```

### **Option B: Umami Cloud (Paid) - Skip for now**
Cost: $20/month  
Not needed for MVP.

---

## ✅ STEP 4: BACKUP STRATEGY

### **A. Supabase Automatic Backups (Enable Now)**
```
1. Go to: https://supabase.com/dashboard/project/abugumajinzeoorgoxrw
2. Settings → Database → Backups
3. Enable "Point in Time Recovery" (free for 7 days)
4. Enable "Daily Backups" (keeps 7 days)
```

### **B. Manual Export (Do Now + Weekly)**
```
1. Go to: https://supabase.com/dashboard/project/abugumajinzeoorgoxrw
2. Database → Backups
3. Click "Download" (downloads SQL dump)
4. Save to: E:\App\Habit Checker\Backups\
5. Filename: life-os-backup-2026-01-01.sql
```

**Set Weekly Reminder:** Every Sunday, export database backup

### **C. Code Backups (Git - Automatic)**
```powershell
# Every day after coding:
git add .
git commit -m "Descriptive message of what you built"
git push origin main

# GitHub stores infinite history!
```

### **D. Restore Procedure (If Something Breaks)**

**Restore Database:**
```
1. Go to Supabase Dashboard
2. Database → Backups
3. Select backup date
4. Click "Restore"
5. Confirm
6. Wait 5-10 minutes
```

**Restore Code:**
```powershell
# See all commits
git log --oneline

# Go back to specific commit
git checkout <commit-hash>

# Create new branch from old state
git checkout -b restore-from-backup
```

---

## ✅ STEP 5: BRANCHING STRATEGY

### **Branch Structure**

```
main (production)
 └─ feature/week1 (Week 1 work)
     ├─ feature/streak-freeze (specific feature)
     ├─ feature/profile-picture
     └─ feature/auth-ui

 └─ feature/week2 (Week 2 work)
 └─ feature/week3 (Week 3 work)
 └─ feature/week4 (Week 4 work)
```

### **Daily Workflow**

**Monday - Start of Week 1:**
```powershell
# Create branch for Week 1
git checkout -b feature/week1

# Work on features...
git add .
git commit -m "Week 1 Day 1: Fixed TODOs in AI components"
git push origin feature/week1
```

**Tuesday - Continue Week 1:**
```powershell
# Already on feature/week1
git add .
git commit -m "Week 1 Day 2: Added timezone support"
git push origin feature/week1
```

**Sunday - End of Week 1:**
```powershell
# Merge back to main
git checkout main
git merge feature/week1
git push origin main

# Start Week 2
git checkout -b feature/week2
```

### **For Specific Features (Optional):**
```powershell
# Create sub-branch from week branch
git checkout feature/week1
git checkout -b feature/streak-freeze

# Work on streak freeze...
git add .
git commit -m "Implemented streak freeze database schema"
git push origin feature/streak-freeze

# When done, merge back
git checkout feature/week1
git merge feature/streak-freeze
```

---

## ✅ STEP 6: DEVELOPMENT ENVIRONMENT CHECK

### **Verify Everything Works**

```powershell
cd "E:\App\Habit Checker\soul-forge-os-main"

# Install dependencies (if not done)
npm install

# Run development server
npm run dev

# Should see:
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.x.x:5173/
```

**Test in browser:**
```
1. Visit: http://localhost:5173
2. Sign up with test account
3. Add a habit
4. Complete the habit
5. Check streak shows correctly
6. Check profile page loads
```

If everything works: **✅ Ready to code!**

---

## ✅ STEP 7: SECURITY PRE-CHECK

### **Verify .env is NOT in Git**

```powershell
# This should show .env in red (ignored)
git status

# This should return empty (not tracked)
git ls-files | Select-String ".env"
```

If `.env` shows up in `git status` as green (staged):
```powershell
git rm --cached .env
git commit -m "Remove .env from Git"
```

### **Check for Hardcoded Secrets**

```powershell
# Search for potential hardcoded keys
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Select-String -Pattern "eyJhbG" -SimpleMatch

# Should return 0 results (or only .env file)
```

---

## ✅ STEP 8: READY TO START!

### **You've Now Completed:**
- ✅ Git initialized
- ✅ GitHub repo created
- ✅ Supabase verified
- ✅ Umami analytics set up
- ✅ Backup strategy in place
- ✅ Branching strategy understood
- ✅ Security checked
- ✅ Development environment working

---

## 🚀 NEXT STEPS

### **In Your New Session, Say:**

**"I'm ready to start Week 1, Day 1. Let's fix the TODOs in the AI components."**

I'll provide:
1. Exact code to write
2. Files to edit
3. How to test it works
4. Git commands to commit

---

## 📞 GETTING HELP IN NEW SESSION

### **When You Start New Conversation:**

**Copy-paste this:**

```
Hi! I'm starting development on Life OS habit tracker.

Context:
- Launch date: February 1, 2026
- Daily availability: 5-6 hours
- Currently: Week 1, Day 1
- Task: Fix 3 TODOs in AI components

Setup completed:
✅ Supabase (Project ID: abugumajinzeoorgoxrw)
✅ Git & GitHub
✅ Umami analytics
✅ Backup strategy

Current branch: feature/week1

Ready for step-by-step coding guidance!
```

Then I'll guide you through each file edit, test, and commit.

---

## 📋 WEEKLY CHECKLIST

### **Every Sunday:**
```
□ Review progress (what shipped this week)
□ Merge week branch to main
□ Push to GitHub
□ Export Supabase backup
□ Plan next week (read LAUNCH_PLAN_FEB1_2026.md)
□ Celebrate wins! 🎉
```

---

## 🆘 TROUBLESHOOTING

### **Problem: Git says "not a git repository"**
```powershell
cd "E:\App\Habit Checker\soul-forge-os-main"
git init
```

### **Problem: npm install fails**
```powershell
# Clear cache
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### **Problem: Supabase connection error**
```
Check .env file has correct:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

Restart dev server:
Ctrl+C (stop)
npm run dev (start again)
```

### **Problem: Umami not tracking**
```
1. Check script tag in index.html
2. Check website ID is correct
3. Disable ad blocker
4. Open browser console (F12) - look for errors
```

---

## ✅ FINAL PRE-LAUNCH CHECKLIST (Week 4)

```
□ All features tested manually
□ Mobile responsive (tested on phone)
□ Umami analytics tracking
□ .env not in Git
□ Privacy policy live
□ Terms of service live
□ Production build works: npm run build
□ Deployed to Vercel
□ Custom domain (optional)
□ Product Hunt post ready
□ Reddit posts ready
□ Twitter thread ready
□ Email to send (if waitlist)
```

---

**YOU'RE ALL SET! 🎉**

**Next action:** Create new conversation and say:

**"I'm ready to start Week 1, Day 1."**

Let's build this! 💪🚀
