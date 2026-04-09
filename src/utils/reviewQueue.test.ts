import { describe, expect, it } from 'vitest'
import { computeNextDueAt, weightEdgeForScope } from './reviewQueue'

describe('review queue', () => {
  it('prioritizes missed and bridge core links', () => {
    const edge = { id: 'e', from: 'a', to: 'b', reason: '', cue: '', slot: 'A', scope: 'cross-unit', importance: 'core' } as const
    const missed = weightEdgeForScope(edge, 'bridge', { edgeId: 'e', seenCount: 2, rememberedCount: 0, missedCount: 2, lastResult: 'missed' })
    const remembered = weightEdgeForScope(edge, 'bridge', { edgeId: 'e', seenCount: 2, rememberedCount: 2, missedCount: 0, lastResult: 'remembered' })
    expect(missed).toBeGreaterThan(remembered)
  })

  it('advances due dates with lightweight spacing', () => {
    const now = new Date('2026-04-09T00:00:00Z')
    expect(computeNextDueAt(undefined, 'remembered', now)).toBe('2026-04-10T00:00:00.000Z')
    expect(computeNextDueAt({ edgeId: 'e', seenCount: 1, rememberedCount: 1, missedCount: 0 }, 'remembered', now)).toBe('2026-04-12T00:00:00.000Z')
    expect(computeNextDueAt(undefined, 'missed', now)).toBe('2026-04-09T00:10:00.000Z')
  })
})
