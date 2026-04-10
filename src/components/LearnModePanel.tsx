import { useEffect, useMemo, useState } from 'react'
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
  const [edgeIndex, setEdgeIndex] = useState(0)
  const activeEdge = outgoingEdges[edgeIndex] ?? null

  useEffect(() => {
    setEdgeIndex(0)
  }, [learnState.currentCardId, learnState.studyScope, outgoingEdges.length])

  const activeDestination = useMemo(() => cards.find((card) => card.id === activeEdge?.to) ?? null, [cards, activeEdge?.to])
  const activeDestinationUnit = useMemo(() => units.find((unit) => unit.id === activeDestination?.unitId), [units, activeDestination?.unitId])
  const isDestRevealed = activeEdge ? learnState.revealedDestinationEdgeIds.includes(activeEdge.id) : false
  const isReasonRevealed = activeEdge ? learnState.revealedReasonEdgeIds.includes(activeEdge.id) : false

  const advanceToNextEdge = () => {
    setEdgeIndex((current) => {
      if (outgoingEdges.length === 0) return 0
      return Math.min(current + 1, outgoingEdges.length - 1)
    })
  }

  const handleMark = (result: ReviewResult) => {
    if (!activeEdge) return
    onMarkResult(activeEdge.id, result)
    if (edgeIndex < outgoingEdges.length - 1) advanceToNextEdge()
  }

  return (
    <section className="learn-surface">
      <article className="concept-focus">
        <p className="eyebrow">Current concept</p>
        <h2 className="concept-title">{currentCard?.title ?? 'No current card'}</h2>
        <p className="muted concept-subtle">{currentCard?.dateLabel ? `${currentCard.dateLabel} · ` : ''}{currentUnit?.title ?? '—'}</p>
      </article>

      <section>
        <div className="section-title-row">
          <h3>Recall connections</h3>
          {outgoingEdges.length > 0 ? <p className="muted">{edgeIndex + 1} of {outgoingEdges.length} links</p> : null}
        </div>

        {outgoingEdges.length === 0 ? (
          <div className="empty-state">
            <p>No outgoing links in this scope.</p>
            <div className="actions">
              <button onClick={onNextCardSameUnit}>Next</button>
              <button className="ghost" onClick={onRandomCardSameScope}>Random</button>
            </div>
          </div>
        ) : activeEdge ? (
          <>
            <article className="recall-item recall-item-focus">
              <p className="cue-label">Cue</p>
              <p className="cue-text">{activeEdge.cue}</p>
              <div className="actions small">
                <button className="ghost" onClick={() => onToggleDestinationReveal(activeEdge.id)}>{isDestRevealed ? 'Hide reveal' : 'Reveal'}</button>
                <button className="ghost" onClick={() => onToggleReasonReveal(activeEdge.id)}>{isReasonRevealed ? 'Hide reason' : 'Reveal reason'}</button>
              </div>
              <p><span className="muted">destination:</span> {isDestRevealed ? activeDestination?.title ?? '(missing)' : 'hidden'} {isDestRevealed && learnState.studyScope === 'bridge' ? `(${activeDestinationUnit?.title ?? activeDestination?.unitId})` : ''}</p>
              <p><span className="muted">reason:</span> {isReasonRevealed ? activeEdge.reason : 'hidden'}</p>
              {(isDestRevealed || isReasonRevealed) ? (
                <p className="muted slot-row">{activeEdge.relationType ?? 'relation'} · {activeEdge.importance ?? 'secondary'}</p>
              ) : null}
            </article>

            <div className="learn-overflow-row">
              <details className="overflow-menu">
                <summary aria-label="Study actions">More</summary>
                <div className="overflow-list">
                  <button className="ghost" onClick={onRevealAllDestinations}>Reveal all destinations</button>
                  <button className="ghost" onClick={onRevealAllReasons}>Reveal all reasons</button>
                  <button className="ghost" onClick={onRandomCardSameScope}>Random in scope</button>
                  {learnState.studyScope !== 'bridge' ? <button className="ghost" onClick={onSwitchToBridge}>Switch to bridge</button> : null}
                </div>
              </details>
            </div>

            <div className="learn-bottom-bar">
              <button className="success" onClick={() => handleMark('remembered')}>Remembered</button>
              <button className="danger" onClick={() => handleMark('missed')}>Missed</button>
              <button onClick={() => (edgeIndex < outgoingEdges.length - 1 ? advanceToNextEdge() : onNextCardSameUnit())}>{edgeIndex < outgoingEdges.length - 1 ? 'Next' : 'Skip'}</button>
              <button className="ghost" onClick={() => onFollowEdge(activeEdge)}>Follow link</button>
            </div>
          </>
        ) : null}
      </section>
    </section>
  )
}
