# Synapse MVP

Synapse is a local-first history/concept learning app for **relationship recall**.

The app keeps two axes active at all times:
- **Mode axis**: `all` / `learn`
- **Scope axis**: `unit` / `bridge` / `global`

Learn mode remains the center of gravity; graph visuals support retrieval practice.

## What changed in this version

- Added scope-aware study model: **Unit / Bridge / Global** without replacing All/Learn.
- Added unit-aware data model (`units`, `card.unitId`, edge `scope`, edge `importance`, card type/date/aliases).
- Added backward-compatible normalization for legacy graphs without units.
- Added lightweight due scheduling (`nextDueAt`) with simple local rules.
- Expanded sample graph to **Age of Revolutions** with 4 units and cross-unit bridges.

## Scope behavior

1. **All × Unit**: show selected unit only.
2. **Learn × Unit**: review intra-unit links (default).
3. **All × Bridge**: selected unit + neighboring units; cross-unit edges emphasized.
4. **Learn × Bridge**: review cross-unit links only.
5. **All × Global**: full graph with lightweight readability.
6. **Learn × Global**: full outgoing set; missed links naturally surface via weighting.

## AI draft schema (v2)

Draft import remains tolerant. Optional fields are accepted and normalized:

```json
{
  "graph": { "title": "Age of Revolutions" },
  "units": [{ "id": "enlightenment", "title": "Enlightenment" }],
  "cards": [
    {
      "title": "Montesquieu",
      "summary": "Separation of powers thinker",
      "unitId": "enlightenment",
      "cardType": "person",
      "dateLabel": "1689–1755",
      "aliases": ["Charles de Montesquieu"]
    }
  ],
  "links": [
    {
      "from": "Montesquieu",
      "to": "Separation of Powers",
      "cue": "key idea",
      "reason": "He articulates institutional balancing",
      "relationType": "articulates",
      "importance": "core"
    }
  ]
}
```

If units are omitted, the app creates a synthetic default unit and keeps old data valid.

## Local setup

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test
npm run build
```

## Product boundaries

- No backend/auth/sync
- No multi-user features
- No graph-engine migration
- No full advanced SRS (only lightweight due scheduling)
- No heavy visual graph tooling
