import type { Card, Edge, GraphData, LearnState, StudyScope, Unit } from '../types'

export const DEFAULT_UNIT_ID = 'default-unit'

export const sortUnits = (units: Unit[]): Unit[] => [...units].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || a.title.localeCompare(b.title))

export const getPrimaryUnitId = (graph: GraphData): string | null => sortUnits(graph.units ?? [])[0]?.id ?? graph.cards[0]?.unitId ?? null

export const getBridgeNeighborUnitIds = (graph: GraphData, selectedUnitId: string | null): string[] => {
  if (!selectedUnitId) return []
  const cardById = new Map(graph.cards.map((card) => [card.id, card]))
  const ids = new Set<string>()
  graph.edges.forEach((edge) => {
    const fromUnitId = cardById.get(edge.from)?.unitId
    const toUnitId = cardById.get(edge.to)?.unitId
    if (!fromUnitId || !toUnitId || fromUnitId === toUnitId) return
    if (fromUnitId === selectedUnitId) ids.add(toUnitId)
    if (toUnitId === selectedUnitId) ids.add(fromUnitId)
  })
  return [...ids]
}

export const visibleCardsForScope = (
  graph: GraphData,
  scope: StudyScope,
  selectedUnitId: string | null,
  selectedBridgeUnitIds: string[] = [],
): Card[] => {
  if (scope === 'global') return graph.cards
  if (!selectedUnitId) return graph.cards

  if (scope === 'unit') return graph.cards.filter((card) => card.unitId === selectedUnitId)

  const units = new Set([selectedUnitId, ...selectedBridgeUnitIds])
  return graph.cards.filter((card) => units.has(card.unitId))
}

export const visibleEdgesForScope = (
  graph: GraphData,
  scope: StudyScope,
  selectedUnitId: string | null,
  selectedBridgeUnitIds: string[] = [],
): Edge[] => {
  if (scope === 'global') return graph.edges

  const cardById = new Map(graph.cards.map((card) => [card.id, card]))
  if (!selectedUnitId) return graph.edges

  if (scope === 'unit') {
    return graph.edges.filter((edge) => {
      const from = cardById.get(edge.from)
      const to = cardById.get(edge.to)
      return from?.unitId === selectedUnitId && to?.unitId === selectedUnitId
    })
  }

  const allowedUnitIds = new Set([selectedUnitId, ...selectedBridgeUnitIds])
  return graph.edges.filter((edge) => {
    const from = cardById.get(edge.from)
    const to = cardById.get(edge.to)
    if (!from || !to) return false
    if (!allowedUnitIds.has(from.unitId) || !allowedUnitIds.has(to.unitId)) return false
    return from.unitId !== to.unitId || from.unitId === selectedUnitId || to.unitId === selectedUnitId
  })
}

export const outgoingReviewEdgesForCurrentCard = (graph: GraphData, learnState: LearnState): Edge[] => {
  const currentCard = graph.cards.find((card) => card.id === learnState.currentCardId)
  if (!currentCard) return []

  return graph.edges.filter((edge) => {
    if (edge.from !== currentCard.id) return false
    const target = graph.cards.find((card) => card.id === edge.to)
    if (!target) return false

    if (learnState.studyScope === 'unit') return currentCard.unitId === target.unitId
    if (learnState.studyScope === 'bridge') return currentCard.unitId !== target.unitId
    return true
  })
}
