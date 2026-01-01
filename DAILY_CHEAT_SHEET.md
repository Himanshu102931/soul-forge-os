# ⚡ CHEAT SHEET - Daily Commands

**Keep this open while coding!**

---

## 🚀 START CODING (Every Day)

```powershell
cd "E:\App\Habit Checker\soul-forge-os-main"
npm run dev
# Opens: http://localhost:5173
```

---

## 📝 GIT COMMANDS

```powershell
# Daily
git status
git add .
git commit -m "Week 1 Day 1: Fixed TODOs"
git push origin feature/week1

# Weekly
git checkout main
git merge feature/week1
git push origin main
git checkout -b feature/week2
```

---

## 🗄️ SUPABASE LINKS

**Dashboard:** https://supabase.com/dashboard/project/abugumajinzeoorgoxrw  
**Tables:** /editor  
**SQL:** /sql  
**Auth:** /auth/users  
**Backups:** /database/backups

---

## 🐛 DEBUGGING

```
F12 → Console (check errors)
F12 → Network (check API calls)
```

**Connection Error?**
```powershell
# Check .env exists
Get-Content .env

# Restart server
Ctrl+C
npm run dev
```

---

## 🔒 SECURITY CHECK

```powershell
# Before commit - ensure .env not tracked
git status | Select-String ".env"
# Should return nothing

# If .env shows up:
git rm --cached .env
```

---

## 📅 WEEKLY CHECKLIST (Sunday)

```
□ git merge week branch
□ Export Supabase backup
□ npm run build (test)
□ Plan next week
```

---

## 🎯 WEEK 1 TASKS

```
Day 1:   Fix TODOs (1h) + Timezone (2h) + Umami (2h)
Day 2-3: Streak Freeze DB (10h)
Day 4-5: Streak Freeze UI (12h)
Day 6-7: Enhanced Auth (12h)
Day 8+:  Testing (6h)
```

---

## 💬 GOOD COMMIT MESSAGES

```bash
✅ "Week 1 Day 1: Fixed TODOs in AI components"
✅ "Added streak freeze database migration"
✅ "Implemented timezone selector"

❌ "updates"
❌ "fix"
```

---

## 🆘 EMERGENCY

**Committed .env by accident?**
```powershell
git rm --cached .env
git commit -m "Remove .env"
git push --force
```

**Undo last commit?**
```powershell
git reset HEAD~1  # Keep changes
git reset --hard HEAD~1  # Delete changes
```

---

## ✅ PRE-COMMIT CHECKLIST

```
□ npm run dev works
□ Tested in browser
□ F12 console clean
□ .env not staged
□ Clear commit message
```

---

**LAUNCH: Feb 1, 2026 (30 days) 🚀**
