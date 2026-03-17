import type { GraphData, Mode } from '../types'

interface GraphToolbarProps {
  graph: GraphData
  mode: Mode
  onGoHome: () => void
  onToggleMode: () => void
  onRandomStart: () => void
  onResumeLastCard: () => void
}

export const GraphToolbar = ({
  graph,
  mode,
  onGoHome,
  onToggleMode,
  onRandomStart,
  onResumeLastCard,
}: GraphToolbarProps) => {
  const reviewed = graph.progress.filter((item) => item.seenCount > 0).length
  const remembered = graph.progress.reduce((total, item) => total + item.rememberedCount, 0)
  const missed = graph.progress.reduce((total, item) => total + item.missedCount, 0)
  const untouched = Math.max(graph.edges.length - reviewed, 0)

  return (
    <header className="toolbar">
      <div>
        <h1>{graph.title}</h1>
        <p>{graph.description}</p>
        <p className="muted">
          Progress: {graph.edges.length} edges · {reviewed} reviewed · remembered {remembered} · missed {missed} · untouched {untouched}
        </p>
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
