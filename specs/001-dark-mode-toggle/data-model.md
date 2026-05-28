# Data Model: Dark Mode Toggle Feature

**Purpose**: Define entities, storage structures, and component state for theme management

**Date**: 2026-05-28

---

## Entity: ThemePreference

### Definition
Represents the user's selected theme preference and metadata about its application.

### Attributes

| Attribute | Type | Description | Required |
|-----------|------|-------------|----------|
| `preference` | `'light' \| 'dark'` | User's chosen theme | Yes |
| `appliedAt` | `timestamp` | When preference was last toggled | Yes |
| `source` | `'localStorage' \| 'default'` | Where preference originated | Yes |

### Storage Format: localStorage

**Key**: `theme-preference`
**Value**: String, either `'light'` or `'dark'`
**Scope**: Per browser/domain (standard localStorage behavior)
**Expiration**: None (persists indefinitely or until manually cleared)

**Example**:
```javascript
localStorage.setItem('theme-preference', 'dark')  // Save dark mode
localStorage.getItem('theme-preference')          // Returns: 'dark'
localStorage.removeItem('theme-preference')       // Clear preference
```

### Initialization Logic

**Priority**:
1. Check localStorage for existing preference
2. If not found, check browser's `prefers-color-scheme` media query (optional fallback)
3. Default to light mode if no preference exists

**Code Pattern**:
```typescript
function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('theme-preference')
    if (saved === 'dark' || saved === 'light') {
      return saved
    }
  } catch (e) {
    // localStorage unavailable (private browsing, etc.)
  }
  
  // Optional: Check system preference as fallback
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  return 'light'  // Default
}
```

---

## DOM Structure: Dark Mode Class

### Root Element Manipulation

**Element**: `<html>` tag (document root)
**Class Name**: `dark-mode`
**Applied When**: User selects dark mode
**Removed When**: User switches back to light mode

### CSS Class Application

```html
<!-- Light mode (default) -->
<html>
  <head>...</head>
  <body>
    <!-- All content inherits light mode styles -->
  </body>
</html>

<!-- Dark mode (when user toggles) -->
<html class="dark-mode">
  <head>...</head>
  <body>
    <!-- All content inherits dark mode styles -->
    <!-- CSS variables and .dark: utilities apply -->
  </body>
</html>
```

### CSS Cascade Pattern

```css
/* Define CSS variables at root level */
html {
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-border: #cccccc;
  background-color: var(--color-bg);
  color: var(--color-text);
}

html.dark-mode {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
  --color-border: #444444;
}

/* Components use these variables */
.card {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* Alternative: Tailwind .dark: utilities */
html.dark-mode .dark\:bg-gray-900 {
  background-color: #111111;
}
```

### Timing of Application

**Plugin Phase** (before components render):
```typescript
// plugins/theme.client.ts
export default defineNuxtPlugin(() => {
  if (process.server) return
  
  const saved = localStorage.getItem('theme-preference')
  if (saved === 'dark') {
    document.documentElement.classList.add('dark-mode')
  }
  // If saved is 'light' or null, no class is added (light is default)
})
```

**Component Lifecycle** (when user toggles):
```typescript
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
  }
  
  // Persist preference
  localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')
}
```

---

## Component State: ThemeToggle.vue

### Internal State

```typescript
interface ThemeToggleState {
  isDarkMode: boolean            // Is dark mode currently active?
  isLoading: boolean             // Is component initializing?
  hasLocalStorage: boolean       // Is localStorage available?
  ariaLabel: string              // Accessibility label
  ariaPressed: boolean           // ARIA state indicator
}
```

### Initial State Resolution

```typescript
const state = reactive({
  isDarkMode: false,
  isLoading: true,
  hasLocalStorage: true,
  ariaLabel: 'Toggle dark mode',
  ariaPressed: false
})

onMounted(() => {
  try {
    const saved = localStorage.getItem('theme-preference')
    state.isDarkMode = saved === 'dark'
    state.hasLocalStorage = true
  } catch (e) {
    state.hasLocalStorage = false
  }
  
  state.ariaPressed = state.isDarkMode
  state.isLoading = false
})
```

### State Transitions

**User Clicks Toggle**:
1. `isDarkMode` flips from `false` → `true` or vice versa
2. `isLoading` set to `true` (prevent duplicate clicks)
3. DOM class applied/removed on `<html>`
4. localStorage updated
5. `ariaPressed` updated to reflect new state
6. CSS animation plays (300-400ms)
7. `isLoading` set to `false`

**Sequence Diagram**:
```
User Click → isDarkMode flip → DOM class update → localStorage write
           → ariaPressed update → Animation → isLoading = false
```

### Reactive Updates

```vue
<script setup>
const isDarkMode = ref(false)
const isLoading = ref(true)

// Computed property for accessibility
const ariaLabel = computed(() => 
  `Switch to ${isDarkMode.value ? 'light' : 'dark'} mode`
)

function toggleTheme() {
  if (isLoading.value) return  // Prevent duplicate clicks
  
  isLoading.value = true
  isDarkMode.value = !isDarkMode.value
  updateTheme()
  
  // Reset loading flag after animation
  setTimeout(() => {
    isLoading.value = false
  }, 400)  // Match animation duration
}

function updateTheme() {
  const html = document.documentElement
  if (isDarkMode.value) {
    html.classList.add('dark-mode')
  } else {
    html.classList.remove('dark-mode')
  }
  
  try {
    localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')
  } catch (e) {
    console.warn('localStorage unavailable')
  }
}
</script>
```

---

## Global CSS Variables

### Light Mode (Default)

```css
html {
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  
  /* Text */
  --text-primary: #000000;
  --text-secondary: #666666;
  
  /* Borders */
  --border-primary: #cccccc;
  --border-light: #e0e0e0;
  
  /* Accents */
  --accent-primary: #007bff;
  --accent-hover: #0056b3;
}
```

### Dark Mode

```css
html.dark-mode {
  /* Backgrounds */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  
  /* Borders */
  --border-primary: #444444;
  --border-light: #333333;
  
  /* Accents */
  --accent-primary: #4a9eff;
  --accent-hover: #6ab0ff;
}
```

### Usage in Components

```vue
<style scoped>
.card {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.card-title {
  color: var(--text-primary);
}

.card-subtitle {
  color: var(--text-secondary);
}

.button {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  border: 1px solid var(--border-primary);
}

.button:hover {
  background-color: var(--accent-hover);
}
</style>
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  App Initialization                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  plugins/theme.client.ts runs (before hydration)               │
│  - Check localStorage for saved preference                     │
│  - Apply 'dark-mode' class if saved === 'dark'                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Components Render                                              │
│  - Inherit theme from <html class="dark-mode"> or default      │
│  - CSS variables / Tailwind utilities apply automatically      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  ThemeToggle Component Mounts                                   │
│  - Initialize state from current DOM class or localStorage     │
│  - Ready for user interaction                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Clicks Toggle Button                                      │
│  - isDarkMode state flips                                       │
│  - DOM class added/removed on <html>                           │
│  - localStorage preference saved                               │
│  - CSS animation plays                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  All Components (Current + Lazy-loaded + Nested)               │
│  - Inherit new theme via CSS cascade                           │
│  - No re-render needed if using CSS variables/utilities        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Returns to App Later                                      │
│  - plugins/theme.client.ts runs again                          │
│  - localStorage preference restored                            │
│  - Theme applied before components render                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Validation & Error Handling

### localStorage Validation

```typescript
function saveThemePreference(preference: 'light' | 'dark'): boolean {
  try {
    // Validate input
    if (preference !== 'light' && preference !== 'dark') {
      console.warn(`Invalid theme preference: ${preference}. Defaulting to light.`)
      preference = 'light'
    }
    
    // Attempt save
    localStorage.setItem('theme-preference', preference)
    return true
  } catch (e) {
    // localStorage quota exceeded, unavailable, or blocked
    console.warn('Failed to save theme preference:', e)
    return false
  }
}

function loadThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('theme-preference')
    
    // Validate saved value
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    
    // Invalid or missing, use default
    return 'light'
  } catch (e) {
    console.warn('Failed to load theme preference:', e)
    return 'light'  // Safe default
  }
}
```

### Edge Cases Handled

1. **Corrupted localStorage entry**: Treated as invalid, defaults to light
2. **localStorage unavailable**: Theme still toggles in UI, doesn't persist
3. **Rapid repeated clicks**: Debounced by `isLoading` flag
4. **Cross-tab storage events** (optional): Can listen to `storage` event for multi-tab sync

---

## Summary

**Data Model Entities**: ThemePreference (user choice + metadata)

**Storage**: localStorage with key `theme-preference`, values `'light'` or `'dark'`

**DOM Interface**: `class="dark-mode"` on `<html>` element, applies to entire page via CSS cascade

**Component State**: isDarkMode, isLoading, hasLocalStorage, ariaLabel/ariaPressed

**CSS Variables**: Root-level variables for colors, backgrounds, borders, accents

**Initialization**: Plugin before hydration → early theme application → no flash

**Error Handling**: Try-catch wrappers, graceful degradation, safe defaults
