# Research: Dark Mode Toggle Implementation

**Purpose**: Resolve technical clarifications and best practices for Vue 3 dark mode patterns

**Date**: 2026-05-28

---

## Q1: SSR + localStorage Interaction

### Question
How does localStorage interact with Nuxt.js Server-Side Rendering (SSR)? Can we safely access localStorage during component initialization?

### Research
- localStorage is a browser-only API; it is not available during server-side rendering
- Accessing localStorage during SSR causes runtime errors: "localStorage is not defined"
- Nuxt.js plugins can be restricted to client-only execution using `defineNuxtPlugin` with proper guard

### Decision
**Use a client-only plugin pattern**:

1. Create `plugins/theme.client.ts` (the `.client` suffix automatically marks this for client-only execution)
2. Check `process.server` guard before accessing localStorage
3. Run plugin before app hydration to initialize theme before any components render

```typescript
export default defineNuxtPlugin(() => {
  if (process.server) return  // Skip server-side execution
  
  const savedPreference = localStorage.getItem('theme-preference')
  if (savedPreference === 'dark') {
    document.documentElement.classList.add('dark-mode')
  }
})
```

### Rationale
- Nuxt.js provides client-side plugin support specifically for this use case
- `.client` suffix is the idiomatic way to indicate client-only code in Nuxt
- Plugin runs during app initialization, before components mount, enabling early theme application

---

## Q2: Tailwind Dark Mode vs Custom 'dark-mode' Class

### Question
Tailwind CSS has built-in dark mode support (via `.dark:` utilities). Does our custom 'dark-mode' class conflict with Tailwind's approach?

### Research
- Tailwind supports multiple dark mode strategies: class-based (`.dark` selector), media-based (`prefers-color-scheme`), and custom variants
- Tailwind's class-based approach looks for `.dark` class on the `<html>` or parent container
- Our Constitution prescribes root-level DOM manipulation for theme control (Principle II)
- A custom 'dark-mode' class is compatible as long as we configure Tailwind or duplicate styles

### Decision
**Use 'dark-mode' class and configure Tailwind accordingly**:

1. Apply 'dark-mode' class to `<html>` (per Constitution)
2. Option A: Configure Tailwind's dark mode to use 'dark-mode' instead of 'dark' in `nuxt.config.ts`:
   ```typescript
   export default defineNuxtConfig({
     tailwindcss: {
       config: {
         darkMode: 'class:dark-mode'  // Tell Tailwind to use this class
       }
     }
   })
   ```
3. Option B: Manually override Tailwind dark mode selectors in global CSS for `.dark:` utilities

### Rationale
- Aligns with Constitution Principle II (root-level DOM manipulation prescribed)
- Allows Tailwind's semantic `.dark:` utilities to work automatically
- Single source of truth: class is applied to `<html>`, components use `.dark:` utilities
- Avoids duplication and maintainability issues

---

## Q3: localStorage Fallback for Private Browsing

### Question
What happens when a user browses in private/incognito mode where localStorage is disabled or throws errors?

### Research
- Private browsing mode varies by browser: some throw errors, others silently fail, others allow temporary localStorage
- A robust pattern is to wrap localStorage access in try-catch blocks
- Graceful fallback: update UI immediately but don't persist if localStorage fails

### Decision
**Wrap localStorage access in try-catch and provide graceful degradation**:

```typescript
export default defineNuxtPlugin(() => {
  if (process.server) return
  
  try {
    const saved = localStorage.getItem('theme-preference')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark-mode')
    }
  } catch (error) {
    // localStorage not available (private browsing, etc.)
    // Don't throw; UI still works, just won't persist
    console.warn('Theme persistence unavailable:', error)
  }
})
```

Similarly in component's toggle handler:

```typescript
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  updateTheme()
}

function updateTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
  }
  
  // Attempt to persist, but don't fail if unavailable
  try {
    localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')
  } catch (error) {
    console.warn('Failed to save theme preference:', error)
  }
}
```

### Rationale
- Provides best-effort persistence without breaking functionality
- Per specification, graceful degradation in private browsing is acceptable
- User experience remains intact even if persistence fails

---

## Q4: Animation & prefers-reduced-motion

### Question
Should we respect users' accessibility preferences to reduce animations?

### Research
- `prefers-reduced-motion: reduce` is a CSS media query that indicates user preference for reduced animations
- Many users with vestibular disorders, anxiety, or performance concerns enable this setting
- WCAG 2.1 Level AA recommends respecting this preference
- It aligns with Constitution Principle V (Accessibility & User Experience)

### Decision
**Implement conditional animations based on prefers-reduced-motion**:

```css
/* Default: smooth animation for users without reduced motion preference */
.theme-toggle {
  transition: all 0.35s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.theme-toggle-knob {
  transition: transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Respect reduced motion preference: instant toggle */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-toggle-knob {
    transition: none;
  }
}
```

### Rationale
- Meets WCAG 2.1 AA accessibility standards
- Improves experience for users with motion sensitivity
- Still provides smooth visual feedback for most users
- Zero performance cost (CSS-only implementation)

---

## Q5: Theme Application Timing & Flash Prevention

### Question
How do we prevent a "flash" of light mode when a user with saved dark mode preference reloads the page?

### Research
- If theme initialization happens in a component lifecycle hook (e.g., `mounted()`), the page renders with default light mode first, then switches to dark mode
- This creates a visible flash that degrades UX
- Solution: Initialize theme in a plugin that runs before component hydration

### Decision
**Use theme.client.ts plugin to initialize theme before any components render**:

```typescript
// plugins/theme.client.ts
export default defineNuxtPlugin(() => {
  if (process.server) return
  
  // This runs during app initialization, before components mount
  const savedPreference = localStorage.getItem('theme-preference')
  if (savedPreference === 'dark') {
    document.documentElement.classList.add('dark-mode')
  }
  // CSS will already reflect dark mode when page renders
})
```

This approach:
1. Runs before Nuxt hydration
2. No component lifecycle delays
3. Theme class is applied to `<html>` before any rendering

### Rationale
- Plugin lifecycle in Nuxt.js is specifically designed for this early initialization pattern
- Prevents flash by applying styles before DOM paints
- Creates seamless user experience for returning users

---

## Q6: Keyboard Accessibility & Focus Management

### Question
How do we ensure the toggle button is accessible to keyboard-only users?

### Research
- Keyboard accessibility requires:
  1. Focusable elements (using semantic `<button>` or role="button" + tabindex="0")
  2. Operable with Enter and Space keys (native `<button>` handles this)
  3. Visible focus indicator (browser default or custom)
  4. Proper ARIA labels for screen readers
- Semantic `<button>` element handles all keyboard behaviors natively

### Decision
**Use semantic `<button>` element with ARIA labels**:

```vue
<template>
  <button
    :aria-label="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`"
    :aria-pressed="isDarkMode"
    class="theme-toggle"
    @click="toggleTheme"
  >
    <span v-if="isDarkMode" class="theme-toggle-icon">🌙</span>
    <span v-else class="theme-toggle-icon">☀️</span>
  </button>
</template>
```

### Rationale
- `<button>` element is natively keyboard-accessible (no custom JavaScript needed)
- Space and Enter keys work automatically
- aria-label provides context for screen readers
- aria-pressed indicates current toggle state for assistive technology
- Meets WCAG 2.1 AA accessibility standards

---

## Summary: Best Practices Confirmed

1. ✅ **SSR + localStorage**: Use client-only plugin with process.server check
2. ✅ **Tailwind integration**: Configure Tailwind or manually map '.dark:' utilities
3. ✅ **Private browsing**: Try-catch wrapper with graceful degradation
4. ✅ **Accessibility animations**: Respect prefers-reduced-motion via CSS media query
5. ✅ **Flash prevention**: Initialize in plugin before component hydration
6. ✅ **Keyboard access**: Use semantic `<button>` with ARIA labels

**All questions resolved**. Ready for Phase 1 design and Phase 2 implementation.
