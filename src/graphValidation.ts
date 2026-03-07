import { assignMissingSlots } from './slotAssignment'
import type { AppData, Edge, EdgeProgress, GraphData } from './types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const createProgressMap = (progress: EdgeProgress[] = []): Map<string, EdgeProgress> =>
  new Map(progress.map((item) => [item.edgeId, item]))

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
  const slotsBySource = new Map<string, Set<string>>()

  graph.cards.forEach((card) => {
    if (cardIds.has(card.id)) {
      throw new Error(`Duplicate card id: ${card.id}`)
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
  const normalizedEdges = assignMissingSlots(graph.edges.map((edge) => ({ ...edge })))

  const normalizedGraph: GraphData = {
    ...graph,
    cards: graph.cards.map((card) => ({ ...card })),
    edges: normalizedEdges,
    progress: normalizeProgress(normalizedEdges, graph.progress ?? []),
    updatedAt: new Date().toISOString(),
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
