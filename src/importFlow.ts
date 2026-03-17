import { ensureUniqueGraphId } from './aiDraftImport'
import type { AppData, GraphData } from './types'

export type FullImportMode = 'merge' | 'replace'

export interface FullImportPreview {
  graphCount: number
  cardCount: number
  edgeCount: number
  graphTitles: string[]
  data: AppData
}

export const buildFullImportPreview = (data: AppData): FullImportPreview => ({
  graphCount: data.graphs.length,
  cardCount: data.graphs.reduce((total, graph) => total + graph.cards.length, 0),
  edgeCount: data.graphs.reduce((total, graph) => total + graph.edges.length, 0),
  graphTitles: data.graphs.map((graph) => graph.title),
  data,
})

const cloneGraph = (graph: GraphData): GraphData => ({
  ...graph,
  cards: graph.cards.map((card) => ({ ...card })),
  edges: graph.edges.map((edge) => ({ ...edge })),
  progress: graph.progress.map((item) => ({ ...item })),
})

export const mergeAppData = (existing: AppData, imported: AppData): AppData => {
  const ids = new Set(existing.graphs.map((graph) => graph.id))
  const merged = [...existing.graphs.map(cloneGraph)]

  imported.graphs.forEach((graph) => {
    const id = ensureUniqueGraphId(graph.id, ids)
    ids.add(id)
    merged.push(cloneGraph({ ...graph, id }))
  })

  return { graphs: merged }
}
