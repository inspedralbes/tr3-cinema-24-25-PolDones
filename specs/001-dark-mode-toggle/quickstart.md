# Quickstart: Implementing Dark Mode Toggle

**Purpose**: Step-by-step guide for implementing the Dark Mode Toggle component and integrating it into the cinema booking app

**Date**: 2026-05-28

**Time Estimate**: 2-3 hours for implementation + testing

---

## Prerequisites

- [ ] Nuxt.js 3 project running locally
- [ ] Tailwind CSS configured in the project
- [ ] Vue 3 Composition API knowledge
- [ ] Access to project files in `webapp/` directory

---

## Step 1: Create the Theme Toggle Component

**File**: `webapp/components/ThemeToggle.vue`

### Implementation

```vue
<template>
  <button
    :aria-label="ariaLabel"
    :aria-pressed="isDarkMode"
    class="fixed bottom-4 left-4 z-1000 h-12 w-24 rounded-full bg-slate-200 transition-colors duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    :class="isDarkMode ? 'bg-slate-700' : 'bg-slate-200'"
    @click="toggleTheme"
  >
    <!-- Toggle knob -->
    <span
      class="absolute top-1 h-10 w-10 rounded-full bg-white transition-transform duration-300 shadow-md"
      :class="isDarkMode ? 'translate-x-12' : 'translate-x-1'"
    ></span>
    
    <!-- Icons -->
    <span class="absolute inset-0 flex items-center justify-start pl-2 pointer-events-none">
      <span v-if="!isDarkMode" class="text-lg">☀️</span>
    </span>
    <span class="absolute inset-0 flex items-center justify-end pr-2 pointer-events-none">
      <span v-if="isDarkMode" class="text-lg">🌙</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isDarkMode = ref(false)
const isLoading = ref(true)

const ariaLabel = computed(() =>
  `Switch to ${isDarkMode.value ? 'light' : 'dark'} mode`
)

onMounted(() => {
  // Initialize theme from localStorage or DOM
  const html = document.documentElement
  isDarkMode.value = html.classList.contains('dark-mode')
  isLoading.value = false
})

function toggleTheme() {
  if (isLoading.value) return
  
  isLoading.value = true
  isDarkMode.value = !isDarkMode.value
  updateTheme()
  
  // Prevent rapid re-clicks during animation
  setTimeout(() => {
    isLoading.value = false
  }, 400)
}

function updateTheme() {
  const html = document.documentElement
  
  if (isDarkMode.value) {
    html.classList.add('dark-mode')
  } else {
    html.classList.remove('dark-mode')
  }
  
  // Persist preference to localStorage
  try {
    localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')
  } catch (e) {
    console.warn('Failed to save theme preference:', e)
  }
}
</script>

<style scoped>
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  button,
  span {
    transition: none !important;
  }
}
</style>
```

---

## Step 2: Create the Theme Initialization Plugin

**File**: `webapp/plugins/theme.client.ts`

### Purpose
Applies the saved theme before any components render, preventing a light/dark flash when users with dark mode preference return to the site.

### Implementation

```typescript
export default defineNuxtPlugin(() => {
  // Skip on server-side rendering
  if (process.server) return
  
  try {
    // Check if user has a saved theme preference
    const savedPreference = localStorage.getItem('theme-preference')
    
    // Apply dark mode class if preference is 'dark'
    if (savedPreference === 'dark') {
      document.documentElement.classList.add('dark-mode')
    } else {
      // Ensure light mode is default (remove any existing class)
      document.documentElement.classList.remove('dark-mode')
    }
  } catch (e) {
    // localStorage may be unavailable (private browsing, etc.)
    console.warn('Theme initialization error:', e)
    // Continue gracefully - theme won't persist, but UI still works
  }
})
```

---

## Step 3: Integrate Component into Main Layout

**File**: `webapp/layouts/default.vue`

### Current Structure (Example)
```vue
<template>
  <div>
    <!-- Navigation, content, etc. -->
    <NuxtPage />
  </div>
</template>
```

### Updated Structure

```vue
<template>
  <div>
    <!-- Dark Mode Toggle (visible on all pages) -->
    <ThemeToggle />
    
    <!-- Existing layout content -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Component is auto-imported by Nuxt if using <auto-imports>
// If auto-imports not configured, add:
// import ThemeToggle from '~/components/ThemeToggle.vue'
</script>
```

**Note**: If your layout is structured differently (e.g., with a header/footer), place `<ThemeToggle />` in the appropriate container. The component uses `position: fixed`, so it doesn't affect normal flow.

---

## Step 4: Add Global Dark Mode Styles

**File**: `webapp/assets/css/main.css`

### Dark Mode CSS Variables

Add this to your existing CSS file or a new file you import:

```css
/* Light Mode (Default) */
html {
  /* Backgrounds */
  --color-bg: #ffffff;
  --color-bg-secondary: #f5f5f5;
  
  /* Text */
  --color-text: #000000;
  --color-text-secondary: #666666;
  
  /* Borders */
  --color-border: #cccccc;
  --color-border-light: #e0e0e0;
  
  /* Accents */
  --color-accent: #007bff;
  --color-accent-hover: #0056b3;
}

/* Dark Mode */
html.dark-mode {
  /* Backgrounds */
  --color-bg: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  
  /* Text */
  --color-text: #ffffff;
  --color-text-secondary: #b0b0b0;
  
  /* Borders */
  --color-border: #444444;
  --color-border-light: #333333;
  
  /* Accents */
  --color-accent: #4a9eff;
  --color-accent-hover: #6ab0ff;
}

/* Apply dark mode to body and main containers */
html.dark-mode {
  background-color: var(--color-bg);
  color: var(--color-text);
}

html.dark-mode body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

### Using CSS Variables in Components

Update your component styles to use these variables:

```vue
<style scoped>
.card {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.card-title {
  color: var(--color-text);
  font-weight: bold;
}

.card-subtitle {
  color: var(--color-text-secondary);
}

.button {
  background-color: var(--color-accent);
  color: var(--color-bg);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: var(--color-accent-hover);
}
</style>
```

### Tailwind CSS Integration (Optional)

If using Tailwind's `.dark:` utilities, ensure your `nuxt.config.ts` enables dark mode:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    config: {
      darkMode: 'class'  // Use class-based dark mode
    }
  }
})
```

Then in your Tailwind markup:

```vue
<div class="bg-white dark:bg-slate-900 text-black dark:text-white">
  Content that switches between light and dark modes
</div>
```

---

## Step 5: Test the Implementation

### 5.1 Manual Testing - Basic Functionality

- [ ] Start dev server: `npm run dev`
- [ ] Open app in browser at `http://localhost:3000`
- [ ] Verify toggle button appears at bottom-left of screen
- [ ] Click toggle → verify theme switches instantly
- [ ] Inspect `<html>` tag → verify `class="dark-mode"` is applied/removed
- [ ] Check console → no errors or warnings

### 5.2 Manual Testing - Persistence

- [ ] Toggle to dark mode
- [ ] Refresh page (`F5` or `Cmd+R`)
- [ ] Verify dark mode is automatically restored (no flash)
- [ ] Open DevTools → Application/Storage → localStorage
- [ ] Verify `theme-preference = 'dark'` is saved
- [ ] Toggle back to light mode
- [ ] Verify localStorage updates to `theme-preference = 'light'`

### 5.3 Manual Testing - Multi-Page Navigation

- [ ] Navigate to different pages (home → events → admin)
- [ ] Toggle theme on one page
- [ ] Navigate to another page → verify theme persists
- [ ] No flickering or reset should occur

### 5.4 Keyboard Accessibility Testing

- [ ] Press `Tab` to focus the toggle button
- [ ] Verify button has visible focus ring (blue outline)
- [ ] Press `Space` or `Enter` → button should toggle theme
- [ ] Open DevTools → Accessibility tab
- [ ] Verify `aria-label` and `aria-pressed` attributes are present and updated

### 5.5 Mobile Testing

- [ ] Test on actual mobile device or Chrome DevTools mobile emulation
- [ ] Verify toggle button is easily tappable (at least 44×44px)
- [ ] Verify layout doesn't break on small screens (< 320px width)
- [ ] Test toggling via touch

### 5.6 Accessibility Testing - Motion Preferences

- [ ] Enable "Reduce motion" in OS settings (Windows: Settings > Ease of Access > Display; macOS: System Preferences > Accessibility > Display)
- [ ] Refresh app
- [ ] Toggle button should snap instantly (no animation)
- [ ] Disable "Reduce motion" → toggle should show smooth animation again

### 5.7 Private Browsing Mode

- [ ] Open app in private/incognito window
- [ ] Toggle theme → UI should respond normally
- [ ] Refresh page → theme resets to light mode (localStorage not available)
- [ ] Verify no console errors

---

## Step 6: Browser & Compatibility Verification

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ Supported | localStorage, CSS transitions, ARIA all supported |
| Firefox | 88+ | ✅ Supported | Full support for all features |
| Safari | 14+ | ✅ Supported | Full support for all features |
| Edge | 90+ | ✅ Supported | Chromium-based, same as Chrome |
| Safari Mobile | 14+ | ✅ Supported | Touch-friendly, responsive works |
| Chrome Mobile | 90+ | ✅ Supported | Touch-friendly, responsive works |

---

## Step 7: Performance Validation

Run these checks to ensure the feature meets performance goals:

### Goal: Toggle visible within 500ms

```javascript
// DevTools Console
const startTime = performance.now()
// Toggle button should appear within 500ms
const endTime = performance.now()
console.log(`Time to visible: ${endTime - startTime}ms`)  // Should be < 500ms
```

### Goal: Animation completes in 300-400ms

```javascript
// DevTools Console
const toggle = document.querySelector('button')
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`Animation: ${entry.duration}ms`)
  })
})
observer.observe({ entryTypes: ['measure'] })
// Toggle theme and check timing
```

### No console errors or warnings

```javascript
// DevTools Console → Messages tab
// Should only see messages you explicitly logged (via console.warn/log)
// No errors related to theme switching or localStorage
```

---

## Step 8: Code Review Checklist

- [ ] Component file exists: `webapp/components/ThemeToggle.vue`
- [ ] Plugin file exists: `webapp/plugins/theme.client.ts`
- [ ] Component integrated into `layouts/default.vue`
- [ ] CSS variables defined in `assets/css/main.css`
- [ ] All Constitution principles are met:
  - [ ] I. Component-driven (single, self-contained)
  - [ ] II. Scoped styling + root-level theme management
  - [ ] IV. Mobile-first (44×44px tap target, responsive)
  - [ ] V. Accessibility (ARIA, semantic HTML, keyboard nav)
- [ ] No breaking changes to existing components
- [ ] localStorage access wrapped in try-catch
- [ ] Animation respects `prefers-reduced-motion`
- [ ] No console errors or warnings
- [ ] All tests pass (if test suite exists)

---

## Troubleshooting

### Issue: Theme flashes on page load

**Cause**: Plugin not running before hydration

**Solution**:
- Ensure plugin file is named `theme.client.ts` (`.client` suffix)
- Verify `plugins/` directory is in `webapp/` root
- Check that `process.server` check is in place
- Restart dev server

### Issue: Toggle button not clickable

**Cause**: Z-index too low or positioned off-screen

**Solution**:
- Check CSS: `z-index: 1000` should be high enough
- Verify `position: fixed`, `bottom: 1rem`, `left: 1rem` are set
- Use browser DevTools to inspect element positioning

### Issue: localStorage throws error

**Cause**: Private browsing mode or quota exceeded

**Solution**:
- Verify try-catch is wrapping localStorage calls
- Theme should still toggle in UI even if localStorage fails
- This is expected behavior in private mode

### Issue: Keyboard focus not visible

**Cause**: CSS focus styles not defined

**Solution**:
- Add `focus:ring-2 focus:ring-blue-500` or similar to button class
- Test with Tab key focus
- Verify ARIA attributes are present: `aria-label` and `aria-pressed`

### Issue: Tailwind `.dark:` utilities not working

**Cause**: Tailwind dark mode not configured or using wrong selector

**Solution**:
- Check `nuxt.config.ts` for `darkMode: 'class'`
- Verify class name is `dark-mode` (not `dark`)
- If using `dark`, configure Tailwind to use that class name
- Run `npm run build` to regenerate Tailwind styles

---

## Deployment Checklist

- [ ] All files committed to version control
- [ ] Feature branch merged to main
- [ ] No console errors in production build
- [ ] Tested on multiple devices (desktop, tablet, mobile)
- [ ] Tested in multiple browsers
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance benchmarks met (< 500ms visible, 300-400ms animation)
- [ ] localStorage preference persists across sessions
- [ ] No regressions in existing features

---

## Summary

You now have a fully functional Dark Mode Toggle feature:

✅ Component: `webapp/components/ThemeToggle.vue`
✅ Plugin: `webapp/plugins/theme.client.ts`
✅ Integration: Added to `layouts/default.vue`
✅ Styles: CSS variables in `assets/css/main.css`

**Next Phase**: Run `/speckit.tasks` to generate implementation tasks for any additional features or testing requirements.
