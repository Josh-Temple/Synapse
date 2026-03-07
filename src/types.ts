export type ReviewResult = 'remembered' | 'missed'

export interface Card {
  id: string
  title: string
  summary: string
  detail: string
}

export interface Edge {
  id: string
  from: string
  to: string
  reason: string
  slot: string
  cue: string
}

export interface EdgeProgress {
  edgeId: string
  seenCount: number
  rememberedCount: number
  missedCount: number
  lastResult?: ReviewResult
  lastReviewedAt?: string
}

export interface GraphData {
  id: string
  title: string
  description?: string
  cards: Card[]
  edges: Edge[]
  progress: EdgeProgress[]
  createdAt: string
  updatedAt: string
}

export interface AppData {
  graphs: GraphData[]
}

export interface LearnState {
  graphId: string
  currentCardId: string | null
  revealedDestinationEdgeIds: string[]
  revealedReasonEdgeIds: string[]
  reviewedEdgeResults: Record<string, ReviewResult>
}

export type Mode = 'all' | 'learn'
