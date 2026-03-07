# Synapse MVP

Synapse is a local-first memory-training web app focused on **recalling connections** between concepts.

## What it does

- Directed graph model (`cards`, `edges`, `progress`)
- Two modes:
  - **All mode** for full graph inspection
  - **Learn mode** for slot + cue based active recall
- Edge-level review outcomes (`remembered` / `missed`)
- Local persistence via `localStorage`
- JSON import/export with validation and normalization
- Lightweight editing for graph/card/edge text fields

## Stack

- React + TypeScript + Vite
- Lightweight custom CSS (no backend)

## Local setup

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Refactoring notes

The codebase is now split into focused UI components and utility modules for maintainability:

- `src/components/HomePage.tsx`
- `src/components/GraphToolbar.tsx`
- `src/components/LearnModePanel.tsx`
- `src/components/AllModePanel.tsx`
- `src/components/EditPanel.tsx`
- `src/utils/learnState.ts`

`src/App.tsx` is now primarily orchestration and state wiring.

## Data shape

```ts
type ReviewResult = "remembered" | "missed";

interface Card {
  id: string;
  title: string;
  summary: string;
  detail: string;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  reason: string;
  slot: string;
  cue: string;
}

interface EdgeProgress {
  edgeId: string;
  seenCount: number;
  rememberedCount: number;
  missedCount: number;
  lastResult?: ReviewResult;
  lastReviewedAt?: string;
}

interface GraphData {
  id: string;
  title: string;
  description?: string;
  cards: Card[];
  edges: Edge[];
  progress: EdgeProgress[];
  createdAt: string;
  updatedAt: string;
}

interface AppData {
  graphs: GraphData[];
}
```

## Import / export format

The app imports and exports one JSON payload:

```json
{
  "graphs": [
    {
      "id": "graph-id",
      "title": "Graph title",
      "cards": [],
      "edges": [],
      "progress": [],
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]
}
```

Validation on import:

- Unique card IDs
- Unique edge IDs
- `from` / `to` card references must exist
- Outgoing edge slots must be unique per source card
- Missing progress entries are auto-created
- Missing slots are auto-assigned alphabetically

## Learn mode loop

1. Show current card
2. Show outgoing edges by `slot` + `cue`
3. Reveal destination/reason only when user asks
4. Mark each edge as `remembered` or `missed`
5. Follow one edge to continue navigation

## Cue guidance for AI-generated data

`cue` should be a short hint (1–3 words):

- Avoid destination titles verbatim
- Capture reason essence
- Prefer concrete cues over vague abstractions

## MVP limitations

- No authentication or backend
- No cloud sync
- No advanced spaced repetition
- No collaborative editing
- Graph rendering is intentionally lightweight (SVG radial + lists)

## Deploy to Vercel

This project is configured for Vercel static deployment with Vite.

### Included config

- `vercel.json`
  - `framework`: `vite`
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `dist`
  - SPA rewrite from `/(.*)` to `/index.html`

### Vercel dashboard setup

1. Import this repository in Vercel.
2. Framework preset: **Vite** (auto-detected, also pinned in `vercel.json`).
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Install command: `npm install`.

### Important note for this environment

Dependency install is blocked in this execution environment (`npm registry 403`), but Vercel deployment should work in your Vercel project environment where npm registry access is allowed.
