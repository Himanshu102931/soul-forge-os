# CI/CD Setup & Branch Protection Guide

## Status: ✅ CI/CD Workflows Active

The project now has comprehensive CI/CD pipelines configured with GitHub Actions. This guide explains what's in place and how to complete the setup by enabling branch protection rules.

## Current CI/CD Infrastructure

### Workflows Configured

#### 1. **ci.yml** - Code Quality & Build Pipeline
- **Trigger:** Pushes to `main`/`develop` branches + Pull Requests
- **Node versions tested:** 18.x and 20.x (matrix testing)
- **Jobs:**
  1. **Quality checks:** `npm test`, `tsc --noEmit`, `npm run lint`
  2. **Build:** `npm run build` (Node 20.x only)
  3. **Artifacts:** Uploads `dist/` folder (7-day retention)
  4. **Notification:** Final status summary with emoji feedback
- **Concurrency:** Prevents overlapping runs on the same ref

#### 2. **deploy.yml** - GitHub Pages Deployment
- **Trigger:** Pushes to `main` branch only
- **Output:** Automatic deployment to `https://himanshu102931.github.io/soul-forge-os/`
- **Environment variables:** Supabase credentials injected from GitHub Secrets
- **Base path:** Configured for subpath deployment

#### 3. **security.yml** - Dependency Scanning
- **Trigger:** Weekly + on push
- **Purpose:** Detect vulnerable npm packages
- **Action:** GitHub's Dependency Alert system

## Test Coverage Status

### Tests Implemented
- **src/core-logic.test.ts** - Business logic (19 tests)
  - XP calculation (3 tests)
  - Completion rates (3 tests)
  - Date utilities (2 tests)
  - Data validation (3 tests)
  - Gamification (3 tests)
  - Streaks (5 tests)

- **src/hooks.test.ts** - React patterns (12 tests)
  - useState patterns
  - useEffect patterns
  - Async mutations
  - Error handling
  - Context patterns

- **src/sample.test.ts** - Example test (1 test)

**Total:** 32 tests passing ✅

### Coverage Needed
To enforce test coverage in CI/CD:

```bash
npm test -- --coverage
```

This requires adding `coverage: true` to vitest.config.ts

## Enabling Branch Protection (GitHub UI Steps)

### Step 1: Go to Repository Settings
1. Navigate to your GitHub repository
2. Click **Settings** tab
3. In left sidebar, click **Branches**
4. Click **Add rule** under "Branch protection rules"

### Step 2: Configure Protection Rule
1. **Branch name pattern:** Enter `main`
2. Check the following boxes:
   - ✅ **Require a pull request before merging**
     - Required approving reviews: `1`
   - ✅ **Require status checks to pass before merging**
     - Search for checks: 
       - `quality / Code Quality Check (18.x)`
       - `quality / Code Quality Check (20.x)`
       - `build / Build Production Bundle`
   - ✅ **Include administrators** (optional, for strict enforcement)
   - ✅ **Require branches to be up to date before merging**

### Step 3: Save Rule
Click **Create** button to activate protection on the `main` branch

## CI/CD Pipeline Flow

```
Developer Push
      ↓
   GitHub Actions
      ├─→ Quality Job (Node 18.x + 20.x)
      │   ├─→ npm ci (install)
      │   ├─→ npm test (32 tests)
      │   ├─→ tsc --noEmit (type check)
      │   └─→ npm run lint (code style)
      │
      └─→ Build Job (Node 20.x, waits for Quality)
          ├─→ npm ci
          ├─→ npm run build
          └─→ dist/ artifacts uploaded
```

If **any job fails**, branch protection blocks merge to `main`.

## Success Criteria

All of the following must PASS for a PR to merge to `main`:

1. ✅ Tests pass (32+ tests)
2. ✅ TypeScript compiles (tsc --noEmit)
3. ✅ Linting passes (ESLint)
4. ✅ Build succeeds (npm run build)
5. ✅ PR review approved (1+ approver)
6. ✅ Branch is up to date with main

## Checking CI/CD Status

### For Pull Requests
- The workflow status appears at the bottom of the PR
- Green checkmark (✅) = All checks passed
- Red X (❌) = At least one check failed
- You can click "Details" to see the full log

### From Command Line
```bash
# View workflow runs
gh run list

# View specific run details
gh run view <run-id>

# View detailed logs
gh run view <run-id> --log
```

## Troubleshooting CI/CD Failures

### Test Failures
```bash
npm test -- --reporter=verbose
```
See which test(s) are failing and fix locally first.

### TypeScript Errors
```bash
npx tsc --noEmit
```
Resolve type errors before pushing.

### Linting Errors
```bash
npm run lint
# To auto-fix:
npm run lint -- --fix
```

### Build Failures
```bash
npm run build
```
Check for missing dependencies or build errors.

## Future Enhancements

1. **Code Coverage Threshold**
   - Add `--coverage` to test command
   - Fail if coverage drops below 60-70%
   - Configure in `vitest.config.ts`

2. **Performance Budgets**
   - Check bundle size doesn't exceed limits
   - Alert on performance regressions
   - Track in `performance-budgets.json`

3. **Dependency Updates**
   - Automated Dependabot PRs (already enabled)
   - Run full CI/CD on dependency updates
   - Merge safe updates automatically

4. **Release Automation**
   - Version bumping (semantic-release)
   - Changelog generation
   - Tagged releases to GitHub + npm

5. **Code Coverage Reports**
   - Upload to Codecov
   - Enforce minimum coverage threshold
   - Trend reporting over time

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run 32 tests with Vitest |
| `npm run build` | Build production bundle |
| `npm run lint` | Check code style |
| `npm run typecheck` | Run TypeScript compiler |
| `npm run dev` | Start dev server |

## Documentation Files

- **SECURITY.md** - Security architecture & threat model
- **DEPLOYMENT_GUIDE.md** - Deployment procedures
- **README.md** - Setup & getting started
- **PHASE_5_PERFORMANCE_REPORT.md** - Performance metrics

---

**Status:** CI/CD ✅ Ready | Branch Protection 🔄 Needs GitHub UI Configuration

**Next Steps:**
1. Follow "Enabling Branch Protection" steps above
2. Create PR to test the CI/CD pipeline
3. Merge with confidence knowing all checks passed!
