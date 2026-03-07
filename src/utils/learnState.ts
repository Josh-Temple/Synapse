import type { GraphData, LearnState } from '../types'

const randomFrom = <T,>(items: T[]): T | null => {
  if (items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)]
}

export const buildInitialLearnState = (graph: GraphData): LearnState => {
  const cardsWithOutgoingEdges = graph.cards.filter((card) =>
    graph.edges.some((edge) => edge.from === card.id),
  )

  const startCard = randomFrom(cardsWithOutgoingEdges) ?? graph.cards[0] ?? null

  return {
    graphId: graph.id,
    currentCardId: startCard?.id ?? null,
    revealedDestinationEdgeIds: [],
    revealedReasonEdgeIds: [],
    reviewedEdgeResults: {},
  }
}

export const toggleIdInList = (list: string[], targetId: string): string[] =>
  list.includes(targetId) ? list.filter((id) => id !== targetId) : [...list, targetId]
