import type { Edge, EdgeProgress, StudyScope } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000
const MIN_MS = 60 * 1000

export const weightEdge = (_edge: Edge, progress?: EdgeProgress): number => {
  if (!progress) return 3
  if (progress.lastResult === 'missed') return 5 + progress.missedCount
  if (progress.seenCount === 0) return 3
  return Math.max(1, 2 - Math.min(progress.rememberedCount, 1))
}

export const weightEdgeForScope = (edge: Edge, scope: StudyScope, progress?: EdgeProgress): number => {
  let weight = weightEdge(edge, progress)
  if (scope === 'bridge' && edge.scope === 'cross-unit' && edge.importance === 'core') {
    weight += 2
  }
  return weight
}

export const computeNextDueAt = (current: EdgeProgress | undefined, result: 'remembered' | 'missed', now = new Date()): string => {
  if (result === 'missed') return new Date(now.getTime() + 10 * MIN_MS).toISOString()

  const rememberedCount = current?.rememberedCount ?? 0
  if (rememberedCount <= 0) return new Date(now.getTime() + DAY_MS).toISOString()
  if (rememberedCount === 1) return new Date(now.getTime() + 3 * DAY_MS).toISOString()
  return new Date(now.getTime() + 7 * DAY_MS).toISOString()
}

export const isDue = (progress: EdgeProgress | undefined, now = new Date()): boolean => {
  if (!progress?.nextDueAt) return true
  return new Date(progress.nextDueAt).getTime() <= now.getTime()
}
