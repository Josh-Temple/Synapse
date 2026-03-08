import { describe, expect, it } from 'vitest'
import { buildPreviewFromAiDraft, ensureUniqueGraphId } from './aiDraftImport'

describe('buildPreviewFromAiDraft', () => {
  it('normalizes valid draft and creates progress/slots', () => {
    const preview = buildPreviewFromAiDraft({
      graph: { title: 'Theravada Buddhism Basics', description: 'Core concepts and relationships' },
      cards: [
        { title: 'Four Noble Truths', summary: 'Framework', aliases: ['四聖諦'] },
        { title: 'Craving', summary: 'Cause of suffering' },
      ],
      links: [
        {
          from: '四聖諦',
          to: 'Craving',
          cue: 'cause',
          reason: 'Craving is a cause of suffering',
          relationType: 'causes',
        },
      ],
    })

    expect(preview.report.errors).toHaveLength(0)
    expect(preview.normalizedGraph).not.toBeNull()
    expect(preview.normalizedGraph?.id).toBe('theravada-buddhism-basics')
    expect(preview.normalizedGraph?.edges[0].slot).toBe('A')
    expect(preview.normalizedGraph?.edges[0].relationType).toBe('causes')
    expect(preview.normalizedGraph?.progress).toEqual([
      {
        edgeId: preview.normalizedGraph?.edges[0].id,
        seenCount: 0,
        rememberedCount: 0,
        missedCount: 0,
      },
    ])
  })

  it('blocks import when links reference unknown cards', () => {
    const preview = buildPreviewFromAiDraft({
      graph: { title: 'Test' },
      cards: [{ title: 'A', summary: 'A summary' }],
      links: [{ from: 'A', to: 'Missing', cue: 'bad ref' }],
    })

    expect(preview.normalizedGraph).toBeNull()
    expect(preview.report.errors.some((item) => item.includes('unresolved to reference'))).toBe(true)
  })

  it('warns on alias overlap and keeps canonical title mapping', () => {
    const preview = buildPreviewFromAiDraft({
      graph: { title: 'Aliases' },
      cards: [
        { title: 'Middle Way', summary: 'Path' },
        { title: 'Eightfold Path', summary: 'Practice', aliases: ['Middle Way'] },
      ],
      links: [
        { from: 'Middle Way', to: 'Eightfold Path', cue: 'related', reason: 'Related concepts' },
      ],
    })

    expect(preview.report.errors).toHaveLength(0)
    expect(preview.report.warnings.some((item) => item.includes('overlaps another title or alias'))).toBe(true)
    expect(preview.normalizedGraph?.edges[0].from).toBe('middle-way')
  })

  it('warns for missing summary, missing reason, long cue, and isolated cards', () => {
    const preview = buildPreviewFromAiDraft({
      graph: { title: 'Warnings' },
      cards: [{ title: 'A' }, { title: 'B', summary: 'ok' }, { title: 'C', summary: 'isolated' }],
      links: [{ from: 'A', to: 'B', cue: 'this cue is too long' }],
    })

    expect(preview.report.errors).toHaveLength(0)
    expect(preview.report.warnings.some((item) => item.includes('missing summary'))).toBe(true)
    expect(preview.report.warnings.some((item) => item.includes('missing reason'))).toBe(true)
    expect(preview.report.warnings.some((item) => item.includes('long cue'))).toBe(true)
    expect(preview.report.warnings.some((item) => item.includes('is isolated'))).toBe(true)
  })
})

describe('ensureUniqueGraphId', () => {
  it('adds numeric suffix when id already exists', () => {
    const existing = new Set(['graph-id', 'graph-id-2'])
    expect(ensureUniqueGraphId('graph-id', existing)).toBe('graph-id-3')
  })
})
