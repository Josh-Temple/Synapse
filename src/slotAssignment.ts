import type { Edge } from './types'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const assignMissingSlots = (edges: Edge[]): Edge[] => {
  const byFrom = new Map<string, Edge[]>()
  edges.forEach((edge) => {
    const group = byFrom.get(edge.from) ?? []
    group.push(edge)
    byFrom.set(edge.from, group)
  })

  byFrom.forEach((group) => {
    const used = new Set(group.map((edge) => edge.slot).filter(Boolean))
    let idx = 0
    group.forEach((edge) => {
      if (edge.slot) return
      while (used.has(alphabet[idx])) idx += 1
      edge.slot = alphabet[idx] ?? `S${idx + 1}`
      used.add(edge.slot)
      idx += 1
    })
  })

  return edges
}
