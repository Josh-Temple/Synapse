import type { Card, Edge, LearnState, ReviewResult } from '../types'

interface LearnModePanelProps {
  cards: Card[]
  outgoingEdges: Edge[]
  learnState: LearnState
  onRevealAllDestinations: () => void
  onRevealAllReasons: () => void
  onToggleDestinationReveal: (edgeId: string) => void
  onToggleReasonReveal: (edgeId: string) => void
  onMarkResult: (edgeId: string, result: ReviewResult) => void
  onFollowEdge: (edge: Edge) => void
}

export const LearnModePanel = ({
  cards,
  outgoingEdges,
  learnState,
  onRevealAllDestinations,
  onRevealAllReasons,
  onToggleDestinationReveal,
  onToggleReasonReveal,
  onMarkResult,
  onFollowEdge,
}: LearnModePanelProps) => {
  const currentCard = cards.find((card) => card.id === learnState.currentCardId) ?? null

  return (
    <section className="grid">
      <article className="card">
        <h2>Current card</h2>
        {currentCard ? (
          <>
            <h3>{currentCard.title}</h3>
            <details>
              <summary>Show summary</summary>
              <p>{currentCard.summary}</p>
            </details>
            <details>
              <summary>Show detail</summary>
              <p>{currentCard.detail}</p>
            </details>
          </>
        ) : (
          <p>No current card</p>
        )}
      </article>

      <article className="card">
        <h2>Outgoing edges (slot + cue)</h2>
        <div className="actions">
          <button onClick={onRevealAllDestinations}>Reveal all destinations</button>
          <button onClick={onRevealAllReasons}>Reveal all reasons</button>
        </div>
        {outgoingEdges.length === 0 ? (
          <p>No outgoing edges from this card.</p>
        ) : (
          <ul className="edge-list">
            {outgoingEdges.map((edge) => {
              const destination = cards.find((card) => card.id === edge.to)
              const isDestRevealed = learnState.revealedDestinationEdgeIds.includes(edge.id)
              const isReasonRevealed = learnState.revealedReasonEdgeIds.includes(edge.id)

              return (
                <li key={edge.id} className="edge-item">
                  <strong>{edge.slot}</strong>
                  <span className="cue">cue: {edge.cue}</span>
                  {edge.relationType && <span className="relation-type">relation: {edge.relationType}</span>}
                  <span>to: {isDestRevealed ? destination?.title ?? '(missing)' : '•••• hidden ••••'}</span>
                  <span>reason: {isReasonRevealed ? edge.reason : '•••• hidden ••••'}</span>
                  <div className="actions small">
                    <button onClick={() => onToggleDestinationReveal(edge.id)}>
                      {isDestRevealed ? 'Hide destination' : 'Reveal destination'}
                    </button>
                    <button onClick={() => onToggleReasonReveal(edge.id)}>
                      {isReasonRevealed ? 'Hide reason' : 'Reveal reason'}
                    </button>
                    <button onClick={() => onMarkResult(edge.id, 'remembered')}>Remembered</button>
                    <button onClick={() => onMarkResult(edge.id, 'missed')}>Missed</button>
                    <button onClick={() => onFollowEdge(edge)}>Follow</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </article>
    </section>
  )
}
