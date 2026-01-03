# Quick Reference - CI/CD & Testing

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test src/core-logic.test.ts

# Run tests matching pattern
npm test -- --grep "XP calculation"
```

## Test Coverage

| Layer | Tests | File |
|-------|-------|------|
| Business Logic | 19 | `src/core-logic.test.ts` |
| React Hooks | 12 | `src/hooks.test.ts` |
| Components/UI | 49 | `src/components.test.tsx` |
| Example | 1 | `src/sample.test.ts` |
| **Total** | **81** | - |

## CI/CD Workflows

Located in: `.github/workflows/`

### ci.yml - Code Quality Pipeline
- **Trigger:** Push to main/develop + PR
- **Runs:** Node 18.x & 20.x (matrix)
- **Checks:**
  - ✅ Tests (81 tests)
  - ✅ Linting (ESLint)
  - ✅ Build (npm run build)
  - ✅ Artifact upload

### deploy.yml - GitHub Pages
- **Trigger:** Push to main only
- **Output:** Auto-deploys to GitHub Pages
- **Env:** Supabase credentials injected

### security.yml - Dependency Scanning
- **Trigger:** Weekly + on push
- **Purpose:** Detect vulnerable packages

## Activate Branch Protection

To prevent unvetted code merging to `main`:

1. Settings → Branches
2. Add rule for `main` branch
3. Check:
   - Require PR review (1 approval)
   - Require status checks: `quality/*`, `build/*`
   - Require branches up to date
4. Create rule

**Effect:** PR blocks merge until all CI checks pass

## Build & Deployment

```bash
# Local development
npm run dev           # Start dev server at http://localhost:5173

# Build for production
npm run build         # Creates dist/ folder
npm run build:dev     # Build with dev settings

# Preview production build locally
npm run preview       # Serves dist/ locally

# Check code style
npm run lint          # ESLint check

# Production deployment
# Automatic on merge to main via GitHub Actions
# URL: https://himanshu102931.github.io/soul-forge-os/
```

## Test File Structure

All test files use this pattern:

```typescript
import { describe, it, expect, vi } from "vitest";

describe("Feature Name", () => {
  it("should do something specific", () => {
    // Arrange
    const input = "test";
    
    // Act
    const result = processInput(input);
    
    // Assert
    expect(result).toBe("expected");
  });

  it("should handle error cases", () => {
    const mockFn = vi.fn();
    mockFn("arg");
    expect(mockFn).toHaveBeenCalledWith("arg");
  });
});
```

## Test Organization

### src/core-logic.test.ts
Tests for game mechanics:
- XP calculations (10pt for complete, 5pt partial, -5pt missed)
- Habit completion rates
- Streak calculations
- Gamification (levels, achievements)
- Data validation

### src/hooks.test.ts
Tests for React patterns:
- State management (useState)
- Side effects (useEffect)
- Callbacks (useCallback)
- Memoization (useMemo)
- Context (useContext)

### src/components.test.tsx
Tests for UI/component patterns:
- Form submission & validation
- Event handlers (click, change, input)
- Loading/error states
- Modal behavior
- Focus management
- Accessibility (ARIA)
- Checkbox/toggle patterns
- Input validation
- Select/dropdown patterns
- List rendering

## Debugging Failed Tests

```bash
# See detailed failure info
npm test -- --reporter=verbose

# Run only failing tests
npm test -- --reporter=verbose

# Update snapshots (if using snapshot tests)
npm test -- --update
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Test execution | 2.4 seconds |
| Build time | 12.2 seconds |
| Main bundle | 358 KB (gzip: 104 KB) |
| Total tests | 81 passing |

## Status Check

```bash
# Verify everything works
npm test && npm run build

# Expected output:
# Test Files  4 passed
#      Tests  81 passed
# Built in 12.21s
```

## Next Steps

1. **Activate branch protection** (GitHub UI)
   - Settings → Branches → Add rule for `main`
   - Require: CI checks pass + 1 review

2. **Database optimization** (next phase)
   - Add indexes to habits, tasks, daily_summaries tables
   - Performance testing with 10K+ records

3. **Coverage reporting** (future)
   - Add `--coverage` flag to tests
   - Enforce 60%+ line coverage

4. **Release automation** (future)
   - Semantic versioning
   - Automated changelog
   - GitHub releases

## Files Reference

- **CI/CD Setup:** [CI_CD_SETUP_GUIDE.md](CI_CD_SETUP_GUIDE.md)
- **CI/CD Status:** [CI_CD_COMPLETE.md](CI_CD_COMPLETE.md)
- **Security:** [SECURITY.md](SECURITY.md)
- **Workflows:** [.github/workflows/](.github/workflows)
- **Tests:** [src/](src/)
- **Config:** [vitest.config.ts](vitest.config.ts)

## Common Issues

**Tests fail locally but pass in CI:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18.x or 20.x)

**Build errors:**
- Clear cache: `npm run build -- --force`
- Check TypeScript: `npx tsc --noEmit`

**Deployment stuck:**
- Check GitHub Actions: Settings → Actions → Recent runs
- View workflow logs: Click on failed run → See detailed logs

## Contributing

When adding features:
1. Write tests first (TDD)
2. Implement feature
3. Verify: `npm test && npm run build`
4. Create PR (CI checks automatically)
5. Merge when CI passes + reviewed

---

**Last Updated:** January 3, 2025  
**Status:** ✅ CI/CD Active | 81 Tests Passing | Ready for Production
