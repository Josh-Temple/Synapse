export type ReviewResult = 'remembered' | 'missed'
export type Mode = 'all' | 'learn'

export type StudyScope = 'unit' | 'bridge' | 'global'
export type LinkScope = 'intra-unit' | 'cross-unit'
export type CardType = 'event' | 'person' | 'concept' | 'institution' | 'text' | 'place'

export interface Unit {
  id: string
  title: string
  description?: string
  order?: number
  parentUnitId?: string
  tags?: string[]
}

export interface Card {
  id: string
  title: string
  summary: string
  detail: string
  unitId: string
  cardType?: CardType
  aliases?: string[]
  dateLabel?: string
}

export interface Edge {
  id: string
  from: string
  to: string
  reason: string
  slot: string
  cue: string
  relationType?: string
  importance?: 'core' | 'secondary'
  scope?: LinkScope
}

export interface EdgeProgress {
  edgeId: string
  seenCount: number
  rememberedCount: number
  missedCount: number
  lastResult?: ReviewResult
  lastReviewedAt?: string
  nextDueAt?: string
  lastStudiedScope?: StudyScope
}

export interface GraphData {
  id: string
  title: string
  description?: string
  units?: Unit[]
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
  studyScope: StudyScope
  selectedUnitId: string | null
  selectedBridgeUnitIds: string[]
  cardQueue?: string[]
  edgeQueue?: string[]
}
