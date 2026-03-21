# Handoff Notes

## Session summary

This pass strengthened Synapse as a **local-first concept-relationship learning app** by adding baseline PWA support so the app can be installed and reused offline after the first production visit.

## What changed

### 1) Baseline PWA support

- Added a **web app manifest** with app metadata, theme color, standalone display mode, and install icons.
- Added a **service worker** that caches the app shell and same-origin GET responses for offline reuse after the first successful load.
- Registered the service worker only in **production builds** to avoid development cache issues.
- Updated the HTML head with manifest, icon, description, and theme-color metadata required for installability.

### 2) Previous session changes still present in product

#### Real editing primitives in Edit panel

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

#### Safer full JSON import with recovery

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

#### All mode readability improvements

- Added concept **search/jump** by title.
- Added **1-hop / 2-hop** neighborhood focus toggle.
- Selected concept neighborhood is emphasized; unrelated nodes/edges are de-emphasized.
- Label behavior improved with compact truncation helper (less brittle than raw slicing).

#### Progress visibility

- Added compact graph progress line in toolbar:
  - total edges
  - reviewed edges
  - remembered count
  - missed count
  - untouched count

## Why these choices

- Makes the app installable and resilient to brief offline use without introducing backend complexity.
- Preserves Learn mode as core while making graph refinement feasible inside app.
- Keeps All mode supportive and lightweight (no heavy graph engine or backend work).
- Keeps provider-agnostic AI draft path unchanged, with existing preview/validation still intact.
- Uses local storage abstraction and small pure helper modules for maintainable incremental evolution.

## What was intentionally left for later

- No backend/auth/sync/Supabase.
- No advanced asset precache manifest or background update UX yet.
- No graph-engine migration.
- No advanced SRS scheduling.
- No full visual drag-and-drop graph editor.
- No relationType filters or weak-link highlighting in All mode yet.

## Suggested next steps

1. Add explicit in-app offline/update status UI for service worker lifecycle events.
2. Add PNG icons / splash-oriented assets for broader mobile install polish.
3. Add relationType filter in All mode and detail panel.
4. Add selected-card local progress summary and weak-link cues.
5. Add minimal undo stack for edit operations (especially destructive deletes).
