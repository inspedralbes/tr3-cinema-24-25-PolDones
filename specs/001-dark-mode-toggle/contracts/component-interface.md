# Component Interface Contract

**Purpose**: Define the ThemeToggle component's public interface, behavior, and integration requirements

**Date**: 2026-05-28

---

## Component: ThemeToggle

### Metadata

- **File**: `webapp/components/ThemeToggle.vue`
- **Type**: Single-file Vue component (SFC)
- **API Style**: Composition API (recommended) or Options API
- **Framework**: Vue 3 + TypeScript
- **Styling**: Scoped CSS with Tailwind utility classes

---

## Public Interface

### Props

**None**. ThemeToggle is self-contained and does not accept props.

The component manages its own state and persists to localStorage. It does not need configuration from parent components.

### Emits

**None**. ThemeToggle does not emit custom events.

Theme changes are communicated via:
1. DOM class manipulation (`<html class="dark-mode">`)
2. localStorage updates (`localStorage.setItem('theme-preference', value)`)

Parent components can listen to these signals if needed, but they are optional.

### Slots

**None**. ThemeToggle does not expose slots.

The component is fully self-contained with built-in icons/labels.

---

## Rendering Contract

### Display Behavior

| Aspect | Specification |
|--------|---------------|
| **Visibility** | Always visible; fixed positioning |
| **Position** | Bottom-left corner of viewport |
| **Offset** | 16px from left edge, 16px from bottom edge |
| **Z-index** | 1000 (ensures visibility above most content) |
| **Size** | 48px height × 96px width (iPhone toggle proportions) |
| **Shape** | Rounded pill (border-radius: 9999px or 50%) |
| **Tap Target** | Minimum 44×44px, actual size 48×96px ✅ Accessible |

### Visual States

#### Light Mode (Default)

```
╭─────────────────────────╮
│ ☀️     ●                │
└─────────────────────────┘
 Light gray background
 White knob on left
 Sun icon visible
 Color: #cbd5e1 (slate-200)
```

#### Dark Mode

```
╭─────────────────────────╮
│                   ● 🌙   │
└─────────────────────────┘
 Dark gray background
 White knob on right
 Moon icon visible
 Color: #334155 (slate-700)
```

#### Hover State

- Shadow increases: `shadow-lg` → `shadow-xl`
- Subtle interactive feedback (no color change)

#### Focus State

- Blue ring appears: `focus:ring-2 focus:ring-blue-500`
- Tab key navigation highlights button
- Keyboard-accessible for screen reader users

---

## Animation Contract

### Toggle Transition

**Trigger**: User clicks button

**Animation Details**:

| Property | Duration | Easing | Effect |
|----------|----------|--------|--------|
| Background color | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Smooth fade between light/dark backgrounds |
| Knob position (transform) | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Smooth slide from left to right |
| Shadow | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Subtle depth feedback |

**Total Duration**: ~300-400ms (matches CSS `transition-duration-300`)

**Frame Rate**: 60fps (no jank or stuttering on modern devices)

### Reduced Motion Support

**When**: User has `prefers-reduced-motion: reduce` enabled

**Behavior**: All animations disabled

```css
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-toggle-knob {
    transition: none !important;
  }
}
```

Result: Instant toggle without animation (respects accessibility preference)

---

## Accessibility Contract

### Keyboard Navigation

| Key | Behavior | Notes |
|-----|----------|-------|
| `Tab` | Focus button | Button receives visible focus ring |
| `Space` | Toggle theme | Activates button click handler |
| `Enter` | Toggle theme | Activates button click handler |
| `Shift+Tab` | Reverse focus | Component included in normal tab order |

### ARIA Attributes

```vue
<button
  :aria-label="ariaLabel"          <!-- Current label: 'Switch to dark mode' or 'Switch to light mode' -->
  :aria-pressed="isDarkMode"       <!-- true when dark mode active, false when light -->
  class="..."
>
  <!-- Content -->
</button>
```

#### aria-label Mapping

| State | aria-label |
|-------|-----------|
| Light mode (not pressed) | `"Switch to dark mode"` |
| Dark mode (pressed) | `"Switch to light mode"` |

#### aria-pressed Mapping

| State | aria-pressed |
|-------|------------|
| Light mode active | `"false"` |
| Dark mode active | `"true"` |

### Semantic HTML

- Uses `<button>` element (not `<div>` with click handler)
- Native keyboard support
- Proper semantics for assistive technology
- WCAG 2.1 AA compliant

### Screen Reader Behavior

1. Screen reader announces: "Toggle dark mode, button"
2. User presses Space/Enter
3. Component toggles theme
4. aria-pressed updates: `true` → `false`
5. Screen reader announces: "Toggle light mode, button, pressed" (or similar, depending on reader)

---

## Integration Contract

### Installation

1. Place component file in `webapp/components/ThemeToggle.vue`
2. Nuxt auto-discovers and auto-imports the component (if auto-imports enabled)
3. If not auto-imported, manually import: `import ThemeToggle from '~/components/ThemeToggle.vue'`

### Usage in Layouts

Add to main layout file (`layouts/default.vue`):

```vue
<template>
  <div>
    <ThemeToggle />
    <!-- Other layout content -->
    <NuxtPage />
  </div>
</template>
```

### No Configuration Needed

ThemeToggle requires:
- ✅ localStorage API (browser-native)
- ✅ DOM manipulation (browser-native)
- ✅ Tailwind CSS for styling (already in project)

No props, no parent state, no setup required.

### Global CSS Requirements

The component assumes these CSS variables are defined in `assets/css/main.css`:

```css
html {
  --color-bg: #ffffff;
  --color-text: #000000;
  /* ... other variables */
}

html.dark-mode {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
  /* ... dark mode variables */
}
```

If variables not defined, component still works but may not show theme changes until CSS is updated.

---

## Performance Contract

### Load Time

- **Component Parse**: < 50ms
- **Component Mount**: < 100ms
- **Total to Interactive**: < 200ms
- **Button Visible**: Within 500ms of app load (SC-001)

### Click Response

- **State Update**: < 10ms (synchronous)
- **DOM Class Application**: < 5ms
- **localStorage Write**: < 10ms
- **Animation Duration**: 300-400ms (CSS-driven, smooth 60fps)

### Memory Usage

- **Component Size**: ~2-3KB (minified + gzipped)
- **localStorage Entry**: ~25 bytes (`'theme-preference' + 'dark'` or `'light'`)
- **No memory leaks**: Cleanup on component destroy

### No Performance Regressions

- ✅ Does not block main thread
- ✅ Uses CSS transitions (GPU-accelerated, if available)
- ✅ Does not trigger layout thrashing
- ✅ Graceful degradation if localStorage unavailable

---

## Browser Support Contract

### Supported Environments

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | All features supported |
| Firefox | 88+ | ✅ Full | All features supported |
| Safari | 14+ | ✅ Full | All features supported |
| Edge | 90+ | ✅ Full | Chromium-based, same as Chrome |
| Safari Mobile | 14+ | ✅ Full | Touch-friendly, all features |
| Chrome Mobile | 90+ | ✅ Full | Touch-friendly, all features |
| Firefox Mobile | 88+ | ✅ Full | Touch-friendly, all features |

### Technology Requirements

- CSS Transitions ✅
- CSS Custom Properties (Variables) ✅
- localStorage API ✅
- ARIA Attributes ✅
- ES6 Modules / Vue 3 ✅

No polyfills needed for modern browsers.

---

## State Management Contract

### Internal State (Component Level)

```typescript
interface ComponentState {
  isDarkMode: boolean            // Is dark mode currently active?
  isLoading: boolean             // Is animation in progress?
  hasLocalStorage: boolean       // Does browser support localStorage?
}
```

### No External State Required

- Component does not rely on parent state
- Component does not rely on Vuex/Pinia stores
- Component self-manages all state changes
- Theme state is persisted to localStorage (not to server)

### State Reactivity

All state updates are reactive (Vue ref/reactive):

```typescript
const isDarkMode = ref(false)
const isLoading = ref(true)

// State changes trigger re-renders
isDarkMode.value = true  // → Component re-renders
```

---

## Event Contracts (External Systems)

### localStorage Change Events

When theme preference is updated, other code can listen via `storage` event:

```javascript
window.addEventListener('storage', (event) => {
  if (event.key === 'theme-preference') {
    console.log('Theme changed to:', event.newValue)
    // e.g., 'light' or 'dark'
  }
})
```

### DOM Mutation Observer

Other code can observe DOM class changes:

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const isDark = document.documentElement.classList.contains('dark-mode')
      console.log('Theme mode changed to:', isDark ? 'dark' : 'light')
    }
  })
})

observer.observe(document.documentElement, { attributes: true })
```

---

## Error Handling Contract

### Graceful Degradation

If localStorage is unavailable:
- ✅ Theme still toggles in UI (visual feedback works)
- ✅ DOM class applied/removed normally
- ✅ No error thrown to user
- ✅ Preference does not persist (acceptable fallback)
- ⚠️ Console warning logged (for debugging)

### Invalid State Recovery

If localStorage contains invalid value:
- ✅ Treated as no saved preference
- ✅ Defaults to light mode
- ✅ Next toggle overwrites with valid value
- ✅ No user intervention needed

### Rapid Click Handling

If user clicks repeatedly:
- ✅ `isLoading` flag prevents race conditions
- ✅ Final state matches last click
- ✅ No duplicate DOM updates
- ✅ No animation glitches

---

## Testing Contract

### Unit Testing Requirements

```typescript
// Test: Component mounts successfully
expect(wrapper.exists()).toBe(true)

// Test: Initial state matches localStorage or default
expect(isDarkMode.value).toBe(false)  // or true if localStorage has 'dark'

// Test: Click toggles state
await wrapper.find('button').trigger('click')
expect(isDarkMode.value).toBe(true)

// Test: DOM class applied
expect(document.documentElement.classList.contains('dark-mode')).toBe(true)

// Test: localStorage updated
expect(localStorage.getItem('theme-preference')).toBe('dark')

// Test: ARIA attributes updated
expect(wrapper.attributes('aria-pressed')).toBe('true')
```

### Integration Testing Requirements

- ✅ Theme persists across page reloads
- ✅ Theme persists across navigation (multi-page)
- ✅ No console errors or warnings
- ✅ Keyboard navigation works
- ✅ Animation smooth (60fps)
- ✅ Accessible with screen reader

### Accessibility Testing Requirements

- ✅ Keyboard focus visible
- ✅ Space/Enter keys work
- ✅ ARIA attributes correct
- ✅ WCAG 2.1 AA compliant

---

## Summary

| Aspect | Specification |
|--------|---------------|
| **Props** | None |
| **Emits** | None |
| **Slots** | None |
| **Integration** | Add to layout, no config needed |
| **Position** | Fixed bottom-left, z-index 1000 |
| **Size** | 48×96px (tap target 44×44px+) |
| **Animation** | 300-400ms smooth CSS transition |
| **Accessibility** | WCAG 2.1 AA compliant, keyboard operable |
| **Browser Support** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Performance** | < 500ms to visible, 60fps animation |
| **Error Handling** | Graceful degradation, silent failures |

**Component is production-ready** when all specifications are met.
