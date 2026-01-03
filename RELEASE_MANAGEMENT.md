# Release Management Guide

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** January 3, 2026

---

## Quick Start

### To Create a New Release

1. **Update version in package.json**
   ```bash
   # Edit: package.json → version field
   # Example: "1.0.0" → "1.1.0"
   npm install  # Updates package-lock.json
   ```

2. **Update CHANGELOG.md**
   ```bash
   # Add new section at top:
   # ## [1.1.0] - YYYY-MM-DD
   # ### Features
   # - New feature description
   ```

3. **Commit & tag**
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "release: v1.1.0 - Feature description"
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin main
   git push origin v1.1.0
   ```

4. **Create GitHub Release**
   - Go to: https://github.com/himanshu102931/soul-forge-os/releases
   - Click "Draft a new release"
   - Tag: `v1.1.0`
   - Copy changelog section as description
   - Publish

---

## Semantic Versioning

### Version Format: MAJOR.MINOR.PATCH

| When to Bump | Example | Use Case |
|--------------|---------|----------|
| **MAJOR** | 1.0.0 → 2.0.0 | Breaking changes (data migration required, API changes) |
| **MINOR** | 1.0.0 → 1.1.0 | New features (backward compatible) |
| **PATCH** | 1.0.0 → 1.0.1 | Bug fixes |

### Examples

- **1.0.0 → 1.0.1** - Fix crash in habit creation
- **1.0.0 → 1.1.0** - Add AI suggestions feature
- **1.0.0 → 2.0.0** - Complete database schema redesign

---

## Detailed Release Workflow

### Step 1: Create Feature Branch

```bash
git checkout -b feature/new-feature
# or: git checkout -b bugfix/issue-name
```

### Step 2: Make Changes

```bash
# Edit files as needed
npm test     # Verify tests pass
npm run build  # Verify build works
```

### Step 3: Update Version

Open `package.json` and update version:

```json
{
  "name": "vite_react_shadcn_ts",
  "version": "1.1.0"  // ← Change this
}
```

Run:
```bash
npm install  # Updates package-lock.json with new version
```

### Step 4: Update Changelog

Edit `CHANGELOG.md` - add new section at top:

```markdown
## [1.1.0] - 2026-01-15

### Features
- Add AI suggestions for habits
- Improve calendar performance

### Bug Fixes
- Fix crash on habit deletion

### Security
- Update dependencies
```

### Step 5: Commit & Tag

```bash
# Stage files
git add package.json package-lock.json CHANGELOG.md

# Commit with semantic message
git commit -m "release: v1.1.0 - Add AI suggestions and performance improvements"

# Create annotated tag
git tag -a v1.1.0 -m "Release version 1.1.0"

# Push to GitHub
git push origin feature/new-feature  # Feature branch
git push origin main                 # main branch (after merge)
git push origin v1.1.0               # Tag
```

### Step 6: Create Pull Request

On GitHub:
1. Click "New Pull Request"
2. Select: `feature/new-feature` → `main`
3. Title: "Release v1.1.0 - Feature description"
4. Body: Copy changelog section
5. Click "Create Pull Request"

### Step 7: Merge & Create Release

After approval:
1. Click "Merge pull request"
2. Go to: Releases → Draft new release
3. Fill in:
   - **Tag:** v1.1.0
   - **Title:** Version 1.1.0 - Feature Description
   - **Description:** Copy from CHANGELOG.md
4. Click "Publish release"

GitHub will now show this as a release!

---

## Commit Message Conventions

Use semantic commit messages:

```
type(scope): description

feat(ai): add habit suggestions
fix(ui): correct modal overflow issue
docs(readme): update setup instructions
test: add component tests
perf(database): add performance indexes
ci(github-actions): update workflow
```

### Commit Types
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation
- **test:** Tests
- **perf:** Performance improvement
- **ci:** CI/CD changes
- **refactor:** Code refactoring
- **style:** Code style (formatting, linting)

---

## Version History Reference

| Version | Date | Status | Commits |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-03 | ✅ Released | 3 |
| 1.1.0 | TBD | 🔄 Planning | TBD |
| 2.0.0 | TBD | 🔄 Planning | TBD |

---

## Current Release: v1.0.0

**Released:** January 3, 2026  
**Status:** ✅ Production Ready

### What's Included
- ✅ Server-side API key encryption
- ✅ 81 comprehensive tests
- ✅ CI/CD automation (GitHub Actions)
- ✅ Database performance indexes
- ✅ Branch protection on main

### Download
- GitHub: https://github.com/himanshu102931/soul-forge-os/releases/tag/v1.0.0
- Live: https://himanshu102931.github.io/soul-forge-os/

---

## GitHub Release Management

### Viewing Releases

```bash
# List all releases
gh release list

# View specific release
gh release view v1.0.0

# Download release assets
gh release download v1.0.0
```

### Creating Release via CLI

```bash
gh release create v1.1.0 \
  --title "Version 1.1.0" \
  --notes "New features: AI suggestions, Performance improvements"
```

---

## Automated Release (Future)

Once setup:

```bash
# npm semantic-release (auto-detects changes, bumps version, creates release)
npm run release
```

This will:
- Analyze commits
- Determine version bump (major/minor/patch)
- Update CHANGELOG.md
- Create git tag
- Publish GitHub release
- All automatic! 🤖

---

## Troubleshooting

### Tag Already Exists
```bash
# Delete local tag
git tag -d v1.1.0

# Delete remote tag
git push origin --delete v1.1.0

# Re-create tag
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

### Wrong Version in package.json
```bash
# Fix version
# Edit package.json, then:
npm install  # Updates package-lock.json

# Commit fix
git add package.json package-lock.json
git commit -m "fix: correct version in package.json"
```

### Forgot to Update Changelog
```bash
# Update CHANGELOG.md
# Add missing section

# Amend last commit
git add CHANGELOG.md
git commit --amend --no-edit

# If already pushed, create new commit
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v1.1.0"
git push
```

---

## Best Practices

✅ **DO:**
- Use semantic versioning
- Update CHANGELOG before releasing
- Create annotated tags (git tag -a)
- Write clear commit messages
- Test before releasing (npm test && npm run build)
- Get code review before merge to main

❌ **DON'T:**
- Release without tests passing
- Skip CHANGELOG updates
- Force push to main
- Use lightweight tags (git tag without -a)
- Merge without CI approval

---

## Next Steps

1. **v1.0.0 Released** ✅
   - Celebrate! 🎉

2. **v1.1.0 Planning**
   - Sentry error monitoring
   - Performance improvements
   - New features

3. **v2.0.0 (Future)**
   - Major architecture changes
   - Requires user data migration

---

## Resources

- [Semantic Versioning](https://semver.org/) - Official spec
- [Keep a Changelog](https://keepachangelog.com/) - Changelog format
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit messages
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) - GitHub docs

---

**Status:** ✅ v1.0.0 Released  
**Next Release:** To be determined based on feature development
