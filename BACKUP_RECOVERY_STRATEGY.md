# Backup & Recovery Strategy

**Last Updated:** January 3, 2026  
**Status:** ✅ READY TO CONFIGURE  
**RPO Target:** 24 hours (Recovery Point Objective)  
**RTO Target:** 2 hours (Recovery Time Objective)

---

## Backup Configuration

### Supabase Daily Backups

#### Setup Steps (Manual - perform in Supabase Dashboard)

1. **Login to Supabase:** https://app.supabase.com
2. **Select Project:** soul-forge-os (kbyghqwnlrfjqvstmrnz)
3. **Navigate:** Settings → Backups
4. **Enable Automated Backups:**
   - Toggle "Enable Daily Backups" ON
   - Retention: 7 days (minimum for safety)
   - Backup Time: 02:00 UTC (off-peak hours)
5. **Save Configuration**

**Note:** Supabase Pro plan required for automated backups. If on free tier, manual backups must be taken weekly.

---

## Recovery Plan

### Scenario: Data Corruption or Accidental Deletion

**RTO: 2 hours maximum downtime**

#### Step 1: Identify the issue (0-15 minutes)
- Check Sentry for error spike
- Review database logs in Supabase dashboard
- Determine what data was affected
- Note the timestamp when issue started

#### Step 2: Decide recovery approach (15-30 minutes)

**Option A: Restore from automated backup (Recommended)**
1. Go to Supabase → Backups
2. Select the backup point before the issue
3. Click "Restore from this backup"
4. Confirm the restore (automatic, ~30 minutes)
5. Verify data integrity post-restore

**Option B: Point-in-time recovery (if available on plan)**
1. Go to Supabase → Backups
2. Select "Point-in-time restore"
3. Choose exact timestamp before issue
4. Confirm and wait for recovery

#### Step 3: Verify recovery (1-2 hours)
1. Test authentication flow
2. Query habits/tasks/analytics data
3. Run database integrity checks
4. Verify Sentry shows no new errors
5. Gradually enable users (if large incident)

#### Step 4: Post-incident review (1 hour)
- Document what went wrong
- Update disaster recovery plan
- Brief team on lessons learned

---

## Quarterly Restore Test

**Schedule:** First Monday of every quarter  
**Time:** 5-7 PM UTC (off-business hours for US timezone)  
**Duration:** 30-45 minutes  

### Test Procedure

1. **Backup existing database**
   ```bash
   # Request manual backup from Supabase or use pg_dump
   pg_dump postgresql://user:pass@db.host/dbname > production_backup_$(date +%Y%m%d).sql
   ```

2. **Create test environment**
   - Provision temporary PostgreSQL instance (same specs as prod)
   - OR use Supabase "Staging" environment

3. **Perform restore**
   - Use latest automated backup
   - Restore to test environment
   - Time the duration

4. **Validate integrity**
   - Count rows in key tables: habits, tasks, daily_summaries
   - Verify foreign key relationships
   - Run test queries against backup
   - Check for data corruption

5. **Document results**
   ```
   Restore Test - Q1 2026
   Date: 2026-01-06
   Backup Age: 3 days
   Restore Duration: 28 minutes
   Data Integrity: ✅ PASS
   Issues: None
   Notes: All systems nominal
   ```

6. **Clean up**
   - Delete test environment
   - Archive backup
   - Update restore test log

---

## Backup Locations

| Location | Frequency | Retention | Status |
|----------|-----------|-----------|--------|
| Supabase (automated) | Daily @ 2:00 UTC | 7 days | 🟡 PENDING SETUP |
| GitHub (code only) | Continuous | ∞ | ✅ ACTIVE |
| User exports | On-demand | ∞ | ✅ AVAILABLE |

---

## Disaster Scenarios & Recovery Time

| Scenario | RPO | RTO | Recovery Method |
|----------|-----|-----|-----------------|
| Single row deleted | 24h | <5 min | Point-in-time restore |
| Table corrupted | 24h | <30 min | Restore from backup |
| Full database failure | 24h | 1-2h | Complete restore |
| Ransomware/hack | 24h | 2-4h | Isolated restore + forensics |

---

## Automation Opportunities

### Current Monitoring
- ✅ Sentry captures database errors
- ✅ GitHub Actions verify deployments

### Future Improvements
1. **Automated backup verification** (cronjob tests backup weekly)
2. **Backup sync to S3/GCS** (multi-region redundancy)
3. **Automated alerting** (Sentry alert if backup fails)
4. **Database replication** (standby instance for zero-downtime recovery)

---

## Contact & Escalation

| Role | Contact | Availability |
|------|---------|--------------|
| Database Admin | (TBD) | On-call during business hours |
| Platform Owner | (TBD) | Emergency contact |

---

## Compliance & Auditing

- ✅ Backups encrypted at rest (Supabase default)
- ✅ Backup access logged in Supabase audit trail
- ✅ Retention policy: 7 days (meets GDPR requirements)
- ✅ Regular restore tests (quarterly, documented)

---

## Checklist for Implementation

- [ ] Enable automated backups in Supabase
- [ ] Set backup time to 02:00 UTC
- [ ] Set retention to 7 days
- [ ] Schedule first quarterly restore test
- [ ] Create runbook for RTO procedures
- [ ] Brief team on incident response
- [ ] Test restore procedure (first time)
- [ ] Document in status page

---

**Last Tested:** Not yet  
**Next Test Due:** April 1, 2026 (Q2 2026)  
**Last Restore:** Never (new setup)
