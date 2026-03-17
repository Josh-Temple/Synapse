# Handoff Notes

## Session summary

This pass strengthened Synapse as a **local-first concept-relationship learning app** by improving practical in-app editing, safer import behavior, All mode readability, and progress visibility without changing product direction.

## What changed

### 1) Real editing primitives in Edit panel

- Added **Create card** form (title/summary/detail).
- Added **Delete card** action with confirmation and connected-edge count warning.
- Added **Create edge** form with card-title dropdowns for source/target.
- Added **Delete edge** action with confirmation.
- Added **edge rewiring** via source/target dropdowns per edge.
- Edge editing summaries now show **human-readable card titles**.
- Added validation for edge creation/rewiring:
  - endpoints must exist
  - self-loop blocked
  - duplicate source→target blocked
- Card deletion now performs safe cascade on connected edges and progress cleanup.

### 2) Safer full JSON import with recovery

- Full JSON import now opens a **preview step** first:
  - graph count
  - total cards
  - total edges
  - graph titles
- Added explicit import mode choice:
  - **Merge** (default)
  - **Replace**
- Replace mode now creates an automatic **backup snapshot** before applying.
- Added **Restore last backup** action from home.
- Merge mode no longer overwrites existing graphs; conflicting graph IDs are auto-renamed with numeric suffixes.

### 3) All mode readability improvements

- Added concept **search/jump** by title.
- Added **1-hop / 2-hop** neighborhood focus toggle.
- Selected concept neighborhood is emphasized; unrelated nodes/edges are de-emphasized.
- Label behavior improved with compact truncation helper (less brittle than raw slicing).

### 4) Progress visibility

- Added compact graph progress line in toolbar:
  - total edges
  - reviewed edges
  - remembered count
  - missed count
  - untouched count

## Why these choices

- Preserves Learn mode as core while making graph refinement feasible inside app.
- Keeps All mode supportive and lightweight (no heavy graph engine or backend work).
- Keeps provider-agnostic AI draft path unchanged, with existing preview/validation still intact.
- Uses local storage abstraction and small pure helper modules for maintainable incremental evolution.

## What was intentionally left for later

- No backend/auth/sync/Supabase.
- No graph-engine migration.
- No advanced SRS scheduling.
- No full visual drag-and-drop graph editor.
- No relationType filters or weak-link highlighting in All mode yet.

## Suggested next steps

1. Add relationType filter in All mode and detail panel.
2. Add selected-card local progress summary and weak-link cues.
3. Add minimal undo stack for edit operations (especially destructive deletes).
4. Expand import conflict report UI (show renamed graph IDs explicitly).
5. Add targeted component tests around EditPanel user interactions.
