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
    <section className="learn-layout">
      <article className="card learn-focus">
        <p className="eyebrow">Learn mode (core loop)</p>
        <h2>{currentCard?.title ?? 'No current card'}</h2>
        {currentCard ? (
          <>
            <p><strong>Summary:</strong> {currentCard.summary}</p>
            <details>
              <summary>Open detail</summary>
              <p>{currentCard.detail}</p>
            </details>
          </>
        ) : (
          <p>Select a card to start.</p>
        )}
      </article>

      <article className="card">
        <div className="learn-header">
          <h3>Recall connections (slot + cue)</h3>
          <div className="actions">
            <button onClick={onRevealAllDestinations}>Reveal all destinations</button>
            <button onClick={onRevealAllReasons}>Reveal all reasons</button>
          </div>
        </div>

        {outgoingEdges.length === 0 ? (
          <p>No outgoing links from this card.</p>
        ) : (
          <ul className="edge-list">
            {outgoingEdges.map((edge) => {
              const destination = cards.find((card) => card.id === edge.to)
              const isDestRevealed = learnState.revealedDestinationEdgeIds.includes(edge.id)
              const isReasonRevealed = learnState.revealedReasonEdgeIds.includes(edge.id)

              return (
                <li key={edge.id} className="edge-item review-item">
                  <div className="review-topline">
                    <strong>{edge.slot}</strong>
                    <span className="cue">cue: {edge.cue}</span>
                    {edge.relationType ? <span className="relation-type">relation: {edge.relationType}</span> : null}
                  </div>
                  <div>destination: {isDestRevealed ? destination?.title ?? '(missing)' : '•••• hidden ••••'}</div>
                  <div>reason: {isReasonRevealed ? edge.reason : '•••• hidden ••••'}</div>

                  <div className="actions small">
                    <button onClick={() => onToggleDestinationReveal(edge.id)}>
                      {isDestRevealed ? 'Hide destination' : 'Reveal destination'}
                    </button>
                    <button onClick={() => onToggleReasonReveal(edge.id)}>
                      {isReasonRevealed ? 'Hide reason' : 'Reveal reason'}
                    </button>
                  </div>

                  <div className="actions small review-actions">
                    <button className="success" onClick={() => onMarkResult(edge.id, 'remembered')}>Remembered</button>
                    <button className="danger" onClick={() => onMarkResult(edge.id, 'missed')}>Missed</button>
                    <button onClick={() => onFollowEdge(edge)}>Follow next card</button>
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
