# Life OS – Final Issues & Action Tracker
**Date:** 2026-01-03  
**Owner:** Engineering Lead  
**Priority Legend:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---
## Critical (Blockers)
1) 🔴 **API key handling vulnerable**
   - Problem: XOR “encryption” + hardcoded key; keys stored in localStorage; XSS = key theft.
   - Fix: Move to backend proxy; encrypt with Web Crypto AES-GCM; remove client storage.

2) 🔴 **Missing security headers**
   - Problem: CSP/HSTS/X-Frame-Options absent.
   - Fix: Add at hosting/CDN layer; include Referrer-Policy and X-Content-Type-Options.

3) 🔴 **No backups/restore drill**
   - Problem: Supabase backups not automated; no RPO/RTO targets.
   - Fix: Enable daily backups; document quarterly restore test (RPO 24h, RTO 2h).

4) 🔴 **0% test coverage**
   - Problem: No test framework; regressions unprotected.
   - Fix: Install Vitest + RTL; add unit (gamification/utils), integration (mutations), E2E (auth→habit→complete).

5) 🔴 **No CI/CD checks**
   - Problem: Lint/typecheck/build not enforced on PRs.
   - Fix: GitHub Actions: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`; protect main.

---
## High
6) 🟠 **DB indexes missing for scale**
   - Problem: Queries will slow >10K users; no indexes on user_id/date/archived/completed.
   - Fix: Add indexes to habits/tasks/logs tables.

7) 🟠 **Audit logging absent**
   - Problem: No traceability for data access.
   - Fix: Add Supabase audit logs or external log sink; log auth + data mutations.

8) 🟠 **Release hygiene lacking**
   - Problem: No tagging/changelog; version static.
   - Fix: Semantic versioning + changelog; release checklist.

9) 🟠 **Accessibility integration incomplete**
   - Problem: Accessibility module only ~60% integrated (achievements grid/modal).
   - Fix: Wire keyboard nav/focus trap/ARIA labels; add aria-live for errors.

10) 🟠 **Password strength & 2FA missing**
    - Problem: Weak password requirement (6 chars); no MFA.
    - Fix: Enforce complexity; add optional 2FA.

---
## Medium
11) 🟡 **Monitoring limited to Umami**
    - Problem: No Sentry/error tracing; no Web Vitals telemetry.
    - Fix: Add Sentry; send ErrorBoundary logs + Web Vitals.

12) 🟡 **Inline documentation sparse**
    - Problem: Hooks/components lack JSDoc; no CONTRIBUTING.md.
    - Fix: Add CONTRIBUTING.md; JSDoc for key hooks/components; DB schema doc.

13) 🟡 **Data export/privacy flows**
    - Problem: No automated user data export/deletion flow; no policy links.
    - Fix: Add export/delete endpoints; publish Privacy/ToS in footer.

14) 🟡 **Performance guardrails**
    - Problem: No CI budget checks; no pagination in some lists.
    - Fix: Add Lighthouse/bundle budget check to CI; add pagination where lists can grow.

15) 🟡 **Runbooks missing**
    - Problem: No rollback/incident SOPs.
    - Fix: Create RUNBOOKS.md (deploy/rollback/cache purge/env rotation/common incidents).

---
## Low
16) 🟢 **React.memo underused**
    - Problem: Only 2 components memoized.
    - Fix: Memoize heavy components (CharacterCard, AchievementGrid, AnalyticsChart).

17) 🟢 **Focus indicators could be stronger**
    - Problem: Some buttons/links subtle focus states.
    - Fix: Increase outline contrast/width where needed.

18) 🟢 **Empty states UX**
    - Problem: Some lists lack friendly empty screens.
    - Fix: Add guided empty states (call-to-action buttons).

---
## 2-Week Action Plan (Effort ~16h)
- Week 1 (Infra/Safety): Items 1–5. 
- Week 2 (Scale/UX/Ops): Items 6–11; start docs/runbooks.
- Stretch: Items 12–18 as bandwidth allows.

---
## Completion Definition
- CI green (lint/typecheck/build/test); main protected.
- Sentry + Web Vitals live; CSP/HSTS/XFO enforced.
- Backups enabled + documented restore drill.
- DB indexed; tests added for core logic; accessibility fully integrated.
- Changelog/tagged release; CONTRIBUTING.md + runbooks published.
