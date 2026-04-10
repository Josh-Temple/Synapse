# Handoff Notes

## Session update (UI redesign pass)

- Reworked the primary app surface into a calmer study-first layout with stronger typography and spacing rhythm.
- Added a minimal top bar with compact mode visibility and overflow menu for tertiary actions (home/random/resume/edit).
- Implemented explicit study/edit separation: edit controls now live on a dedicated edit surface and are no longer always visible during study.
- Simplified Learn mode visual hierarchy:
  - current concept is now the dominant focal element
  - recall rows use lightweight dividers instead of mini dashboards/cards
  - reveal/meta actions are tertiary (ghost) while remembered/missed/next remain direct action controls
- Reduced visual container intensity in All mode and aligned filters/controls to the same minimal language.

## Session summary

This pass upgraded Synapse from single-axis study behavior to a **two-axis model**:
- Mode: `all` / `learn`
- Scope: `unit` / `bridge` / `global`

The implementation keeps Learn mode retrieval-centric while enabling structured historical progression: unit mastery, bridge practice, then occasional global inspection.

## What changed

### 1) Data model expansion

- Added `StudyScope`, `LinkScope`, `CardType`, and `Unit`.
- Extended `Card` with `unitId`, `cardType`, `aliases`, `dateLabel`.
- Extended `Edge` with `importance` and normalized/stored `scope`.
- Extended `EdgeProgress` with `nextDueAt` and `lastStudiedScope`.
- Extended `LearnState` with `studyScope`, `selectedUnitId`, `selectedBridgeUnitIds`, and optional queues.

### 2) Normalization + compatibility

- Legacy graphs (without units) now normalize to a synthetic `default-unit`.
- All cards receive valid `unitId` after normalization.
- Edge scope is derived automatically when missing (`intra-unit` vs `cross-unit`).
- Slot uniqueness and progress normalization remain preserved.
- Existing import/merge/replace/backup flows continue to pass through normalization.

### 3) Scope selectors and review utilities

- Added `src/utils/studyScope.ts` selectors for:
  - visible cards/edges by scope
  - bridge neighbors
  - scope-aware outgoing review edges
- Added `src/utils/reviewQueue.ts` helpers for:
  - weighting (`missed > untouched > remembered`)
  - bridge/core bonus
  - lightweight due-date progression

### 4) UI / UX updates

- `GraphToolbar` now includes scope controls, unit picker, bridge-neighbor summary, and scope-aware progress summary.
- `AllModePanel` now applies scope filtering and adds compact filters:
  - relation type
  - importance
  - card type
- `LearnModePanel` now shows scope/unit/card metadata and provides:
  - reveal all actions
  - next/random actions
  - quick switch-to-bridge CTA
- `EditPanel` now supports units and new card/edge fields.

### 5) Sample graph replacement

- Replaced old sample with **Age of Revolutions**:
  - Enlightenment
  - French Revolution
  - Napoleonic Era
  - Congress of Vienna
- Added meaningful intra-unit and cross-unit edges with cue/reason/relationType/importance.

### 6) Docs and tests

- README rewritten to describe two-axis behavior and draft schema v2.
- Added targeted tests for normalization, selectors, review queue logic, and mutation constraints.

## Migration / backward compatibility notes

- Storage keys remain unchanged.
- Legacy app data should load without user intervention due to normalization.
- Legacy learn-state objects are migrated in memory (`studyScope` defaults to `unit`, unit selection derived safely).

## Intentional simplifications

- Due scheduling is intentionally lightweight:
  - remembered: +1d, then +3d, then +7d
  - missed: +10m
- Queue generation remains helper-level and is not a full SRS engine.
- Bridge-mode edge rendering favors clarity over advanced graph-layout semantics.

## Remaining limitations

- No full advanced SRS (streak tuning, lapses, burying, etc.).
- No sync/auth/back-end.
- No drag-and-drop visual editing.
- Unit reassignment currently does not include a dedicated bulk migration UI.

## Recommended next steps

1. Add explicit “due now / later” queue UI in Learn mode using `nextDueAt`.
2. Add selected-card progress mini-panel and weak-link hints.
3. Add richer bridge/global navigation breadcrumbs.
4. Add lightweight E2E smoke tests for mode/scope combos.
5. Refine edit UX for unit deletion with optional reassignment flow.
