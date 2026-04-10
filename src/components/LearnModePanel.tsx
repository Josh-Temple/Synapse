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
    <section className="learn-surface">
      <article className="concept-focus">
        <p className="eyebrow">Current concept</p>
        <h2 className="concept-title">{currentCard?.title ?? 'No current card'}</h2>
        <p className="muted">{currentCard?.cardType ?? '—'} {currentCard?.dateLabel ? `· ${currentCard.dateLabel}` : ''} · {currentUnit?.title ?? '—'} · {outgoingEdges.length} links</p>
      </article>

      <section>
        <div className="section-title-row">
          <h3>Recall connections</h3>
          <div className="actions small tertiary-actions">
            <button className="ghost" onClick={onRevealAllDestinations}>Reveal all destinations</button>
            <button className="ghost" onClick={onRevealAllReasons}>Reveal all reasons</button>
            <button className="ghost" onClick={onRandomCardSameScope}>Random in scope</button>
            {learnState.studyScope !== 'bridge' ? <button className="ghost" onClick={onSwitchToBridge}>Switch to bridge</button> : null}
          </div>
        </div>

        {outgoingEdges.length === 0 ? (
          <div className="empty-state">
            <p>No outgoing links in this scope.</p>
            <div className="actions">
              <button onClick={onNextCardSameUnit}>Next</button>
              <button className="ghost" onClick={onRandomCardSameScope}>Random</button>
            </div>
          </div>
        ) : (
          <ul className="recall-list">
            {outgoingEdges.map((edge) => {
              const destination = cards.find((card) => card.id === edge.to)
              const isDestRevealed = learnState.revealedDestinationEdgeIds.includes(edge.id)
              const isReasonRevealed = learnState.revealedReasonEdgeIds.includes(edge.id)
              const destinationUnit = units.find((unit) => unit.id === destination?.unitId)

              return (
                <li key={edge.id} className="recall-item">
                  <p className="muted slot-row">{edge.slot} · {edge.relationType ?? 'relation'} · {edge.importance ?? 'secondary'}</p>
                  <p><span className="muted">cue:</span> {edge.cue}</p>
                  <p><span className="muted">destination:</span> {isDestRevealed ? destination?.title ?? '(missing)' : 'hidden'} {isDestRevealed && learnState.studyScope === 'bridge' ? `(${destinationUnit?.title ?? destination?.unitId})` : ''}</p>
                  <p><span className="muted">reason:</span> {isReasonRevealed ? edge.reason : 'hidden'}</p>

                  <div className="actions small">
                    <button className="ghost" onClick={() => onToggleDestinationReveal(edge.id)}>{isDestRevealed ? 'Hide destination' : 'Reveal destination'}</button>
                    <button className="ghost" onClick={() => onToggleReasonReveal(edge.id)}>{isReasonRevealed ? 'Hide reason' : 'Reveal reason'}</button>
                  </div>

                  <div className="actions action-row-primary">
                    <button className="success" onClick={() => onMarkResult(edge.id, 'remembered')}>Remembered</button>
                    <button className="danger" onClick={() => onMarkResult(edge.id, 'missed')}>Missed</button>
                    <button onClick={() => onFollowEdge(edge)}>Next</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </section>
  )
}
