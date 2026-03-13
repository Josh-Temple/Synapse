# Handoff Notes

## Session summary

This session shifted Synapse UX toward its core identity: **a learning tool for concept relationships**, not a graph spectacle.

## What changed

1. Home/start clarity improvements
   - Reworked home hero to state value proposition in plain language.
   - Highlighted three first actions: start with sample, import AI draft, open quick guide.
   - Added compact **Good fit / Less ideal** guidance.
   - Kept existing graph open/edit and import/export flows.

2. All mode readability improvements
   - Replaced graph-dominant view with an overview + details split.
   - Added selected-node focus behavior (click node to inspect).
   - Details panel now prioritizes:
     - title
     - summary
     - detail
     - outgoing links
     - incoming links
     - relationType
     - cue
     - reason
   - Reduced visual dominance of non-selected graph connections.

3. Learn mode emphasis
   - Reframed Learn mode as the main study loop in UI copy.
   - Improved current-card focus and scanability.
   - Grouped reveal actions separately from grading actions.
   - Increased visibility of Remembered / Missed controls.
   - Kept interactions minimal and recall-focused.

4. Storage architecture prep for growth
   - Refactored storage into an engine abstraction in `src/storage.ts`.
   - Added `StorageEngine` interface + default localStorage implementation.
   - Added `configureStorageEngine(...)` to allow future IndexedDB-backed engine injection.
   - External behavior remains unchanged (still localStorage for MVP).

5. Docs updates
   - README now explicitly prioritizes Learn mode and concept-relationship learning.
   - README includes concise good fit / less ideal guidance.
   - README clarifies graph is supportive and storage is currently localStorage.

## Product direction reinforced

- Prioritize **learning clarity over graph spectacle**.
- Keep provider-agnostic AI draft workflow.
- Keep local-first no-backend philosophy for now.

## Intended next storage evolution (without backend)

If deck size/performance pressure grows:

1. Implement `IndexedDbStorageEngine` with same interface:
   - `getItem(key)`
   - `setItem(key, value)`
2. Add app bootstrap logic to select engine (localStorage by default, IndexedDB opt-in).
3. Add migration routine:
   - read localStorage keys once
   - write to IndexedDB
   - mark migration complete
4. Keep exported/imported AppData format unchanged to avoid user-facing breakage.

## What was intentionally left for later

- No backend/auth/sync/Supabase.
- No collaborative features.
- No advanced spaced repetition.
- No graph engine migration.
- No change to AI draft schema shape.

## Session update (current)

- Re-checked `README.md` and `HANDOFF.md` for consistency.
- Confirmed that **Card is implemented** in both domain model and UI:
  - Data model: `Card` interface and `GraphData.cards` are defined.
  - UI usage: cards are rendered/edited in All, Learn, and Edit panels.
- Verified project health with a successful production build.
