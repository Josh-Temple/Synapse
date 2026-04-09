import { describe, expect, it } from 'vitest'
import type { GraphData, LearnState } from '../types'
import { getBridgeNeighborUnitIds, outgoingReviewEdgesForCurrentCard, visibleCardsForScope, visibleEdgesForScope } from './studyScope'

const graph: GraphData = {
  id: 'g',
  title: 'G',
  units: [{ id: 'u1', title: 'U1' }, { id: 'u2', title: 'U2' }, { id: 'u3', title: 'U3' }],
  cards: [
    { id: 'a', title: 'A', summary: '', detail: '', unitId: 'u1' },
    { id: 'b', title: 'B', summary: '', detail: '', unitId: 'u1' },
    { id: 'c', title: 'C', summary: '', detail: '', unitId: 'u2' },
    { id: 'd', title: 'D', summary: '', detail: '', unitId: 'u3' },
  ],
  edges: [
    { id: 'e1', from: 'a', to: 'b', cue: '', reason: '', slot: 'A', scope: 'intra-unit' },
    { id: 'e2', from: 'a', to: 'c', cue: '', reason: '', slot: 'B', scope: 'cross-unit', importance: 'core' },
    { id: 'e3', from: 'c', to: 'd', cue: '', reason: '', slot: 'A', scope: 'cross-unit' },
  ],
  progress: [],
  createdAt: '',
  updatedAt: '',
}

describe('studyScope selectors', () => {
  it('finds bridge neighbors', () => {
    expect(getBridgeNeighborUnitIds(graph, 'u1')).toEqual(['u2'])
  })

  it('filters visible cards/edges by scope', () => {
    expect(visibleCardsForScope(graph, 'unit', 'u1').map((c) => c.id)).toEqual(['a', 'b'])
    expect(visibleEdgesForScope(graph, 'unit', 'u1').map((e) => e.id)).toEqual(['e1'])
    expect(visibleEdgesForScope(graph, 'bridge', 'u1', ['u2']).map((e) => e.id)).toEqual(['e1', 'e2'])
  })

  it('filters outgoing review edges by study scope', () => {
    const state = {
      graphId: 'g',
      currentCardId: 'a',
      revealedDestinationEdgeIds: [],
      revealedReasonEdgeIds: [],
      reviewedEdgeResults: {},
      selectedUnitId: 'u1',
      selectedBridgeUnitIds: ['u2'],
      studyScope: 'unit',
    } as LearnState

    expect(outgoingReviewEdgesForCurrentCard(graph, state).map((e) => e.id)).toEqual(['e1'])
    expect(outgoingReviewEdgesForCurrentCard(graph, { ...state, studyScope: 'bridge' }).map((e) => e.id)).toEqual(['e2'])
  })
})
