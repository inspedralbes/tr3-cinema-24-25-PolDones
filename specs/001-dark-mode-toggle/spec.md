# Feature Specification: Dark Mode Toggle Component

**Feature Branch**: `feature/001-dark-mode-toggle`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "Crea un nou component Vue per a un interruptor de mode clar/mode fosc i integra'l al fitxer principal (com `App.vue`) perquè sigui visible a totes les pàgines. Especificacions: ubicació fixa inferior esquerre, disseny tipus iPhone toggle switch, animació suau, guardar preferència a localStorage, afegir/treure classe 'dark-mode' a etiqueta html."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Theme Toggle (Priority: P1)

A new user arrives at the cinema booking app and wants to switch to dark mode because they're using it in a dark environment. They interact with the theme toggle button at the bottom-left corner and expect an immediate visual change across the entire app.

**Why this priority**: Core value delivery—the primary purpose of the feature is to allow users to control their theme preference. This must work on first interaction before any persistence logic is tested.

**Independent Test**: Can be tested by (1) rendering the component in isolation, (2) clicking the toggle, (3) verifying 'dark-mode' class is added to `<html>` tag, and (4) observing instant UI change without page reload.

**Acceptance Scenarios**:

1. **Given** the user opens the app in light mode, **When** they click the toggle switch, **Then** the 'dark-mode' class is immediately added to the `<html>` element and all dark-mode styles apply instantly
2. **Given** dark mode is active, **When** they click the toggle switch again, **Then** the 'dark-mode' class is immediately removed from the `<html>` element and light-mode styles apply
3. **Given** the toggle button is in view, **When** the user interacts with it, **Then** a smooth transition animation plays (e.g., button slides/morphs, not instant appearance change)

---

### User Story 2 - Persistent Theme Preference (Priority: P1)

After toggling to dark mode and navigating away from the cinema app (closing the browser, navigating to another site, returning later), the user expects their dark mode preference to be remembered and automatically applied on their next visit.

**Why this priority**: Critical for user experience—without persistence, the feature is incomplete. Users must not have to toggle dark mode every time they return.

**Independent Test**: Can be tested by (1) toggling dark mode, (2) verifying localStorage contains the preference, (3) simulating a page reload or app restart, and (4) verifying the theme is automatically restored without user action.

**Acceptance Scenarios**:

1. **Given** the user selects dark mode, **When** the page reloads or they return to the app later, **Then** dark mode is automatically restored from localStorage without requiring a toggle
2. **Given** the user's device does not have localStorage access (private/incognito mode edge case), **When** they toggle the theme, **Then** the UI still updates immediately but may not persist across sessions
3. **Given** localStorage contains a stored theme preference, **When** the app initializes, **Then** that preference is read and applied before the page fully renders (to avoid light/dark flash)

---

### User Story 3 - Visual Feedback & Polish (Priority: P2)

Users expect the toggle switch to look and feel like familiar toggle controls (e.g., iOS-style) and to provide smooth visual feedback when toggling. Rough, jarring animations should not occur.

**Why this priority**: Enhances user experience and builds confidence in the feature. The iOS-style design is explicitly requested and contributes to app polish.

**Independent Test**: Can be tested by (1) rendering the button in multiple browser environments, (2) clicking the toggle repeatedly, (3) measuring animation smoothness and duration consistency, and (4) verifying the button remains accessible and clickable during animations.

**Acceptance Scenarios**:

1. **Given** the toggle switch is rendered, **When** viewed on desktop/mobile, **Then** it resembles an iOS-style toggle switch with a rounded pill shape and smooth internal animation
2. **Given** the user clicks the toggle, **When** the animation plays, **Then** it completes smoothly within 300-400ms without stuttering or blocking other interactions
3. **Given** the toggle is in its "off" state, **When** animated to "on" state, **Then** the internal circle/knob slides smoothly from left to right (or equivalent motion)

---

### User Story 4 - Cross-Page Visibility & Consistency (Priority: P2)

The user navigates through different pages of the cinema app (home, events, admin panel, payment page). The theme toggle is always accessible from the same location (bottom-left) and the chosen theme persists consistently across all pages without flicker or re-rendering issues.

**Why this priority**: Ensures the feature integrates properly into the existing app navigation. Secondary because it depends on Story 1 being functional first, but important for a polished multi-page experience.

**Independent Test**: Can be tested by (1) integrating the component into App.vue, (2) navigating to multiple pages using the router, (3) toggling the theme on one page, and (4) verifying the same theme state is visible on all other pages.

**Acceptance Scenarios**:

1. **Given** the component is integrated into App.vue, **When** the user navigates between pages (home → events → admin), **Then** the toggle remains in a fixed position and maintains its state
2. **Given** the user toggles dark mode on one page, **When** they navigate to another page, **Then** the new page loads with the same theme applied, without visible flicker
3. **Given** the Nuxt.js router is in use, **When** a page transition occurs, **Then** the theme state is not reset and no race conditions occur

---

### Edge Cases

- **Q1**: What happens if the user's browser has localStorage disabled? → System falls back to immediate UI updates but no persistence across sessions; this is acceptable for privacy-focused users.
- **Q2**: What happens if the theme preference is corrupted in localStorage? → System treats it as invalid and defaults to light mode; the corrected preference is saved on next toggle.
- **Q3**: What if the user rapidly clicks the toggle (button mashing)? → All clicks queue or debounce gracefully; the final state matches the last click without animation glitches.
- **Q4**: Does the 'dark-mode' class on the `<html>` tag conflict with Tailwind CSS dark mode utilities? → Per the constitution, this root-level manipulation is the prescribed approach; Tailwind selectors for `.dark` mode should map to this class appropriately.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a toggle switch component at a fixed position (bottom-left, inset from edges) on the viewport
- **FR-002**: System MUST apply the 'dark-mode' class to the `<html>` element when dark mode is activated
- **FR-003**: System MUST remove the 'dark-mode' class from the `<html>` element when dark mode is deactivated
- **FR-004**: System MUST save the user's theme preference to localStorage with key `theme-preference` (value: `'light'` or `'dark'`)
- **FR-005**: System MUST load and apply the saved theme preference from localStorage on app initialization
- **FR-006**: System MUST provide smooth CSS transitions (no jumping, no flicker) when the toggle state changes
- **FR-007**: Component MUST be self-contained in a single `.vue` file with scoped styles (per Constitution Principle I)
- **FR-008**: Component MUST be integrated into the main App.vue layout so it is visible on all pages
- **FR-009**: System MUST provide visual feedback (e.g., toggle knob slides) that mimics iOS-style toggle switch behavior
- **FR-010**: System MUST ensure the toggle switch is keyboard-accessible (e.g., focusable, operable via Enter/Space keys)

### Key Entities

- **Theme State**: An object representing the current theme (`{ preference: 'light' | 'dark' }`)
- **localStorage 'theme-preference' Entry**: Persisted string value ('light' or 'dark') representing user's saved preference
- **DOM Class 'dark-mode'**: CSS class applied to `<html>` tag to trigger dark-mode styling cascade

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dark mode toggle is visible and clickable within 500ms of app load
- **SC-002**: Theme preference persists across browser sessions (verified by localStorage presence and restoration on page reload)
- **SC-003**: Toggle animation completes within 300-400ms without frame drops on modern devices (60fps baseline)
- **SC-004**: 100% of pages (home, events, admin, payments) display the selected theme consistently after navigation
- **SC-005**: Toggle switch is accessible to keyboard-only users (can receive focus, can toggle via Enter/Space keys)
- **SC-006**: No console errors or warnings related to theme switching or localStorage operations
- **SC-007**: Component code follows Vue 3 composition or options API patterns with TypeScript support (aligns with project Nuxt.js setup)

---

## Assumptions

- **Nuxt.js Integration**: The app already exports an `App.vue` or equivalent root layout; the toggle component will be injected there. If using Nuxt layout system, it will be added to the default layout.
- **CSS Framework**: Tailwind CSS is in use (per project structure); dark mode will be controlled via the 'dark-mode' class on `<html>`, compatible with Tailwind's `.dark:` utilities.
- **localStorage Availability**: While localStorage may be unavailable in private browsing mode, the feature gracefully degrades to session-only theme management.
- **Root-Level DOM Manipulation**: Per Constitution Principle II, modifying the `<html>` element with the 'dark-mode' class is the prescribed method for global theme control and does not conflict with scoped component styles.
- **No Breaking Changes**: Existing component styles (scoped in `.vue` files) are not modified; only new CSS rules targeting `.dark-mode` class are added globally.
- **Browser Support**: Assumes modern browsers (Chrome 90+, Firefox 88+, Safari 14+) with CSS transitions and localStorage support; no polyfills needed for these features.
- **Accessibility**: The toggle button will include ARIA labels and semantic HTML (e.g., `<button>`) to meet WCAG 2.1 AA standards (Constitution Principle V).
