import type { Edge, GraphData, Mode, StudyScope } from '../types'

interface GraphToolbarProps {
  graph: GraphData
  mode: Mode
  scope: StudyScope
  selectedUnitId: string | null
  selectedBridgeUnitIds: string[]
  visibleEdges: Edge[]
  onGoHome: () => void
  onToggleMode: () => void
  onRandomStart: () => void
  onResumeLastCard: () => void
  onChangeScope: (scope: StudyScope) => void
  onChangeUnit: (unitId: string) => void
}

export const GraphToolbar = ({
  graph,
  mode,
  scope,
  selectedUnitId,
  selectedBridgeUnitIds,
  visibleEdges,
  onGoHome,
  onToggleMode,
  onRandomStart,
  onResumeLastCard,
  onChangeScope,
  onChangeUnit,
}: GraphToolbarProps) => {
  const visibleProgress = graph.progress.filter((item) => visibleEdges.some((edge) => edge.id === item.edgeId))
  const reviewed = visibleProgress.filter((item) => item.seenCount > 0).length
  const remembered = visibleProgress.reduce((total, item) => total + item.rememberedCount, 0)
  const missed = visibleProgress.reduce((total, item) => total + item.missedCount, 0)
  const untouched = Math.max(visibleEdges.length - reviewed, 0)

  return (
    <header className="toolbar card">
      <div>
        <h1>{graph.title}</h1>
        <p>{graph.description}</p>
        <p className="muted">Scope progress: {visibleEdges.length} edges · {reviewed} reviewed · remembered {remembered} · missed {missed} · untouched {untouched}</p>
        <div className="actions small">
          <button className={scope === 'unit' ? 'success' : ''} onClick={() => onChangeScope('unit')}>Unit</button>
          <button className={scope === 'bridge' ? 'success' : ''} onClick={() => onChangeScope('bridge')}>Bridge</button>
          <button className={scope === 'global' ? 'success' : ''} onClick={() => onChangeScope('global')}>Global</button>
        </div>
        {(scope === 'unit' || scope === 'bridge') && (
          <label>
            Unit
            <select value={selectedUnitId ?? ''} onChange={(event) => onChangeUnit(event.target.value)}>
              {(graph.units ?? []).map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
            </select>
          </label>
        )}
        {scope === 'bridge' && selectedBridgeUnitIds.length > 0 ? (
          <p className="muted">Neighbors: {selectedBridgeUnitIds.map((id) => graph.units?.find((u) => u.id === id)?.title ?? id).join(', ')}</p>
        ) : null}
      </div>
      <div className="actions">
        <button onClick={onGoHome}>Home</button>
        <button onClick={onToggleMode}>{mode === 'all' ? 'Switch to Learn mode' : 'Switch to All mode'}</button>
        <button onClick={onRandomStart}>Random start</button>
        <button onClick={onResumeLastCard}>Resume last card</button>
      </div>
    </header>
  )
}
