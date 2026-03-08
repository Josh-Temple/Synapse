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
- AI draft deck import with preview, validation, and app-side normalization
- Lightweight editing for graph/card/edge text fields
- relationType-aware display in All/Learn mode and light edit panel

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

## In-app workflow (provider-agnostic)

Synapse is designed for concept-network learning (history, religion, philosophy, psychology, AI/CS, statistics), and now exposes this flow directly in-app:

1. Open **Start here / How to use**.
2. Generate or write a draft deck (NotebookLM, GPTs, Gems, ChatGPT, Gemini, or manual).
3. Import via **Import AI Draft**.
4. Review links in **Learn mode** using slot + cue.
5. Refine graph text over time.

You can also load a built-in sample deck from Home with **Load sample deck**.

## AI-generated deck workflow

Synapse is provider-agnostic. External tools can generate a **draft**, and Synapse converts it into the app’s official graph format.

Typical workflow example:

1. Put your existing deck, notes, and source material into NotebookLM (or a similar reference-heavy tool).
2. Ask it to identify missing concepts, missing links, or bridge concepts.
3. Ask GPTs/Gems/ChatGPT/Gemini to format the result into Synapse draft JSON.
4. Import the draft into Synapse.
5. Study and iteratively refine.

This is a recommendation, not a dependency: Synapse has no direct integration with these tools.

## Draft deck spec (AI draft import v1)

Draft shape (IDs/progress not required):

```json
{
  "graph": {
    "title": "Theravada Buddhism Basics",
    "description": "Core concepts and relationships"
  },
  "cards": [
    {
      "title": "Four Noble Truths",
      "summary": "Framework of suffering and liberation.",
      "detail": "Optional longer explanation.",
      "aliases": ["四聖諦"]
    }
  ],
  "links": [
    {
      "from": "Four Noble Truths",
      "to": "Craving",
      "relationType": "causes",
      "reason": "Craving is presented as a cause of suffering.",
      "cue": "cause"
    }
  ],
  "meta": {
    "generator": "ai",
    "topic": "Theravada Buddhism"
  }
}
```

### Field expectations

- `graph.title`, `graph.description`
- `cards[].title`, `cards[].summary`, `cards[].detail`, `cards[].aliases`
- `links[].from`, `links[].to`, `links[].relationType`, `links[].reason`, `links[].cue`
  - `relationType` is optional, stored, and displayed in app panels
- `meta` is optional passthrough context

### Importer behavior

During AI draft import, Synapse automatically:

- Generates graph/card/edge IDs
- Resolves duplicate slug IDs with suffixes
- Resolves `from`/`to` by card title or aliases
- Auto-assigns unique outgoing slots
- Auto-creates progress entries with zero counts
- Auto-fills `createdAt` / `updatedAt`

## AI draft validation + preview

Before import confirmation, Synapse shows a preview with title, card/link counts, errors, warnings, and import notes.

- **Errors (block import):**
  - empty card title
  - duplicate card titles after normalization
  - unresolved `from`/`to` references
- **Warnings (import allowed):**
  - cue too long
  - isolated cards
  - missing summary
  - missing reason
  - alias overlapping another title/alias (ignored)
- **Infos:**
  - slots auto-assigned
  - progress auto-created
  - IDs auto-generated

## Guidance for AI-generated content

- 1 card = 1 concept
- Avoid duplicate concepts
- Keep concept granularity consistent
- Use short concrete cues (prefer 1–3 words)
- Avoid uncertain/low-confidence links
- Keep drafts human-readable and editable

## Import / export format (full AppData)

The app still imports/exports the normalized full payload:

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

Validation on full import:

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

## MVP limitations

- No authentication or backend
- No cloud sync
- No advanced spaced repetition
- No collaborative editing
- No direct NotebookLM/GPTs/Gems API integration
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
