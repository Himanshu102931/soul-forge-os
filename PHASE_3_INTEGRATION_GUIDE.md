# Phase 3 Integration Quick Reference

## 🎯 Module Integration Steps

### 1. Animation Optimizer Integration

**Step 1: Import in AchievementUnlockToast.tsx**
```tsx
import { 
  SPRING_CONFIGS, 
  ANIMATION_PRESETS,
  useOptimizedAnimationProps,
  getPrefersReducedMotion 
} from '@/lib/animation-optimizer';

export function AchievementUnlockToast({ achievement }) {
  const unlockAnimation = useOptimizedAnimationProps('achievementUnlock');
  
  return (
    <motion.div {...unlockAnimation}>
      <div className="toast-content">
        <Trophy className="w-12 h-12" />
        <h3>{achievement.name}</h3>
        <p>{achievement.description}</p>
      </div>
    </motion.div>
  );
}
```

**Step 2: Update AchievementGrid.tsx for staggered items**
```tsx
import { useStaggeredAnimation } from '@/lib/animation-optimizer';

export function AchievementGrid({ achievements }) {
  const staggerVariants = useStaggeredAnimation(achievements.length);
  
  return (
    <motion.div 
      variants={staggerVariants.container}
      initial="hidden"
      animate="show"
    >
      {achievements.map((achievement) => (
        <motion.div 
          key={achievement.id}
          variants={staggerVariants.item}
        >
          <AchievementCard achievement={achievement} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**Step 3: Optional - Add FPS monitoring in dev**
```tsx
import { createFPSMonitor, initPerformanceMonitoring } from '@/lib/animation-optimizer';

useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    initPerformanceMonitoring();
    const monitor = createFPSMonitor();
    monitor.startMonitoring();
    
    return () => monitor.stopMonitoring();
  }
}, []);
```

---

### 2. Accessibility Integration

**Step 1: Add keyboard navigation to AchievementGrid**
```tsx
import { useKeyboardNavigation } from '@/lib/accessibility';

export function AchievementGrid({ achievements }) {
  const { currentIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: achievements.length,
    onSelect: (index) => {
      selectAchievement(achievements[index]);
    },
    allowHorizontal: true,
    allowVertical: true,
    wrapAround: true,
  });

  return (
    <div 
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {achievements.map((achievement, idx) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          isSelected={idx === currentIndex}
          tabIndex={idx === currentIndex ? 0 : -1}
        />
      ))}
    </div>
  );
}
```

**Step 2: Add ARIA labels to Achievement cards**
```tsx
import { generateAriaLabel } from '@/lib/accessibility';

function AchievementCard({ achievement, isSelected }) {
  const ariaLabel = generateAriaLabel({
    type: 'achievement',
    label: achievement.name,
    state: achievement.unlocked ? 'unlocked' : 'locked',
    count: achievement.progress,
  });

  return (
    <button
      aria-label={ariaLabel}
      aria-selected={isSelected}
      role="option"
    >
      {achievement.name}
    </button>
  );
}
```

**Step 3: Add focus management to Achievement detail modal**
```tsx
import { useFocusManagement } from '@/lib/accessibility';

export function AchievementDetailModal({ achievement, isOpen, onClose }) {
  const { containerRef, trapFocus } = useFocusManagement();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={containerRef}
        onKeyDown={trapFocus}
        role="alertdialog"
      >
        <h2>{achievement.name}</h2>
        <p>{achievement.description}</p>
        
        <button onClick={onClose}>Close (Esc)</button>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 4: Add skip to main content link**
```tsx
import { SkipToMainContent } from '@/lib/accessibility';

export function Layout() {
  return (
    <>
      <SkipToMainContent />
      
      <header>Navigation</header>
      
      <main id="main-content">
        {/* Main content */}
      </main>
      
      <footer>Footer</footer>
    </>
  );
}
```

---

## 🧪 Running Tests

```bash
# Run achievement tests
npm test achievements.test.ts

# Run with coverage
npm test achievements.test.ts -- --coverage

# Run specific test category
npm test achievements.test.ts -- --grep "Streak Achievements"

# Watch mode
npm test achievements.test.ts -- --watch
```

---

## ✅ Validation Checklist

### Animation Performance
- [ ] Stagger delays reduced to 20ms (from 50ms)
- [ ] Spring animations use GPU acceleration
- [ ] Confetti renders smoothly
- [ ] Honeycomb drag maintains 60fps
- [ ] Reduced motion preference respected
- [ ] No layout shifts during animations

### Accessibility
- [ ] Keyboard navigation works (arrow keys)
- [ ] Tab order is logical
- [ ] Focus indicators visible (2px outline)
- [ ] ARIA labels on all interactive elements
- [ ] Screen reader test passed (NVDA/JAWS)
- [ ] Color contrast verified (7:1 AAA)
- [ ] Touch targets 44px+ (WCAG AAA)
- [ ] All modals have focus trap

### Achievement Tests
- [ ] All 32 test cases pass
- [ ] Streak achievements unlock correctly
- [ ] Completion achievements validated
- [ ] Level progression accurate
- [ ] XP calculations correct
- [ ] Edge cases handled
- [ ] Rarity distribution balanced

---

## 📊 Performance Baseline

**Before Phase 3:**
- Animation stagger: 50ms/item
- FPS: ~58fps (variable)
- Spring config: stiffness 300, damping 25
- Touch target: 44px (minimum)

**After Phase 3B:**
- Animation stagger: 20ms/item ✅ (2.5x faster)
- FPS: 60fps (target) ✅
- Spring config: Optimized presets ✅
- Touch target: 44px+ ✅ (WCAG AAA)

---

## 🐛 Troubleshooting

### Animation jank (low FPS)

**Problem:** Animations feel choppy  
**Solution:**
1. Check Performance Monitor: `ANIMATION_TIMINGS.STAGGER_ITEM`
2. Profile with DevTools: Throttle GPU to simulate devices
3. Reduce confetti count: `150 → 50` particles
4. Use `will-change` sparingly

```tsx
// BAD: Too many animated elements
{Array(100).map((_, i) => <motion.div />)}

// GOOD: Memoize or virtualize
const items = useMemo(() => achievements.slice(0, 20), [achievements]);
```

### Keyboard navigation not working

**Problem:** Arrow keys don't move selection  
**Solution:**
1. Verify `onKeyDown` handler attached to container
2. Check `role="listbox"` or `role="menubar"` set
3. Ensure `tabIndex={0}` on container
4. Verify items have `role="option"`

```tsx
<div 
  role="listbox"
  tabIndex={0}          // Important!
  onKeyDown={handleKeyDown}
>
  {items.map((item, idx) => (
    <div key={idx} role="option" tabIndex={-1}>
      {item.name}
    </div>
  ))}
</div>
```

### Screen reader not reading ARIA labels

**Problem:** Labels don't announce  
**Solution:**
1. Verify `aria-label` or `aria-labelledby` set
2. Check for conflicting `role` attribute
3. Test in NVDA/JAWS (not browser dev tools)
4. Add `aria-live="polite"` for dynamic content

```tsx
// GOOD: Live region for announcements
<div aria-live="polite" aria-atomic="true">
  Achievement Unlocked: {achievement.name}!
</div>
```

### Tests failing

**Problem:** Achievement tests don't pass  
**Solution:**
1. Check test data matches gamification-utils.ts
2. Verify unlock conditions in test match app logic
3. Run specific test: `npm test -- --grep "Starter"`
4. Check console for error details

---

## 📚 Related Files

**New Utilities:**
- `src/lib/animation-optimizer.ts` - Animation configurations
- `src/lib/accessibility.ts` - Accessibility utilities  
- `src/__tests__/achievements.test.ts` - Test suite

**Components to Update:**
- `src/components/achievements/AchievementGrid.tsx`
- `src/components/achievements/AchievementGridHoneycomb.tsx`
- `src/components/achievements/AchievementUnlockToast.tsx`
- `src/components/achievements/AchievementDetailModal.tsx`

**Reference Docs:**
- `PHASE_3_ACHIEVEMENT_POLISH.md` - Full specification
- `PHASE_3_PROGRESS.md` - Implementation progress
- `src/lib/animation-optimizer.ts` - Inline documentation
- `src/lib/accessibility.ts` - WCAG standards reference

---

## 🚀 Quick Start

1. **Copy utilities** ✅ (Already done)
   ```bash
   src/lib/animation-optimizer.ts
   src/lib/accessibility.ts
   src/__tests__/achievements.test.ts
   ```

2. **Import in components**
   ```tsx
   import { useOptimizedAnimationProps } from '@/lib/animation-optimizer';
   import { useKeyboardNavigation } from '@/lib/accessibility';
   ```

3. **Update AchievementUnlockToast.tsx**
   ```bash
   # Replace old spring animation with preset
   # Enable reduced motion support
   ```

4. **Update AchievementGrid.tsx**
   ```bash
   # Add keyboard navigation hook
   # Add ARIA labels to items
   # Use staggered animation hook
   ```

5. **Run tests**
   ```bash
   npm test achievements.test.ts
   npm run build
   ```

---

## 📈 Success Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| Animation FPS | 60 fps | DevTools Performance tab |
| Tests Passing | 32/32 | `npm test achievements.test.ts` |
| WCAG AAA | 100% | axe DevTools audit |
| Bundle Size | <500kb | `npm run build` output |
| Lighthouse Score | >90 | `npm run preview` + Lighthouse |

---

*Updated: 2025-01-15*  
*Phase 3 Status: Implementation In Progress*
