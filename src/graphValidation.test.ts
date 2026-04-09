import { describe, expect, it } from 'vitest'
import { validateAndNormalizeAppData } from './graphValidation'

describe('graphValidation', () => {
  it('migrates legacy graph with synthetic unit and scopes', () => {
    const data = validateAndNormalizeAppData({
      graphs: [{
        id: 'g',
        title: 'legacy',
        cards: [{ id: 'a', title: 'A', summary: '', detail: '' }, { id: 'b', title: 'B', summary: '', detail: '' }],
        edges: [{ id: 'e1', from: 'a', to: 'b', cue: 'x', reason: 'y', slot: 'A' }],
        progress: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }],
    })

    expect(data.graphs[0].units?.length).toBe(1)
    expect(data.graphs[0].cards.every((c) => !!c.unitId)).toBe(true)
    expect(data.graphs[0].edges[0].scope).toBe('intra-unit')
  })

  it('derives cross-unit scope', () => {
    const data = validateAndNormalizeAppData({
      graphs: [{
        id: 'g',
        title: 'new',
        units: [{ id: 'u1', title: 'U1' }, { id: 'u2', title: 'U2' }],
        cards: [
          { id: 'a', title: 'A', summary: '', detail: '', unitId: 'u1' },
          { id: 'b', title: 'B', summary: '', detail: '', unitId: 'u2' },
        ],
        edges: [{ id: 'e1', from: 'a', to: 'b', cue: 'x', reason: 'y', slot: 'A' }],
        progress: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }],
    })

    expect(data.graphs[0].edges[0].scope).toBe('cross-unit')
  })
})
