# Theme Events Contract

**Purpose**: Define the event and data flow contracts for theme switching

**Date**: 2026-05-28

---

## localStorage Event Contract

### Event Schema

```typescript
interface StorageEvent {
  key: string                          // 'theme-preference'
  newValue: 'light' | 'dark' | null    // New preference value
  oldValue: 'light' | 'dark' | null    // Previous value or null
  storageArea: Storage                 // localStorage or sessionStorage
  url: string                          // URL of document that changed storage
}
```

### Emitted By

- ThemeToggle component (user interaction)
- Theme plugin (initialization)
- Any code that calls `localStorage.setItem('theme-preference', value)`

### Consumed By

- Cross-tab sync listeners (optional: listen to `storage` event to sync theme across tabs)
- Analytics/logging systems
- Browser extensions (if any)

### Example Event

```javascript
// When user toggles from light to dark:
{
  key: 'theme-preference',
  newValue: 'dark',
  oldValue: 'light',
  storageArea: localStorage,
  url: 'http://localhost:3000/'
}
```

---

## DOM Class Application Contract

### Root Element Class Manipulation

**Element**: `document.documentElement` (the `<html>` tag)
**Class Name**: `dark-mode`

### Class Application Rules

| Scenario | Class State | Details |
|----------|------------|---------|
| User selects dark mode | `html.classList.add('dark-mode')` | 'dark-mode' class present |
| User selects light mode | `html.classList.remove('dark-mode')` | Class removed if present |
| App initialization (no saved preference) | Class removed | Default is light mode |
| App initialization (saved preference is 'dark') | `html.classList.add('dark-mode')` | Preference restored |

### CSS Selector Contracts

#### Light Mode (Default)

```css
/* Base styles when 'dark-mode' class is NOT present */
body {
  background-color: #ffffff;
  color: #000000;
}
```

#### Dark Mode

```css
/* Styles that apply when 'dark-mode' class IS present */
html.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

html.dark-mode body {
  background-color: #1a1a1a;
  color: #ffffff;
}
```

### Cascade Effect

The 'dark-mode' class on `<html>` cascades to all descendant elements:

```html
<html class="dark-mode">
  <body>
    <!-- All children inherit dark mode styles -->
    <div class="card">
      <!-- card inherits dark mode styles -->
    </div>
  </body>
</html>
```

CSS rules targeting `.dark-mode` or using CSS variables apply to all nested content.

---

## Component Event Flow

### User Click Event Sequence

```
1. User clicks ThemeToggle button
   ↓
2. @click handler triggered → toggleTheme()
   ↓
3. isDarkMode state flips (false → true or vice versa)
   ↓
4. updateTheme() called
   ├─ Apply/remove 'dark-mode' class on <html>
   ├─ Write preference to localStorage
   └─ Emit visual feedback (CSS animation plays)
   ↓
5. isLoading flag set to prevent rapid re-clicks
   ↓
6. After animation duration (400ms):
   └─ isLoading flag reset to allow next click
```

### Pseudo-Code Flow

```typescript
function toggleTheme() {
  // Prevent double-clicks during animation
  if (isLoading.value) return
  
  isLoading.value = true
  isDarkMode.value = !isDarkMode.value
  
  // Apply DOM changes
  updateTheme()
  
  // Allow next interaction after animation
  setTimeout(() => {
    isLoading.value = false
  }, 400)  // Match CSS animation duration
}

function updateTheme() {
  const html = document.documentElement
  
  // Apply or remove class
  if (isDarkMode.value) {
    html.classList.add('dark-mode')
  } else {
    html.classList.remove('dark-mode')
  }
  
  // Persist preference (with error handling)
  try {
    const pref = isDarkMode.value ? 'dark' : 'light'
    localStorage.setItem('theme-preference', pref)
  } catch (e) {
    console.warn('Failed to save theme preference')
  }
}
```

---

## Plugin Initialization Contract

### Plugin Lifecycle

**Plugin File**: `plugins/theme.client.ts`

**Execution Timing**: Before Nuxt app hydration (early in initialization)

**Execution Environment**: Client-side only (skipped on server)

### Initialization Sequence

```
1. App starts
   ↓
2. Nuxt executes plugins (in order)
   ↓
3. theme.client.ts plugin runs
   ├─ Check if server-side → skip if true
   ├─ Try to read localStorage['theme-preference']
   ├─ If value is 'dark' → add 'dark-mode' class to <html>
   ├─ If value is 'light' or null → ensure 'dark-mode' class is removed
   └─ Catch errors silently (localStorage unavailable)
   ↓
4. Components hydrate with theme already applied
   ↓
5. Page renders with correct theme (no flash)
```

### Error Handling

If localStorage is unavailable:
- Silent catch (console.warn only)
- Default to light mode (no class added)
- App continues normally
- User can still toggle, but preference won't persist

### Code Contract

```typescript
export default defineNuxtPlugin(() => {
  if (process.server) return  // Skip server-side execution
  
  try {
    const savedPreference = localStorage.getItem('theme-preference')
    if (savedPreference === 'dark') {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  } catch (e) {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
    // Silently fail - theme won't persist, but UI still works
    console.warn('Theme initialization error:', e)
  }
})
```

---

## Tailwind CSS Integration Contract

### Integration Point

When Tailwind CSS is configured with `darkMode: 'class'`, it maps `.dark:` utilities to the presence of a dark mode class on a parent element.

**By default**, Tailwind looks for the `.dark` class.
**In this project**, we use the `.dark-mode` class on `<html>`.

### Options for Integration

#### Option A: Configure Tailwind (Preferred)

In `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  tailwindcss: {
    config: {
      darkMode: 'class:dark-mode'  // Tell Tailwind to use 'dark-mode'
    }
  }
})
```

Then `.dark:` utilities work automatically:

```vue
<div class="bg-white dark:bg-slate-900">
  Automatically switches when 'dark-mode' class is on <html>
</div>
```

#### Option B: Manual CSS Override (If Tailwind is read-only)

In global CSS, manually apply Tailwind dark styles:

```css
html.dark-mode .dark\:text-white {
  color: white;
}

html.dark-mode .dark\:bg-slate-900 {
  background-color: #0f172a;
}
```

### Contract Guarantees

- ✅ `.dark:` utilities in components will apply when 'dark-mode' class is present
- ✅ Light mode styles apply when 'dark-mode' class is absent
- ✅ No conflicts between custom CSS variables and Tailwind utilities
- ✅ CSS cascade ensures nested elements inherit theme

---

## Data Validation Contract

### localStorage Value Validation

```typescript
function isValidThemePreference(value: unknown): value is 'light' | 'dark' {
  return value === 'light' || value === 'dark'
}

function loadThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('theme-preference')
    if (isValidThemePreference(saved)) {
      return saved
    }
    return 'light'  // Default
  } catch (e) {
    return 'light'  // Safe default
  }
}
```

### Valid Values

| Value | Meaning | DOM Class |
|-------|---------|-----------|
| `'dark'` | User selected dark mode | `html.classList.add('dark-mode')` |
| `'light'` | User selected light mode | `html.classList.remove('dark-mode')` |
| `null` | No saved preference (first visit) | Default light mode |

### Invalid Values

- `undefined`, `'Dark'`, `'DARK'`, `'0'`, `'1'`, etc. are rejected
- Treated as no saved preference (defaults to light)

---

## Error Handling Contract

### Resilience Guarantees

1. **localStorage Unavailable** (private browsing, quota exceeded)
   - Theme still toggles in UI (visual feedback works)
   - Preference does not persist across sessions
   - No error thrown to user (silent failure with console.warn)

2. **Corrupted localStorage Entry**
   - Treated as invalid
   - Defaults to light mode
   - User can fix by toggling again

3. **Rapid Clicks (Button Mashing)**
   - Debounced by `isLoading` flag
   - Final state matches last click
   - No duplicate events or animation glitches

4. **SSR Hydration Mismatch**
   - Plugin skips server-side execution
   - No conflict between server HTML and client-side hydration
   - Theme applied immediately post-hydration

### Error Logging

```typescript
try {
  localStorage.setItem('theme-preference', preference)
} catch (e) {
  // Log but don't throw
  console.warn('Failed to save theme preference:', e)
  // UI continues to work, preference just won't persist
}
```

---

## Cross-Tab Synchronization (Optional)

### Contract for Multi-Tab Support

If implementing cross-tab sync, listen to the `storage` event:

```typescript
window.addEventListener('storage', (event) => {
  if (event.key === 'theme-preference' && event.newValue) {
    // Another tab changed the theme
    const preference = event.newValue as 'light' | 'dark'
    
    // Update current tab's DOM and component state
    if (preference === 'dark') {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
    
    // Update component state to reflect change
    isDarkMode.value = preference === 'dark'
  }
})
```

**Note**: This is optional and not required for v1.0. Included here for future enhancement.

---

## Contract Summary

| Contract | Details |
|----------|---------|
| **localStorage** | Key: `'theme-preference'`, Values: `'light'` or `'dark'` |
| **DOM Class** | Applied to `<html>`, Class name: `'dark-mode'` |
| **Event Flow** | Click → State flip → DOM update → localStorage write → Animation |
| **Plugin** | Runs before hydration, client-side only |
| **Tailwind** | Integrated via `darkMode: 'class:dark-mode'` or manual CSS |
| **Validation** | Only `'light'` and `'dark'` are valid; others default to `'light'` |
| **Error Handling** | Silent failures with console warnings; theme still functions |
| **Resilience** | Works even if localStorage unavailable; graceful degradation |
