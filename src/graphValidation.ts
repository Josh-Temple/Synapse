import { assignMissingSlots } from './slotAssignment'
import { DEFAULT_UNIT_ID } from './utils/studyScope'
import type { AppData, Edge, EdgeProgress, GraphData, Unit } from './types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const createProgressMap = (progress: EdgeProgress[] = []): Map<string, EdgeProgress> =>
  new Map(progress.map((item) => [item.edgeId, item]))

const ensureUnits = (graph: GraphData): Unit[] => {
  const incoming = graph.units ?? []
  if (incoming.length === 0) {
    return [{ id: DEFAULT_UNIT_ID, title: 'Default Unit', description: 'Auto-generated for legacy graph.', order: 1 }]
  }

  const ids = new Set<string>()
  return incoming.map((unit, index) => {
    if (ids.has(unit.id)) throw new Error(`Duplicate unit id: ${unit.id}`)
    ids.add(unit.id)
    return {
      ...unit,
      order: unit.order ?? index + 1,
    }
  })
}

const normalizeCards = (graph: GraphData, units: Unit[]) => {
  const validUnitIds = new Set(units.map((u) => u.id))
  const defaultUnitId = units[0]?.id ?? DEFAULT_UNIT_ID
  return graph.cards.map((card) => {
    const incomingUnitId = (card as GraphData['cards'][number] & { unitId?: string }).unitId
    const unitId = incomingUnitId && validUnitIds.has(incomingUnitId) ? incomingUnitId : defaultUnitId
    return {
      ...card,
      unitId,
      aliases: card.aliases ?? [],
      cardType: card.cardType,
      dateLabel: card.dateLabel,
    }
  })
}

const normalizeEdges = (graph: GraphData, cards: GraphData['cards']): Edge[] => {
  const cardsById = new Map(cards.map((card) => [card.id, card]))
  return assignMissingSlots(graph.edges.map((edge) => {
    const fromCard = cardsById.get(edge.from)
    const toCard = cardsById.get(edge.to)
    const derivedScope = fromCard && toCard && fromCard.unitId !== toCard.unitId ? 'cross-unit' : 'intra-unit'
    return {
      ...edge,
      scope: edge.scope ?? derivedScope,
      importance: edge.importance ?? 'secondary',
      relationType: edge.relationType?.trim() ? edge.relationType : undefined,
    }
  }))
}

const normalizeProgress = (edges: Edge[], progress: EdgeProgress[]): EdgeProgress[] => {
  const existingProgress = createProgressMap(progress)

  return edges.map((edge) => {
    const current = existingProgress.get(edge.id)

    return (
      current ?? {
        edgeId: edge.id,
        seenCount: 0,
        rememberedCount: 0,
        missedCount: 0,
      }
    )
  })
}

const validateGraph = (graph: GraphData): void => {
  const cardIds = new Set<string>()
  const edgeIds = new Set<string>()
  const unitIds = new Set<string>((graph.units ?? []).map((u) => u.id))
  const slotsBySource = new Map<string, Set<string>>()

  graph.cards.forEach((card) => {
    if (cardIds.has(card.id)) {
      throw new Error(`Duplicate card id: ${card.id}`)
    }
    if (!unitIds.has(card.unitId)) {
      throw new Error(`Card ${card.id} has unknown unit id: ${card.unitId}`)
    }
    cardIds.add(card.id)
  })

  graph.edges.forEach((edge) => {
    if (edgeIds.has(edge.id)) {
      throw new Error(`Duplicate edge id: ${edge.id}`)
    }
    edgeIds.add(edge.id)

    if (!cardIds.has(edge.from)) {
      throw new Error(`Edge ${edge.id} has unknown from card: ${edge.from}`)
    }

    if (!cardIds.has(edge.to)) {
      throw new Error(`Edge ${edge.id} has unknown to card: ${edge.to}`)
    }

    const sourceSlots = slotsBySource.get(edge.from) ?? new Set<string>()
    if (sourceSlots.has(edge.slot)) {
      throw new Error(`Duplicate slot '${edge.slot}' for outgoing edges from card: ${edge.from}`)
    }

    sourceSlots.add(edge.slot)
    slotsBySource.set(edge.from, sourceSlots)
  })
}

const normalizeGraph = (graph: GraphData): GraphData => {
  const units = ensureUnits(graph)
  const cards = normalizeCards(graph, units)
  const edges = normalizeEdges(graph, cards)

  const normalizedGraph: GraphData = {
    ...graph,
    units,
    cards,
    edges,
    progress: normalizeProgress(edges, graph.progress ?? []),
    updatedAt: graph.updatedAt || new Date().toISOString(),
  }

  validateGraph(normalizedGraph)
  return normalizedGraph
}

export const validateAndNormalizeAppData = (raw: unknown): AppData => {
  if (!isRecord(raw) || !Array.isArray(raw.graphs)) {
    throw new Error('Invalid JSON: expected { graphs: [...] }.')
  }

  const graphs = raw.graphs as GraphData[]
  return {
    graphs: graphs.map((graph) => normalizeGraph(graph)),
  }
}
