import { describe, expect, it } from 'vitest'
import { createCardInGraph, createEdgeInGraph, deleteCardInGraph, deleteEdgeInGraph, rewireEdgeInGraph } from './graphMutations'
import type { GraphData } from './types'

const baseGraph = (): GraphData => ({
  id: 'g1',
  title: 'Graph',
  cards: [
    { id: 'a', title: 'A', summary: '', detail: '' },
    { id: 'b', title: 'B', summary: '', detail: '' },
    { id: 'c', title: 'C', summary: '', detail: '' },
  ],
  edges: [{ id: 'e1', from: 'a', to: 'b', cue: 'cue', reason: 'reason', slot: 'A' }],
  progress: [{ edgeId: 'e1', seenCount: 0, rememberedCount: 0, missedCount: 0 }],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
})

describe('graphMutations', () => {
  it('adds and deletes cards safely', () => {
    const added = createCardInGraph(baseGraph(), { title: 'New', summary: '', detail: '' })
    expect(added.error).toBeUndefined()
    expect(added.graph.cards.some((card) => card.title === 'New')).toBe(true)

    const removed = deleteCardInGraph(baseGraph(), 'a')
    expect(removed.graph.cards.some((card) => card.id === 'a')).toBe(false)
    expect(removed.graph.edges).toHaveLength(0)
    expect(removed.graph.progress).toHaveLength(0)
  })

  it('adds and deletes edges with validation', () => {
    const created = createEdgeInGraph(baseGraph(), { from: 'b', to: 'c', cue: 'x', reason: 'y' })
    expect(created.error).toBeUndefined()
    expect(created.graph.edges.some((edge) => edge.from === 'b' && edge.to === 'c')).toBe(true)

    const duplicate = createEdgeInGraph(baseGraph(), { from: 'a', to: 'b', cue: '', reason: '' })
    expect(duplicate.error).toContain('already exists')

    const deleted = deleteEdgeInGraph(baseGraph(), 'e1')
    expect(deleted.graph.edges).toHaveLength(0)
    expect(deleted.graph.progress).toHaveLength(0)
  })

  it('rewires edges safely', () => {
    const rewired = rewireEdgeInGraph(baseGraph(), 'e1', 'a', 'c')
    expect(rewired.error).toBeUndefined()
    expect(rewired.graph.edges[0].to).toBe('c')

    const invalid = rewireEdgeInGraph(baseGraph(), 'e1', 'a', 'a')
    expect(invalid.error).toContain('Self-loop')
  })
})
