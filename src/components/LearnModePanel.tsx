import type { Card, Edge, LearnState, ReviewResult, Unit } from '../types'

interface LearnModePanelProps {
  cards: Card[]
  units: Unit[]
  outgoingEdges: Edge[]
  learnState: LearnState
  onRevealAllDestinations: () => void
  onRevealAllReasons: () => void
  onToggleDestinationReveal: (edgeId: string) => void
  onToggleReasonReveal: (edgeId: string) => void
  onMarkResult: (edgeId: string, result: ReviewResult) => void
  onFollowEdge: (edge: Edge) => void
  onSwitchToBridge: () => void
  onNextCardSameUnit: () => void
  onRandomCardSameScope: () => void
}

export const LearnModePanel = ({
  cards,
  units,
  outgoingEdges,
  learnState,
  onRevealAllDestinations,
  onRevealAllReasons,
  onToggleDestinationReveal,
  onToggleReasonReveal,
  onMarkResult,
  onFollowEdge,
  onSwitchToBridge,
  onNextCardSameUnit,
  onRandomCardSameScope,
}: LearnModePanelProps) => {
  const currentCard = cards.find((card) => card.id === learnState.currentCardId) ?? null
  const currentUnit = units.find((unit) => unit.id === learnState.selectedUnitId)

  return (
    <section className="learn-layout">
      <article className="card learn-focus">
        <p className="eyebrow">Learn mode / {learnState.studyScope}</p>
        <h2>{currentCard?.title ?? 'No current card'}</h2>
        <p className="muted">Unit: {currentUnit?.title ?? '—'} · Type: {currentCard?.cardType ?? '—'} {currentCard?.dateLabel ? `· ${currentCard.dateLabel}` : ''} · In-scope links: {outgoingEdges.length}</p>
      </article>

      <article className="card">
        <div className="learn-header">
          <h3>Recall connections</h3>
          <div className="actions">
            <button onClick={onRevealAllDestinations}>Reveal all destinations</button>
            <button onClick={onRevealAllReasons}>Reveal all reasons</button>
            <button onClick={onNextCardSameUnit}>Next card (same unit)</button>
            <button onClick={onRandomCardSameScope}>Random card (same scope)</button>
            {learnState.studyScope !== 'bridge' ? <button onClick={onSwitchToBridge}>Switch to bridge for this card</button> : null}
          </div>
        </div>

        {outgoingEdges.length === 0 ? (
          <div>
            <p>No outgoing links in this scope.</p>
            <div className="actions"><button onClick={onNextCardSameUnit}>Next card in unit</button><button onClick={onRandomCardSameScope}>Random card in scope</button><button onClick={onSwitchToBridge}>Switch to bridge</button></div>
          </div>
        ) : (
          <ul className="edge-list">
            {outgoingEdges.map((edge) => {
              const destination = cards.find((card) => card.id === edge.to)
              const isDestRevealed = learnState.revealedDestinationEdgeIds.includes(edge.id)
              const isReasonRevealed = learnState.revealedReasonEdgeIds.includes(edge.id)
              const destinationUnit = units.find((unit) => unit.id === destination?.unitId)

              return (
                <li key={edge.id} className="edge-item review-item">
                  <div className="review-topline">
                    <strong>{edge.slot}</strong>
                    <span className="cue">cue: {edge.cue}</span>
                    <span className="relation-type">{edge.relationType ?? '—'} · {edge.importance ?? 'secondary'}</span>
                  </div>
                  <div>destination: {isDestRevealed ? destination?.title ?? '(missing)' : '•••• hidden ••••'} {isDestRevealed && learnState.studyScope === 'bridge' ? `(${destinationUnit?.title ?? destination?.unitId})` : ''}</div>
                  <div>reason: {isReasonRevealed ? edge.reason : '•••• hidden ••••'}</div>
                  <div className="actions small">
                    <button onClick={() => onToggleDestinationReveal(edge.id)}>{isDestRevealed ? 'Hide destination' : 'Reveal destination'}</button>
                    <button onClick={() => onToggleReasonReveal(edge.id)}>{isReasonRevealed ? 'Hide reason' : 'Reveal reason'}</button>
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
