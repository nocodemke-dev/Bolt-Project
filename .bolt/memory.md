# Project memory

## Product intent & audience

- Personal productivity app combining tasks, time blocking, and habit tracking in one place.
- Two main pages: **Today** (daily dashboard) and **Progress** (stats with charts).
- Audience: individual users managing their own daily schedule and habits.

## Brand personality & voice

- Not explicitly defined yet; app leans toward a clean, utilitarian productivity tone.

## Visual design & UX direction

- Layout: top nav bar with page switching (Today / Progress).
- Today page: three side-by-side sections — Tasks Due Today, Today's Schedule, Habits — with quick-stat cards on top (tasks done, hours time-blocked, habits checked).
- Tasks: priority levels (low/medium/high), checkbox to complete, delete action, completion counter.
- Time blocks: start/end time inputs, chronological list with duration, total hours blocked summary.
- Habits: check-off per day, flame streak counter per habit.
- Progress page: summary cards on top, followed by three charts:
  - Bar chart: tasks completed per week (last 7 weeks).
  - Bar chart: hours time-blocked per day (last 7 days).
  - Line chart: current consecutive-day streak per habit.
- All data persists via a database (migrations were applied).

## Decisions, constraints & rationale

- Tech stack: Vite + React + TypeScript (confirmed in use).
- Database-backed persistence (migrations applied during setup).
- Initial `src/` scaffolding was created during this turn (`main.tsx`, `App.tsx`, layout, pages, components, Vite env type declarations).
- Build and typecheck both pass.
- Styling approach not explicitly confirmed — inferred from implementation but not locked in.

## Open questions & assumptions

- Preferred styling approach still unconfirmed by user (implemented but not declared).
- Which database/provider is used for persistence (inferred from migrations but not explicitly stated).
- Whether tasks should support due dates beyond just "today" or recurring habits — not yet requested.
- Any branding, color preferences, or design assets to apply — none provided yet.