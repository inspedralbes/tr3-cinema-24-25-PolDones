# tasks.md — Dark Mode Toggle Component

Phase 1 — Setup

- [ ] T001 Create theme plugin in webapp/plugins/theme.client.ts (apply saved theme before hydration)
- [ ] T002 [P] Add global dark-mode CSS variables in webapp/assets/css/main.css

Phase 2 — Foundational

- [ ] T003 [US1] Implement ThemeToggle component shell in webapp/components/ThemeToggle.vue
- [ ] T004 [US1] Implement DOM class toggle on `<html>` and keyboard accessibility in webapp/components/ThemeToggle.vue
- [ ] T005 [US2] Persist theme preference to localStorage (`theme-preference`) in webapp/components/ThemeToggle.vue

Phase 3 — User Stories (priority order)

### User Story 1 — First-Time Theme Toggle (P1)
- [ ] T006 [US1] Verify immediate visual change: add/remove `dark-mode` class on `<html>` and ensure UI updates without reload (tests/manual)

### User Story 2 — Persistent Theme Preference (P1)
- [ ] T007 [US2] Restore theme on app init via plugin and handle private browsing fallback (try/catch) in webapp/plugins/theme.client.ts

### User Story 3 — Visual Feedback & Polish (P2)
- [ ] T008 [US3] Implement iOS-style toggle styles and smooth animation (scoped) in webapp/components/ThemeToggle.vue
- [ ] T009 [US3] Respect `prefers-reduced-motion` and ensure animation completes within 300-400ms (CSS)

### User Story 4 — Cross-Page Visibility & Consistency (P2)
- [ ] T010 [US4] Integrate `ThemeToggle` into layouts/default.vue so it's visible on all pages

Final Phase — Polish & QA

- [ ] T011 [P] Add unit tests at webapp/components/__tests__/ThemeToggle.spec.ts (Vue Test Utils / Vitest)
- [ ] T012 Integration & manual test checklist in specs/001-dark-mode-toggle/checklists/requirements.md
- [ ] T013 Update docs: specs/001-dark-mode-toggle/quickstart.md and .github/copilot-instructions.md
- [ ] T014 Final review and commit changes

Dependencies

- Phase 1 tasks (T001, T002) should run before T007 and T006 to prevent visual flash and provide CSS variables.
- T003/T004/T005/T008/T009 are closely related and can be implemented in parallel by different engineers, but integration (T010) should wait until component and plugin are complete.

Parallel Opportunities

- `T002` (global CSS) and `T003` (component shell) are parallelizable [P]
- `T008` (styling) and `T011` (unit tests) are parallelizable [P]
- Unit tests (T011) can be written while implementation tasks progress (P)

Independent Test Criteria (per User Story)

- US1: Clicking the toggle adds/removes `dark-mode` on `<html>` and UI updates instantly. Testable by rendering component and asserting DOM class change.
- US2: After toggling, `localStorage.theme-preference` equals `dark`/`light`; on reload plugin restores class before render. Testable by setting localStorage and reloading in test harness or browser.
- US3: Toggle animation completes in 300-400ms; `prefers-reduced-motion` disables animation. Testable via CSS timing checks and media query simulation.
- US4: `ThemeToggle` rendered in `layouts/default.vue` remains fixed at bottom-left and maintains theme across router navigation. Testable by navigating pages in dev server.

MVP Suggestion

- Implement and ship User Stories 1 and 2 only (T001, T002, T003, T004, T005, T006, T007). This provides full toggle behavior and persistence across sessions.

Format Validation

- All tasks follow the checklist format with Task IDs and story labels where applicable.

Total tasks: 14

Tasks per user story:
- US1: T003, T004, T006 (3 tasks)
- US2: T005, T007 (2 tasks)
- US3: T008, T009 (2 tasks)
- US4: T010 (1 task)
- Cross-cutting / QA / Docs: T001, T002, T011, T012, T013, T014 (6 tasks)
