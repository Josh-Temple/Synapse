import { assignMissingSlots } from './slotAssignment'
import { DEFAULT_UNIT_ID } from './utils/studyScope'
import type { Edge, EdgeProgress, GraphData, Unit } from './types'

type DraftCard = {
  title?: unknown
  summary?: unknown
  detail?: unknown
  aliases?: unknown
  unitId?: unknown
  cardType?: unknown
  dateLabel?: unknown
}

type DraftLink = {
  from?: unknown
  to?: unknown
  relationType?: unknown
  reason?: unknown
  cue?: unknown
  importance?: unknown
}

type DraftGraph = {
  title?: unknown
  description?: unknown
}

type DraftUnit = {
  id?: unknown
  title?: unknown
  description?: unknown
  order?: unknown
}

type DraftDeck = {
  graph?: DraftGraph
  units?: DraftUnit[]
  cards?: DraftCard[]
  links?: DraftLink[]
  meta?: unknown
}

export interface ImportReport {
  graphTitle: string
  cardCount: number
  linkCount: number
  errors: string[]
  warnings: string[]
  infos: string[]
}

export interface DraftImportPreview {
  report: ImportReport
  normalizedGraph: GraphData | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const normalizeKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ')

const slugify = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'item'
}

const uniqueId = (base: string, used: Set<string>): string => {
  if (!used.has(base)) {
    used.add(base)
    return base
  }

  let suffix = 2
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1
  }

  const resolved = `${base}-${suffix}`
  used.add(resolved)
  return resolved
}

const createProgress = (edges: Edge[]): EdgeProgress[] =>
  edges.map((edge) => ({ edgeId: edge.id, seenCount: 0, rememberedCount: 0, missedCount: 0 }))

export const buildPreviewFromAiDraft = (raw: unknown): DraftImportPreview => {
  const errors: string[] = []
  const warningsSet = new Set<string>()
  const infos: string[] = []

  if (!isRecord(raw)) {
    return {
      report: {
        graphTitle: 'Untitled graph',
        cardCount: 0,
        linkCount: 0,
        errors: ['Invalid draft: expected an object at the root.'],
        warnings: [],
        infos,
      },
      normalizedGraph: null,
    }
  }

  const deck = raw as DraftDeck
  const graphTitle = toText(deck.graph?.title) || 'Untitled graph'
  const graphDescription = toText(deck.graph?.description)

  const unitIds = new Set<string>()
  const units: Unit[] = (Array.isArray(deck.units) ? deck.units : [])
    .map((unit, index) => ({
      id: toText(unit.id) || slugify(toText(unit.title) || `unit-${index + 1}`),
      title: toText(unit.title) || `Unit ${index + 1}`,
      description: toText(unit.description) || undefined,
      order: typeof unit.order === 'number' ? unit.order : index + 1,
    }))
    .filter((unit) => {
      if (unitIds.has(unit.id)) {
        warningsSet.add(`Duplicate unit id "${unit.id}" ignored.`)
        return false
      }
      unitIds.add(unit.id)
      return true
    })

  if (units.length === 0) units.push({ id: DEFAULT_UNIT_ID, title: 'Default Unit', order: 1 })

  const rawCards = Array.isArray(deck.cards) ? deck.cards : []
  const rawLinks = Array.isArray(deck.links) ? deck.links : []

  const cardIds = new Set<string>()
  const cards: GraphData['cards'] = []
  const titleKeyToCardId = new Map<string, string>()

  rawCards.forEach((card, index) => {
    if (!isRecord(card)) {
      errors.push(`Card at index ${index} must be an object.`)
      return
    }

    const title = toText(card.title)
    if (!title) {
      errors.push(`Card at index ${index} has an empty title.`)
      return
    }

    const titleKey = normalizeKey(title)
    if (titleKeyToCardId.has(titleKey)) {
      errors.push(`Duplicate card title after normalization: "${title}".`)
      return
    }

    const id = uniqueId(slugify(title), cardIds)
    titleKeyToCardId.set(titleKey, id)

    const aliases = Array.isArray(card.aliases)
      ? card.aliases.filter((alias): alias is string => typeof alias === 'string').map((item) => item.trim()).filter(Boolean)
      : []

    aliases.forEach((aliasText) => {
      const aliasKey = normalizeKey(aliasText)
      if (!aliasKey || aliasKey === titleKey) return

      const existingOwnerId = titleKeyToCardId.get(aliasKey)
      if (existingOwnerId && existingOwnerId !== id) {
        warningsSet.add(`Alias "${aliasText}" on card "${title}" overlaps another title or alias and is ignored.`)
        return
      }

      titleKeyToCardId.set(aliasKey, id)
    })

    const summary = toText(card.summary)
    if (!summary) warningsSet.add(`Card "${title}" is missing summary.`)

    const unitId = toText(card.unitId)
    const resolvedUnitId = unitId && unitIds.has(unitId) ? unitId : units[0].id

    cards.push({
      id,
      title,
      summary,
      detail: toText(card.detail),
      aliases,
      unitId: resolvedUnitId,
      cardType: toText(card.cardType) as GraphData['cards'][number]['cardType'],
      dateLabel: toText(card.dateLabel) || undefined,
    })
  })

  const edgeIds = new Set<string>()
  const edges: Edge[] = []

  rawLinks.forEach((link, index) => {
    if (!isRecord(link)) {
      errors.push(`Link at index ${index} must be an object.`)
      return
    }

    const fromRef = toText(link.from)
    const toRef = toText(link.to)
    const fromId = titleKeyToCardId.get(normalizeKey(fromRef))
    const toId = titleKeyToCardId.get(normalizeKey(toRef))

    if (!fromRef || !fromId) {
      errors.push(`Link at index ${index} has unresolved from reference: "${fromRef || '(empty)'}".`)
      return
    }

    if (!toRef || !toId) {
      errors.push(`Link at index ${index} has unresolved to reference: "${toRef || '(empty)'}".`)
      return
    }

    const cue = toText(link.cue)
    if (cue.split(/\s+/).filter(Boolean).length > 3) warningsSet.add(`Link "${fromRef} -> ${toRef}" has a long cue: "${cue}".`)

    const reason = toText(link.reason)
    if (!reason) warningsSet.add(`Link "${fromRef} -> ${toRef}" is missing reason.`)

    const fromCard = cards.find((item) => item.id === fromId)
    const toCard = cards.find((item) => item.id === toId)

    edges.push({
      id: uniqueId(`edge-${edges.length + 1}`, edgeIds),
      from: fromId,
      to: toId,
      reason,
      slot: '',
      cue,
      relationType: toText(link.relationType) || undefined,
      importance: toText(link.importance) === 'core' ? 'core' : 'secondary',
      scope: fromCard && toCard && fromCard.unitId !== toCard.unitId ? 'cross-unit' : 'intra-unit',
    })
  })

  if (!errors.length) {
    const linkedCardIds = new Set<string>()
    edges.forEach((edge) => {
      linkedCardIds.add(edge.from)
      linkedCardIds.add(edge.to)
    })

    cards.forEach((card) => {
      if (!linkedCardIds.has(card.id)) warningsSet.add(`Card "${card.title}" is isolated.`)
    })

    infos.push('Slots are auto-assigned for outgoing links.')
    infos.push('Progress entries are auto-created with zero counts.')
    infos.push('Graph/card/edge IDs are auto-generated from titles.')
  }

  const warnings = Array.from(warningsSet)
  const report: ImportReport = {
    graphTitle,
    cardCount: cards.length,
    linkCount: edges.length,
    errors,
    warnings,
    infos,
  }

  if (errors.length > 0) return { report, normalizedGraph: null }

  const now = new Date().toISOString()
  const graph: GraphData = {
    id: slugify(graphTitle),
    title: graphTitle,
    description: graphDescription,
    units,
    cards,
    edges: assignMissingSlots(edges),
    progress: createProgress(edges),
    createdAt: now,
    updatedAt: now,
  }

  return { report, normalizedGraph: graph }
}

export const ensureUniqueGraphId = (baseId: string, existingIds: Set<string>): string => uniqueId(baseId, existingIds)
