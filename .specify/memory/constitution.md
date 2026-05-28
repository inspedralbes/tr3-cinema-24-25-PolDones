<!-- SYNC IMPACT REPORT
Version: 1.0.0 (Initial)
Ratified: 2026-05-28
Principles: 5 core principles established for Vue.js cinema seat booking system
Sections: Technology Stack, Development Workflow
Templates to Review: plan-template.md, spec-template.md, tasks-template.md
-->

# Cinema Seat Booking System Constitution

## Core Principles

### I. Component-Driven Architecture
Every feature in the webapp is encapsulated as a self-contained `.vue` component with scoped styles. Components MUST own their styling and layout logic; global CSS applies only to root-level theme variables and structural resets. Component names must clearly describe their purpose. All components MUST be independently testable and reusable.

### II. Scoped Styling & Theme Management
Each `.vue` component declares styles in a scoped `<style scoped>` block. Global theme logic (colors, typography, dark/light mode) manipulates the DOM root level only—applying classes to `<html>` or `<body>` tags. This ensures themes do not conflict with component encapsulation. No inline styles unless absolutely necessary for dynamic values computed from props or state.

### III. Real-Time Synchronization via WebSockets
All seat reservations, bookings, and seat-state changes synchronize instantly across connected clients using Socket.IO. Every state mutation that affects shared domain (e.g., seat locks, bookings) MUST trigger a socket event. Optimistic UI updates are permitted; rollback on socket acknowledgment failure is required. Conflict resolution follows last-write-wins for seat locks.

### IV. Mobile-First Responsiveness
The UI is designed mobile-first, responsive across all viewport sizes. All interactive elements (buttons, inputs, seat maps) MUST be thumb-friendly on mobile (minimum 44×44 px tap targets). Responsive breakpoints follow Tailwind conventions. No layout should break below 320px viewport width. Testing on actual mobile devices is required before release.

### V. Accessibility & User Experience
All interactive components MUST include proper ARIA labels and semantic HTML. Error messages, confirmations, and state feedback are clear and timely. Form validation is real-time with helpful hints. Payment flows are PCI-compliant. User action sequences are logged for admin review and troubleshooting.

## Technology Stack & Requirements

- **Frontend**: Nuxt.js 3 with Vue.js, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, Socket.IO for real-time sync
- **Database**: Persistent seat state, booking records, user sessions
- **Deployment**: Docker & Docker Compose for containerized stack
- **API Integration**: External Movies API for film listings
- All code MUST be generated as native Vue (no JSX) unless explicitly requested
- Global logic impacting DOM structure MUST manipulate `<html>` or `<body>` only

## Development Workflow

- Feature branches follow naming: `feature/descriptor` or `feature/###-descriptor`
- Code review before merging to main; all PRs must verify principle compliance
- Component changes should be tested in isolated Storybook or component tests
- Real-time features require socket event testing in multi-client scenarios
- Performance: Initial page load <3s on 4G; seat map render <500ms

## Governance

This Constitution supersedes all other development practices. All PRs and code changes must verify compliance with these five core principles. Amendments require:
1. Documentation of rationale and impact
2. Update to this document with version bump (following semver)
3. Propagation to dependent design templates (plan, spec, tasks)
4. Approval before enforcement

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
