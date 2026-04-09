import { computeNextDueAt } from './utils/reviewQueue'
import type { EdgeProgress, ReviewResult, StudyScope } from './types'

export const getEdgeStrength = (progress?: EdgeProgress): number => {
  if (!progress || progress.seenCount === 0) return 0
  return progress.rememberedCount / Math.max(progress.seenCount, 1)
}

export const applyReview = (
  current: EdgeProgress | undefined,
  edgeId: string,
  result: ReviewResult,
  scope?: StudyScope,
): EdgeProgress => {
  const now = new Date()

  return {
    edgeId,
    seenCount: (current?.seenCount ?? 0) + 1,
    rememberedCount: (current?.rememberedCount ?? 0) + (result === 'remembered' ? 1 : 0),
    missedCount: (current?.missedCount ?? 0) + (result === 'missed' ? 1 : 0),
    lastResult: result,
    lastReviewedAt: now.toISOString(),
    nextDueAt: computeNextDueAt(current, result, now),
    lastStudiedScope: scope,
  }
}
