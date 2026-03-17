# Synapse MVP

Synapse is a local-first concept-learning app for **remembering relationships between ideas**.

The graph view supports understanding, but the core value is the learning loop in **Learn mode**: recall links with slot + cue prompts, reveal answers, and mark remembered/missed.

## Core value

- Learn concept connections, not just store notes.
- Review links through active recall.
- Iterate imported AI-generated decks into higher-quality study graphs.

## Good fit / less ideal

- **Good fit:** history, religion, philosophy, psychology, AI/CS, statistics.
- **Less ideal:** pure vocabulary drilling, long-form memorization, freeform brainstorming.

## What it does

- Directed graph model (`cards`, `edges`, `progress`)
- Two modes:
  - **All mode**: lightweight overview + selected-concept detail panel
  - **Learn mode**: primary study loop using slot + cue recall
- Edge-level review outcomes (`remembered` / `missed`)
- Local persistence via `localStorage` (with a storage abstraction prepared for future IndexedDB migration)
- JSON import/export with validation, preview, and safer replace/merge flows
- Automatic backup snapshot before Replace import + restore-last-backup action
- AI draft deck import with preview, validation, and app-side normalization
- In-app graph editing primitives: create/delete cards, create/delete edges, safe edge rewiring with card-title dropdowns
- relationType-aware display in All/Learn mode and edit panel
- All mode readability helpers: 1-hop/2-hop focus and concept search
- Graph-level progress summary (reviewed/remembered/missed/untouched)

## Stack

- React + TypeScript + Vite
- Lightweight custom CSS
- No backend (current philosophy)

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

1. Start from **Load sample deck** or **Import AI Draft**.
2. Use **All mode** to inspect one selected concept and its incoming/outgoing links.
3. Use **Learn mode** to recall destinations/reasons from slot + cue hints.
4. Refine card/edge wording over time.

Synapse is provider-agnostic and local-first. NotebookLM, GPTs, Gems, ChatGPT, Gemini, or manual authoring can all be used as external draft sources.

## AI-generated deck workflow

Synapse accepts AI output as a **draft** and normalizes it into the strict internal graph format.

Typical workflow:

1. Use external tools to discover candidate concepts and links.
2. Format that output into Synapse draft JSON.
3. Import via **Import AI Draft**.
4. Validate preview, then confirm import.
5. Study and iteratively refine.

## Draft deck spec (AI draft import v1)

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

## Safer full import flow

1. Select **Import full JSON**.
2. Review preview (graph/card/edge counts + graph titles).
3. Choose mode:
   - **Merge** (default, safer): imported graphs are appended; ID conflicts are auto-renamed.
   - **Replace**: replace all current data after automatic backup snapshot.
4. Use **Restore last backup** to recover from an accidental replace.

## Import / export format (full AppData)

The app still imports/exports normalized full payload:

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

## MVP limitations

- No authentication or backend
- No cloud sync
- No advanced spaced repetition
- No collaborative editing
- No direct NotebookLM/GPTs/Gems API integration
- Graph rendering remains intentionally lightweight

## Deploy to Vercel

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite to `/index.html`
