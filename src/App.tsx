import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { buildPreviewFromAiDraft, ensureUniqueGraphId } from './aiDraftImport'
import { AllModePanel } from './components/AllModePanel'
import { EditPanel } from './components/EditPanel'
import { GraphToolbar } from './components/GraphToolbar'
import { HomePage } from './components/HomePage'
import { LearnModePanel } from './components/LearnModePanel'
import { demoData } from './demoData'
import { validateAndNormalizeAppData } from './graphValidation'
import { applyReview } from './progress'
import {
  loadAppData,
  loadLastGraphId,
  loadLearnState,
  saveAppData,
  saveLastGraphId,
  saveLearnState,
} from './storage'
import './styles.css'
import type { AppData, GraphData, LearnState, Mode, ReviewResult } from './types'
import { buildInitialLearnState, toggleIdInList } from './utils/learnState'

function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData())
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(() => loadLastGraphId() ?? null)
  const [mode, setMode] = useState<Mode>('learn')
  const [importError, setImportError] = useState<string>('')
  const [learnState, setLearnState] = useState<LearnState | null>(() => loadLearnState())
  const [draftPreview, setDraftPreview] = useState<ReturnType<typeof buildPreviewFromAiDraft> | null>(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const selectedGraph = useMemo(
    () => appData.graphs.find((graph) => graph.id === selectedGraphId) ?? null,
    [appData.graphs, selectedGraphId],
  )

  const currentLearnState = useMemo(() => {
    if (!selectedGraph) return null
    if (learnState && learnState.graphId === selectedGraph.id) return learnState
    return buildInitialLearnState(selectedGraph)
  }, [learnState, selectedGraph])

  const setGraphAndPersist = (graphId: string) => {
    setSelectedGraphId(graphId)
    saveLastGraphId(graphId)
  }

  const updateGraph = (graphId: string, updater: (graph: GraphData) => GraphData) => {
    setAppData((current) => {
      const updated = {
        graphs: current.graphs.map((graph) =>
          graph.id === graphId ? { ...updater(graph), updatedAt: new Date().toISOString() } : graph,
        ),
      }
      saveAppData(updated)
      return updated
    })
  }

  const persistLearn = (state: LearnState) => {
    setLearnState(state)
    saveLearnState(state)
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = validateAndNormalizeAppData(JSON.parse(text))

      setAppData(parsed)
      saveAppData(parsed)

      const firstGraph = parsed.graphs[0]
      if (firstGraph) {
        setGraphAndPersist(firstGraph.id)
      }

      setImportError('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed'
      setImportError(message)
    } finally {
      event.target.value = ''
    }
  }

  const handleAiDraftFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const preview = buildPreviewFromAiDraft(parsed)
      setDraftPreview(preview)
      setImportError('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse AI draft.'
      setDraftPreview(null)
      setImportError(`AI draft parse failed: ${message}`)
    } finally {
      event.target.value = ''
    }
  }

  const confirmAiImport = () => {
    if (!draftPreview?.normalizedGraph) return

    const existingIds = new Set(appData.graphs.map((graph) => graph.id))
    const graphId = ensureUniqueGraphId(draftPreview.normalizedGraph.id, existingIds)
    const graphToImport = { ...draftPreview.normalizedGraph, id: graphId }
    const nextData = { graphs: [...appData.graphs, graphToImport] }

    setAppData(nextData)
    saveAppData(nextData)
    setGraphAndPersist(graphId)
    persistLearn(buildInitialLearnState(graphToImport))
    setDraftPreview(null)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'synapse-graphs.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const createNewGraph = () => {
    const now = new Date().toISOString()
    const graphId = `graph-${Date.now()}`

    const nextGraph: GraphData = {
      id: graphId,
      title: 'New Graph',
      description: 'Edit this graph to get started.',
      cards: [{ id: `card-${Date.now()}`, title: 'Start Node', summary: 'Add summary', detail: 'Add detail' }],
      edges: [],
      progress: [],
      createdAt: now,
      updatedAt: now,
    }

    const updatedAppData = { graphs: [...appData.graphs, nextGraph] }
    setAppData(updatedAppData)
    saveAppData(updatedAppData)
    setGraphAndPersist(graphId)
    persistLearn(buildInitialLearnState(nextGraph))
  }

  const loadSampleDeck = () => {
    const sample = demoData.graphs[0]
    const existingIds = new Set(appData.graphs.map((graph) => graph.id))
    const graphId = ensureUniqueGraphId(sample.id, existingIds)
    const now = new Date().toISOString()

    const graphToImport: GraphData = {
      ...sample,
      id: graphId,
      title: `${sample.title} (Sample)`,
      cards: sample.cards.map((card) => ({ ...card })),
      edges: sample.edges.map((edge) => ({ ...edge })),
      progress: sample.progress.map((item) => ({ ...item })),
      createdAt: now,
      updatedAt: now,
    }

    const nextData = { graphs: [...appData.graphs, graphToImport] }
    setAppData(nextData)
    saveAppData(nextData)
    setGraphAndPersist(graphId)
    persistLearn(buildInitialLearnState(graphToImport))
  }

  if (!selectedGraph) {
    return (
      <HomePage
        draftPreview={draftPreview}
        graphs={appData.graphs}
        importError={importError}
        isHelpOpen={isHelpOpen}
        onOpenGraph={setGraphAndPersist}
        onCreateGraph={createNewGraph}
        onImport={handleImport}
        onImportAiDraft={handleAiDraftFile}
        onConfirmAiDraft={confirmAiImport}
        onCancelAiDraft={() => setDraftPreview(null)}
        onExport={handleExport}
        onLoadSampleDeck={loadSampleDeck}
        onToggleHelp={() => setIsHelpOpen((current) => !current)}
      />
    )
  }

  const graph = selectedGraph
  const learn = currentLearnState ?? buildInitialLearnState(graph)
  const outgoingEdges = graph.edges.filter((edge) => edge.from === learn.currentCardId)

  const setCurrentCard = (cardId: string) => {
    persistLearn({
      ...learn,
      currentCardId: cardId,
      revealedDestinationEdgeIds: [],
      revealedReasonEdgeIds: [],
      reviewedEdgeResults: {},
    })
  }

  const revealAll = (kind: 'dest' | 'reason') => {
    const outgoingEdgeIds = outgoingEdges.map((edge) => edge.id)
    if (kind === 'dest') {
      persistLearn({ ...learn, revealedDestinationEdgeIds: outgoingEdgeIds })
      return
    }

    persistLearn({ ...learn, revealedReasonEdgeIds: outgoingEdgeIds })
  }

  const markResult = (edgeId: string, result: ReviewResult) => {
    const currentProgress = graph.progress.find((item) => item.edgeId === edgeId)
    const nextProgress = applyReview(currentProgress, edgeId, result)

    updateGraph(graph.id, (target) => ({
      ...target,
      progress: [...target.progress.filter((item) => item.edgeId !== edgeId), nextProgress],
    }))

    persistLearn({
      ...learn,
      reviewedEdgeResults: { ...learn.reviewedEdgeResults, [edgeId]: result },
    })
  }

  const updateCard = (cardId: string, field: 'title' | 'summary' | 'detail', value: string) => {
    updateGraph(graph.id, (target) => ({
      ...target,
      cards: target.cards.map((card) => (card.id === cardId ? { ...card, [field]: value } : card)),
    }))
  }

  const updateEdge = (edgeId: string, field: 'cue' | 'reason' | 'slot' | 'relationType', value: string) => {
    updateGraph(graph.id, (target) => ({
      ...target,
      edges: target.edges.map((edge) =>
        edge.id === edgeId
          ? { ...edge, [field]: field === 'relationType' && value.trim() === '' ? undefined : value }
          : edge,
      ),
    }))
  }

  const updateGraphField = (field: 'title' | 'description', value: string) => {
    updateGraph(graph.id, (target) => ({ ...target, [field]: value }))
  }

  return (
    <main className="container wide">
      <GraphToolbar
        graph={graph}
        mode={mode}
        onGoHome={() => setSelectedGraphId(null)}
        onToggleMode={() => setMode((current) => (current === 'all' ? 'learn' : 'all'))}
        onRandomStart={() => persistLearn(buildInitialLearnState(graph))}
        onResumeLastCard={() => {
          const last = loadLearnState()
          if (last && last.graphId === graph.id) {
            persistLearn(last)
          }
        }}
      />

      {mode === 'all' ? (
        <AllModePanel graph={graph} />
      ) : (
        <LearnModePanel
          cards={graph.cards}
          outgoingEdges={outgoingEdges}
          learnState={learn}
          onRevealAllDestinations={() => revealAll('dest')}
          onRevealAllReasons={() => revealAll('reason')}
          onToggleDestinationReveal={(edgeId) =>
            persistLearn({
              ...learn,
              revealedDestinationEdgeIds: toggleIdInList(learn.revealedDestinationEdgeIds, edgeId),
            })
          }
          onToggleReasonReveal={(edgeId) =>
            persistLearn({
              ...learn,
              revealedReasonEdgeIds: toggleIdInList(learn.revealedReasonEdgeIds, edgeId),
            })
          }
          onMarkResult={markResult}
          onFollowEdge={(edge) => setCurrentCard(edge.to)}
        />
      )}

      <EditPanel
        graph={graph}
        onUpdateGraphField={updateGraphField}
        onUpdateCard={updateCard}
        onUpdateEdge={updateEdge}
      />
    </main>
  )
}

export default App
