import type { GraphData, LearnState } from '../types'
import { getPrimaryUnitId, visibleCardsForScope } from './studyScope'

const randomFrom = <T,>(items: T[]): T | null => {
  if (items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)]
}

export const buildInitialLearnState = (graph: GraphData): LearnState => {
  const selectedUnitId = getPrimaryUnitId(graph)
  const scopeCards = visibleCardsForScope(graph, 'unit', selectedUnitId, [])
  const cardsWithOutgoingEdges = scopeCards.filter((card) =>
    graph.edges.some((edge) => edge.from === card.id && edge.scope !== 'cross-unit'),
  )

  const startCard = randomFrom(cardsWithOutgoingEdges) ?? randomFrom(scopeCards) ?? graph.cards[0] ?? null

  return {
    graphId: graph.id,
    currentCardId: startCard?.id ?? null,
    revealedDestinationEdgeIds: [],
    revealedReasonEdgeIds: [],
    reviewedEdgeResults: {},
    studyScope: 'unit',
    selectedUnitId,
    selectedBridgeUnitIds: [],
    cardQueue: [],
    edgeQueue: [],
  }
}

export const migrateLearnState = (graph: GraphData, state: LearnState | null): LearnState => {
  if (!state || state.graphId !== graph.id) return buildInitialLearnState(graph)

  const selectedUnitId = state.selectedUnitId ?? getPrimaryUnitId(graph)

  return {
    ...state,
    studyScope: state.studyScope ?? 'unit',
    selectedUnitId,
    selectedBridgeUnitIds: state.selectedBridgeUnitIds ?? [],
    cardQueue: state.cardQueue ?? [],
    edgeQueue: state.edgeQueue ?? [],
  }
}

export const toggleIdInList = (list: string[], targetId: string): string[] =>
  list.includes(targetId) ? list.filter((id) => id !== targetId) : [...list, targetId]
