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
import {
  createCardInGraph,
  createEdgeInGraph,
  createUnitInGraph,
  deleteCardInGraph,
  deleteEdgeInGraph,
  deleteUnitInGraph,
  rewireEdgeInGraph,
} from './graphMutations'
import { buildFullImportPreview, mergeAppData } from './importFlow'
import { applyReview } from './progress'
import {
  loadAppData,
  loadImportBackup,
  loadLastGraphId,
  loadLearnState,
  saveAppData,
  saveImportBackup,
  saveLastGraphId,
  saveLearnState,
} from './storage'
import './styles.css'
import type { AppData, GraphData, LearnState, Mode, ReviewResult, StudyScope } from './types'
import { migrateLearnState, toggleIdInList } from './utils/learnState'
import {
  getBridgeNeighborUnitIds,
  outgoingReviewEdgesForCurrentCard,
  visibleCardsForScope,
  visibleEdgesForScope,
} from './utils/studyScope'

function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData())
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(() => loadLastGraphId() ?? null)
  const [mode, setMode] = useState<Mode>('learn')
  const [importError, setImportError] = useState<string>('')
  const [learnState, setLearnState] = useState<LearnState | null>(() => loadLearnState())
  const [draftPreview, setDraftPreview] = useState<ReturnType<typeof buildPreviewFromAiDraft> | null>(null)
  const [fullImportPreview, setFullImportPreview] = useState<ReturnType<typeof buildFullImportPreview> | null>(null)
  const [fullImportMode, setFullImportMode] = useState<'merge' | 'replace'>('merge')
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [scope, setScope] = useState<StudyScope>('unit')
  const [surface, setSurface] = useState<'study' | 'edit'>('study')

  const selectedGraph = useMemo(() => appData.graphs.find((graph) => graph.id === selectedGraphId) ?? null, [appData.graphs, selectedGraphId])

  const currentLearnState = useMemo(() => {
    if (!selectedGraph) return null
    return migrateLearnState(selectedGraph, learnState)
  }, [learnState, selectedGraph])

  const setGraphAndPersist = (graphId: string) => {
    setSelectedGraphId(graphId)
    setSurface('study')
    saveLastGraphId(graphId)
  }

  const updateGraph = (graphId: string, updater: (graph: GraphData) => GraphData) => {
    setAppData((current) => {
      const updated = {
        graphs: current.graphs.map((graph) => (graph.id === graphId ? { ...updater(graph), updatedAt: new Date().toISOString() } : graph)),
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
      setFullImportPreview(buildFullImportPreview(parsed))
      setFullImportMode('merge')
      setImportError('')
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed')
      setFullImportPreview(null)
    } finally {
      event.target.value = ''
    }
  }

  const confirmFullImport = () => {
    if (!fullImportPreview) return
    const nextData = fullImportMode === 'merge' ? mergeAppData(appData, fullImportPreview.data) : fullImportPreview.data
    if (fullImportMode === 'replace') saveImportBackup(appData)
    setAppData(nextData)
    saveAppData(nextData)
    const firstGraph = nextData.graphs[0]
    if (firstGraph) setGraphAndPersist(firstGraph.id)
    setFullImportPreview(null)
  }

  const restoreLastBackup = () => {
    const backup = loadImportBackup()
    if (!backup) return setImportError('No backup snapshot found. Run a Replace import first.')
    setAppData(backup)
    saveAppData(backup)
    if (backup.graphs[0]) setGraphAndPersist(backup.graphs[0].id)
    setImportError('')
  }

  const handleAiDraftFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const preview = buildPreviewFromAiDraft(JSON.parse(await file.text()))
      setDraftPreview(preview)
      setImportError('')
    } catch (error) {
      setDraftPreview(null)
      setImportError(`AI draft parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      event.target.value = ''
    }
  }

  const confirmAiImport = () => {
    if (!draftPreview?.normalizedGraph) return
    const graphId = ensureUniqueGraphId(draftPreview.normalizedGraph.id, new Set(appData.graphs.map((graph) => graph.id)))
    const graphToImport = { ...draftPreview.normalizedGraph, id: graphId }
    const nextData = { graphs: [...appData.graphs, graphToImport] }
    setAppData(nextData)
    saveAppData(nextData)
    setGraphAndPersist(graphId)
    persistLearn(migrateLearnState(graphToImport, null))
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
    const unitId = `unit-${Date.now()}`
    const nextGraph: GraphData = {
      id: graphId,
      title: 'New Graph',
      description: 'Edit this graph to get started.',
      units: [{ id: unitId, title: 'Unit 1', order: 1 }],
      cards: [{ id: `card-${Date.now()}`, title: 'Start Node', summary: 'Add summary', detail: 'Add detail', unitId, cardType: 'concept' }],
      edges: [],
      progress: [],
      createdAt: now,
      updatedAt: now,
    }
    const updatedAppData = { graphs: [...appData.graphs, nextGraph] }
    setAppData(updatedAppData)
    saveAppData(updatedAppData)
    setGraphAndPersist(graphId)
    persistLearn(migrateLearnState(nextGraph, null))
  }

  const loadSampleDeck = () => {
    const sample = demoData.graphs[0]
    const graphId = ensureUniqueGraphId(sample.id, new Set(appData.graphs.map((graph) => graph.id)))
    const now = new Date().toISOString()
    const graphToImport: GraphData = {
      ...sample,
      id: graphId,
      title: `${sample.title} (Sample)`,
      cards: sample.cards.map((card) => ({ ...card })),
      units: sample.units?.map((unit) => ({ ...unit })),
      edges: sample.edges.map((edge) => ({ ...edge })),
      progress: sample.progress.map((item) => ({ ...item })),
      createdAt: now,
      updatedAt: now,
    }
    const nextData = { graphs: [...appData.graphs, graphToImport] }
    setAppData(nextData)
    saveAppData(nextData)
    setGraphAndPersist(graphId)
    persistLearn(migrateLearnState(graphToImport, null))
  }

  if (!selectedGraph) {
    return <HomePage
      draftPreview={draftPreview}
      fullImportMode={fullImportMode}
      fullImportPreview={fullImportPreview}
      graphs={appData.graphs}
      importError={importError}
      isHelpOpen={isHelpOpen}
      onOpenGraph={setGraphAndPersist}
      onCreateGraph={createNewGraph}
      onImport={handleImport}
      onImportAiDraft={handleAiDraftFile}
      onConfirmAiDraft={confirmAiImport}
      onCancelAiDraft={() => setDraftPreview(null)}
      onConfirmFullImport={confirmFullImport}
      onCancelFullImport={() => setFullImportPreview(null)}
      onChangeFullImportMode={setFullImportMode}
      onRestoreLastBackup={restoreLastBackup}
      onExport={handleExport}
      onLoadSampleDeck={loadSampleDeck}
      onToggleHelp={() => setIsHelpOpen((current) => !current)}
    />
  }

  const graph = selectedGraph
  const learn = currentLearnState ?? migrateLearnState(graph, null)
  const bridgeUnits = learn.selectedBridgeUnitIds.length ? learn.selectedBridgeUnitIds : getBridgeNeighborUnitIds(graph, learn.selectedUnitId)
  const visibleCards = visibleCardsForScope(graph, scope, learn.selectedUnitId, bridgeUnits)
  const visibleEdges = visibleEdgesForScope(graph, scope, learn.selectedUnitId, bridgeUnits)
  const reviewEdges = outgoingReviewEdgesForCurrentCard(graph, { ...learn, studyScope: scope, selectedBridgeUnitIds: bridgeUnits })

  const setCurrentCard = (cardId: string) => persistLearn({ ...learn, currentCardId: cardId, revealedDestinationEdgeIds: [], revealedReasonEdgeIds: [], reviewedEdgeResults: {} })

  const revealAll = (kind: 'dest' | 'reason') => {
    const ids = reviewEdges.map((edge) => edge.id)
    persistLearn({ ...learn, studyScope: scope, revealedDestinationEdgeIds: kind === 'dest' ? ids : learn.revealedDestinationEdgeIds, revealedReasonEdgeIds: kind === 'reason' ? ids : learn.revealedReasonEdgeIds })
  }

  const markResult = (edgeId: string, result: ReviewResult) => {
    const currentProgress = graph.progress.find((item) => item.edgeId === edgeId)
    const nextProgress = applyReview(currentProgress, edgeId, result, scope)
    updateGraph(graph.id, (target) => ({ ...target, progress: [...target.progress.filter((item) => item.edgeId !== edgeId), nextProgress] }))
    persistLearn({ ...learn, studyScope: scope, reviewedEdgeResults: { ...learn.reviewedEdgeResults, [edgeId]: result } })
  }

  return (
    <main className="container wide">
      <GraphToolbar
        graph={graph}
        mode={mode}
        scope={scope}
        selectedUnitId={learn.selectedUnitId}
        selectedBridgeUnitIds={bridgeUnits}
        visibleEdges={visibleEdges}
        onChangeScope={(next) => { setScope(next); persistLearn({ ...learn, studyScope: next }) }}
        onChangeUnit={(unitId) => persistLearn({ ...learn, selectedUnitId: unitId, selectedBridgeUnitIds: getBridgeNeighborUnitIds(graph, unitId) })}
        onGoHome={() => setSelectedGraphId(null)}
        onToggleMode={() => setMode((current) => current === 'all' ? 'learn' : 'all')}
        onOpenEdit={() => setSurface('edit')}
        onRandomStart={() => persistLearn(migrateLearnState(graph, null))}
        onResumeLastCard={() => {
          const last = loadLearnState()
          if (last && last.graphId === graph.id) {
            const migrated = migrateLearnState(graph, last)
            setScope(migrated.studyScope)
            persistLearn(migrated)
          }
        }}
      />

      {surface === 'study' ? (
        mode === 'all' ? (
          <AllModePanel graph={graph} cards={visibleCards} edges={visibleEdges} scope={scope} selectedUnitId={learn.selectedUnitId} />
        ) : (
          <LearnModePanel
            cards={graph.cards}
            outgoingEdges={reviewEdges}
            learnState={{ ...learn, studyScope: scope }}
            units={graph.units ?? []}
            onRevealAllDestinations={() => revealAll('dest')}
            onRevealAllReasons={() => revealAll('reason')}
            onToggleDestinationReveal={(edgeId) => persistLearn({ ...learn, revealedDestinationEdgeIds: toggleIdInList(learn.revealedDestinationEdgeIds, edgeId) })}
            onToggleReasonReveal={(edgeId) => persistLearn({ ...learn, revealedReasonEdgeIds: toggleIdInList(learn.revealedReasonEdgeIds, edgeId) })}
            onMarkResult={markResult}
            onFollowEdge={(edge) => setCurrentCard(edge.to)}
            onSwitchToBridge={() => { setScope('bridge'); persistLearn({ ...learn, studyScope: 'bridge' }) }}
            onNextCardSameUnit={() => {
              const sameUnitCards = graph.cards.filter((card) => card.unitId === learn.selectedUnitId)
              const candidate = sameUnitCards.find((card) => card.id !== learn.currentCardId)
              if (candidate) setCurrentCard(candidate.id)
            }}
            onRandomCardSameScope={() => {
              const cards = visibleCardsForScope(graph, scope, learn.selectedUnitId, bridgeUnits)
              if (cards[0]) setCurrentCard(cards[Math.floor(Math.random() * cards.length)].id)
            }}
          />
        )
      ) : (
        <section className="edit-surface">
          <div className="section-title-row">
            <h2>Edit graph</h2>
            <button className="ghost" onClick={() => setSurface('study')}>Back to study</button>
          </div>
          <EditPanel
            graph={graph}
            onUpdateGraphField={(field, value) => updateGraph(graph.id, (target) => ({ ...target, [field]: value }))}
            onUpdateCard={(cardId, field, value) => updateGraph(graph.id, (target) => ({
              ...target,
              cards: target.cards.map((card) => {
                if (card.id !== cardId) return card
                if (field === 'aliases') return { ...card, aliases: value.split(',').map((item) => item.trim()).filter(Boolean) }
                if (field === 'cardType') return { ...card, cardType: (value || undefined) as typeof card.cardType }
                if (field === 'dateLabel') return { ...card, dateLabel: value || undefined }
                return { ...card, [field]: value }
              }),
            }))}
            onUpdateEdge={(edgeId, field, value) => updateGraph(graph.id, (target) => ({
              ...target,
              edges: target.edges.map((edge) => {
                if (edge.id !== edgeId) return edge
                if (field === 'relationType') return { ...edge, relationType: value.trim() === '' ? undefined : value }
                if (field === 'importance') return { ...edge, importance: value as 'core' | 'secondary' }
                return { ...edge, [field]: value }
              }),
            }))}
            onCreateUnit={(input) => {
              const result = createUnitInGraph(graph, input)
              if (result.error) return result.error
              updateGraph(graph.id, () => result.graph)
              return null
            }}
            onDeleteUnit={(unitId) => {
              const result = deleteUnitInGraph(graph, unitId)
              if (!result.error) updateGraph(graph.id, () => result.graph)
              return result.error ?? null
            }}
            onCreateCard={(input) => {
              const result = createCardInGraph(graph, { ...input, cardType: input.cardType as 'event' | 'person' | 'concept' | 'institution' | 'text' | 'place' | undefined })
              if (result.error) return result.error
              updateGraph(graph.id, () => result.graph)
              return null
            }}
            onDeleteCard={(cardId) => updateGraph(graph.id, () => deleteCardInGraph(graph, cardId).graph)}
            onCreateEdge={(input) => {
              const result = createEdgeInGraph(graph, input)
              if (result.error) return result.error
              updateGraph(graph.id, () => result.graph)
              return null
            }}
            onDeleteEdge={(edgeId) => updateGraph(graph.id, () => deleteEdgeInGraph(graph, edgeId).graph)}
            onRewireEdge={(edgeId, from, to) => {
              const result = rewireEdgeInGraph(graph, edgeId, from, to)
              if (result.error) return result.error
              updateGraph(graph.id, () => result.graph)
              return null
            }}
          />
        </section>
      )}
    </main>
  )
}

export default App
