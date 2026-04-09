import { describe, expect, it } from 'vitest'
import { createCardInGraph, createEdgeInGraph, deleteCardInGraph, deleteUnitInGraph, rewireEdgeInGraph } from './graphMutations'
import type { GraphData } from './types'

const baseGraph = (): GraphData => ({
  id: 'g1',
  title: 'Graph',
  units: [{ id: 'u1', title: 'Unit 1', order: 1 }, { id: 'u2', title: 'Unit 2', order: 2 }],
  cards: [
    { id: 'a', title: 'A', summary: '', detail: '', unitId: 'u1' },
    { id: 'b', title: 'B', summary: '', detail: '', unitId: 'u1' },
    { id: 'c', title: 'C', summary: '', detail: '', unitId: 'u2' },
  ],
  edges: [{ id: 'e1', from: 'a', to: 'b', cue: 'cue', reason: 'reason', slot: 'A', scope: 'intra-unit' }],
  progress: [{ edgeId: 'e1', seenCount: 0, rememberedCount: 0, missedCount: 0 }],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
})

describe('graphMutations', () => {
  it('requires unit on card create', () => {
    const bad = createCardInGraph(baseGraph(), { title: 'New', summary: '', detail: '', unitId: '' })
    expect(bad.error).toContain('unit')
  })

  it('derives edge scope on create and rewire', () => {
    const created = createEdgeInGraph(baseGraph(), { from: 'a', to: 'c', cue: 'x', reason: 'y' })
    expect(created.error).toBeUndefined()
    expect(created.graph.edges.find((e) => e.to === 'c')?.scope).toBe('cross-unit')

    const rewired = rewireEdgeInGraph(baseGraph(), 'e1', 'a', 'c')
    expect(rewired.graph.edges[0].scope).toBe('cross-unit')
  })

  it('blocks deleting a unit with cards', () => {
    const result = deleteUnitInGraph(baseGraph(), 'u1')
    expect(result.error).toContain('Cannot delete')
  })

  it('deletes cards and connected progress safely', () => {
    const removed = deleteCardInGraph(baseGraph(), 'a')
    expect(removed.graph.cards.some((card) => card.id === 'a')).toBe(false)
    expect(removed.graph.edges).toHaveLength(0)
    expect(removed.graph.progress).toHaveLength(0)
  })
})
