import { assignMissingSlots } from './slotAssignment'
import type { Card, Edge, EdgeProgress, GraphData, Unit } from './types'

export interface MutationResult {
  graph: GraphData
  error?: string
}

const uniqueId = (prefix: string, existing: Set<string>): string => {
  let candidate = `${prefix}-${Date.now()}`
  let index = 2
  while (existing.has(candidate)) {
    candidate = `${prefix}-${Date.now()}-${index}`
    index += 1
  }
  return candidate
}

const normalizeEdges = (edges: Edge[]): Edge[] => assignMissingSlots(edges.map((edge) => ({ ...edge })))

const deriveEdgeScope = (edge: Edge, cards: Card[]): Edge['scope'] => {
  const from = cards.find((card) => card.id === edge.from)
  const to = cards.find((card) => card.id === edge.to)
  return from && to && from.unitId !== to.unitId ? 'cross-unit' : 'intra-unit'
}

const syncProgress = (edges: Edge[], current: EdgeProgress[]): EdgeProgress[] => {
  const currentMap = new Map(current.map((item) => [item.edgeId, item]))
  return edges.map((edge) => currentMap.get(edge.id) ?? { edgeId: edge.id, seenCount: 0, rememberedCount: 0, missedCount: 0 })
}

const edgeExists = (graph: GraphData, from: string, to: string, excludeEdgeId?: string): boolean =>
  graph.edges.some((edge) => edge.id !== excludeEdgeId && edge.from === from && edge.to === to)

export const createUnitInGraph = (graph: GraphData, input: Pick<Unit, 'title'> & Partial<Unit>): MutationResult => {
  if (!input.title?.trim()) return { graph, error: 'Unit title is required.' }
  const units = graph.units ?? []
  const ids = new Set(units.map((unit) => unit.id))
  const id = input.id?.trim() || uniqueId('unit', ids)
  if (ids.has(id)) return { graph, error: 'Unit id already exists.' }
  return { graph: { ...graph, units: [...units, { id, title: input.title.trim(), description: input.description, order: input.order ?? units.length + 1 }] } }
}

export const deleteUnitInGraph = (graph: GraphData, unitId: string): MutationResult => {
  if (graph.cards.some((card) => card.unitId === unitId)) {
    return { graph, error: 'Cannot delete a unit that still has cards.' }
  }
  return { graph: { ...graph, units: (graph.units ?? []).filter((unit) => unit.id !== unitId) } }
}

export const createCardInGraph = (
  graph: GraphData,
  input: Pick<Card, 'title' | 'summary' | 'detail' | 'unitId'> & Partial<Pick<Card, 'cardType' | 'aliases' | 'dateLabel'>>,
): MutationResult => {
  if (!input.title.trim()) return { graph, error: 'Card title is required.' }
  if (!input.unitId) return { graph, error: 'Card unit is required.' }
  const validUnitIds = new Set((graph.units ?? []).map((u) => u.id))
  if (!validUnitIds.has(input.unitId)) return { graph, error: 'Selected unit is not valid.' }

  const cardIds = new Set(graph.cards.map((card) => card.id))
  const nextCard: Card = {
    id: uniqueId('card', cardIds),
    title: input.title.trim(),
    summary: input.summary,
    detail: input.detail,
    unitId: input.unitId,
    cardType: input.cardType,
    aliases: input.aliases ?? [],
    dateLabel: input.dateLabel,
  }

  return { graph: { ...graph, cards: [...graph.cards, nextCard] } }
}

export const deleteCardInGraph = (graph: GraphData, cardId: string): MutationResult => {
  const cards = graph.cards.filter((card) => card.id !== cardId)
  const edges = normalizeEdges(
    graph.edges
      .filter((edge) => edge.from !== cardId && edge.to !== cardId)
      .map((edge) => ({ ...edge, scope: deriveEdgeScope(edge, cards) })),
  )

  return {
    graph: {
      ...graph,
      cards,
      edges,
      progress: syncProgress(edges, graph.progress),
    },
  }
}

export const createEdgeInGraph = (
  graph: GraphData,
  input: Pick<Edge, 'from' | 'to' | 'cue' | 'reason'> & { relationType?: string; importance?: 'core' | 'secondary' },
): MutationResult => {
  if (!input.from || !input.to) return { graph, error: 'Both source and target cards are required.' }
  if (input.from === input.to) return { graph, error: 'Self-loop edges are not supported.' }
  if (edgeExists(graph, input.from, input.to)) return { graph, error: 'An edge with the same source and target already exists.' }

  const cardIds = new Set(graph.cards.map((card) => card.id))
  if (!cardIds.has(input.from) || !cardIds.has(input.to)) return { graph, error: 'Selected cards are not valid.' }

  const edgeIds = new Set(graph.edges.map((edge) => edge.id))
  const edge: Edge = {
    id: uniqueId('edge', edgeIds),
    from: input.from,
    to: input.to,
    cue: input.cue,
    reason: input.reason,
    slot: '',
    relationType: input.relationType?.trim() ? input.relationType.trim() : undefined,
    importance: input.importance ?? 'secondary',
    scope: deriveEdgeScope({ ...(input as Edge), id: '', slot: '' }, graph.cards),
  }

  const edges = normalizeEdges([...graph.edges, edge])
  return {
    graph: {
      ...graph,
      edges,
      progress: syncProgress(edges, graph.progress),
    },
  }
}

export const deleteEdgeInGraph = (graph: GraphData, edgeId: string): MutationResult => {
  const edges = normalizeEdges(graph.edges.filter((edge) => edge.id !== edgeId))
  return {
    graph: {
      ...graph,
      edges,
      progress: syncProgress(edges, graph.progress),
    },
  }
}

export const rewireEdgeInGraph = (graph: GraphData, edgeId: string, from: string, to: string): MutationResult => {
  if (!from || !to) return { graph, error: 'Both source and target cards are required.' }
  if (from === to) return { graph, error: 'Self-loop edges are not supported.' }
  if (edgeExists(graph, from, to, edgeId)) return { graph, error: 'An edge with the same source and target already exists.' }

  const cardIds = new Set(graph.cards.map((card) => card.id))
  if (!cardIds.has(from) || !cardIds.has(to)) return { graph, error: 'Selected cards are not valid.' }

  const edges = normalizeEdges(
    graph.edges.map((edge) =>
      edge.id === edgeId
        ? {
            ...edge,
            from,
            to,
            scope: deriveEdgeScope({ ...edge, from, to }, graph.cards),
          }
        : edge,
    ),
  )

  return {
    graph: {
      ...graph,
      edges,
      progress: syncProgress(edges, graph.progress),
    },
  }
}
