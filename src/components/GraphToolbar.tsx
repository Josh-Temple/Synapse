import { useMemo } from 'react'
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
  onOpenEdit: () => void
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
  onOpenEdit,
}: GraphToolbarProps) => {
  const visibleProgress = graph.progress.filter((item) => visibleEdges.some((edge) => edge.id === item.edgeId))
  const reviewed = visibleProgress.filter((item) => item.seenCount > 0).length
  const selectedUnitTitle = useMemo(() => graph.units?.find((unit) => unit.id === selectedUnitId)?.title ?? '—', [graph.units, selectedUnitId])

  return (
    <header className="study-header">
      <div className="topbar">
        <h1>{graph.title}</h1>
        <div className="topbar-actions">
          <button className="ghost" onClick={onToggleMode}>{mode === 'all' ? 'All' : 'Learn'}</button>
          <details className="overflow-menu">
            <summary aria-label="More actions">⋯</summary>
            <div className="overflow-list">
              <button className="ghost" onClick={onGoHome}>Home</button>
              <button className="ghost" onClick={onRandomStart}>Random start</button>
              <button className="ghost" onClick={onResumeLastCard}>Resume last card</button>
              <button className="ghost" onClick={onOpenEdit}>Edit graph</button>
              <button className="ghost" onClick={onToggleMode}>{mode === 'all' ? 'Switch to Learn mode' : 'Switch to All mode'}</button>
            </div>
          </details>
        </div>
      </div>

      <div className="context-line">
        <span>{mode} · {scope} · {(scope === 'unit' || scope === 'bridge') ? selectedUnitTitle : 'all units'} · {reviewed}/{visibleEdges.length} reviewed</span>
      </div>

      <div className="toolbar-row">
        <div className="segmented" role="group" aria-label="Study scope">
          <button className={scope === 'unit' ? 'active' : ''} onClick={() => onChangeScope('unit')}>Unit</button>
          <button className={scope === 'bridge' ? 'active' : ''} onClick={() => onChangeScope('bridge')}>Bridge</button>
          <button className={scope === 'global' ? 'active' : ''} onClick={() => onChangeScope('global')}>Global</button>
        </div>
        {(scope === 'unit' || scope === 'bridge') && (
          <label className="inline-select">
            <span>Unit</span>
            <select value={selectedUnitId ?? ''} onChange={(event) => onChangeUnit(event.target.value)}>
              {(graph.units ?? []).map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
            </select>
          </label>
        )}
      </div>

      {scope === 'bridge' && selectedBridgeUnitIds.length > 0 ? (
        <p className="muted context-extra">Neighbors: {selectedBridgeUnitIds.map((id) => graph.units?.find((u) => u.id === id)?.title ?? id).join(', ')}</p>
      ) : null}
    </header>
  )
}
