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
}: GraphToolbarProps) => (
  <header className="toolbar">
    <div>
      <h1>{graph.title}</h1>
      <p>{graph.description}</p>
    </div>
    <div className="actions">
      <button onClick={onGoHome}>Home</button>
      <button onClick={onToggleMode}>
        {mode === 'all' ? 'Switch to Learn mode' : 'Switch to All mode'}
      </button>
      <button onClick={onRandomStart}>Random start</button>
      <button onClick={onResumeLastCard}>Resume last card</button>
    </div>
  </header>
)
