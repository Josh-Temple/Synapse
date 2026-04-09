import { useMemo, useState } from 'react'
import type { Edge, GraphData, Unit } from '../types'

interface EditPanelProps {
  graph: GraphData
  onUpdateGraphField: (field: 'title' | 'description', value: string) => void
  onUpdateCard: (cardId: string, field: 'title' | 'summary' | 'detail' | 'unitId' | 'cardType' | 'aliases' | 'dateLabel', value: string) => void
  onUpdateEdge: (edgeId: string, field: 'cue' | 'reason' | 'slot' | 'relationType' | 'importance', value: string) => void
  onCreateUnit: (input: Pick<Unit, 'title'>) => string | null
  onDeleteUnit: (unitId: string) => string | null
  onCreateCard: (input: { title: string; summary: string; detail: string; unitId: string; cardType?: 'event' | 'person' | 'concept' | 'institution' | 'text' | 'place'; aliases?: string[]; dateLabel?: string }) => string | null
  onDeleteCard: (cardId: string) => void
  onCreateEdge: (input: Pick<Edge, 'from' | 'to' | 'cue' | 'reason'> & { relationType?: string; importance?: 'core' | 'secondary' }) => string | null
  onDeleteEdge: (edgeId: string) => void
  onRewireEdge: (edgeId: string, from: string, to: string) => string | null
}

export const EditPanel = ({ graph, onUpdateGraphField, onUpdateCard, onUpdateEdge, onCreateUnit, onDeleteUnit, onCreateCard, onDeleteCard, onCreateEdge, onDeleteEdge, onRewireEdge }: EditPanelProps) => {
  const [unitTitle, setUnitTitle] = useState('')
  const [cardForm, setCardForm] = useState<{ title: string; summary: string; detail: string; unitId: string; cardType: 'event' | 'person' | 'concept' | 'institution' | 'text' | 'place'; aliases: string; dateLabel: string }>({ title: '', summary: '', detail: '', unitId: graph.units?.[0]?.id ?? '', cardType: 'concept', aliases: '', dateLabel: '' })
  const [edgeForm, setEdgeForm] = useState({ from: '', to: '', cue: '', reason: '', relationType: '', importance: 'secondary' as 'core' | 'secondary' })
  const [error, setError] = useState('')
  const cardTitleById = useMemo(() => new Map(graph.cards.map((card) => [card.id, card.title])), [graph.cards])

  return (
    <section className="card">
      <h2>Edit graph content</h2>
      <label>Graph title<input value={graph.title} onChange={(event) => onUpdateGraphField('title', event.target.value)} /></label>
      <label>Graph description<textarea value={graph.description ?? ''} onChange={(event) => onUpdateGraphField('description', event.target.value)} /></label>

      <h3>Units</h3>
      <div className="actions small">
        <input value={unitTitle} onChange={(event) => setUnitTitle(event.target.value)} placeholder="New unit title" />
        <button onClick={() => { const message = onCreateUnit({ title: unitTitle }); if (message) setError(message); else { setUnitTitle(''); setError('') } }}>Create unit</button>
      </div>
      {(graph.units ?? []).map((unit) => <div key={unit.id} className="graph-row"><strong>{unit.title}</strong><button className="danger" onClick={() => { const msg = onDeleteUnit(unit.id); if (msg) setError(msg); }}>Delete</button></div>)}

      <h3>Create card</h3>
      <label>Title<input value={cardForm.title} onChange={(event) => setCardForm({ ...cardForm, title: event.target.value })} /></label>
      <label>Summary<textarea value={cardForm.summary} onChange={(event) => setCardForm({ ...cardForm, summary: event.target.value })} /></label>
      <label>Detail<textarea value={cardForm.detail} onChange={(event) => setCardForm({ ...cardForm, detail: event.target.value })} /></label>
      <label>Unit<select value={cardForm.unitId} onChange={(event) => setCardForm({ ...cardForm, unitId: event.target.value })}>{(graph.units ?? []).map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}</select></label>
      <label>Card type<select value={cardForm.cardType} onChange={(event) => setCardForm({ ...cardForm, cardType: event.target.value as 'event' | 'person' | 'concept' | 'institution' | 'text' | 'place' })}>{['event','person','concept','institution','text','place'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label>Aliases (comma-separated)<input value={cardForm.aliases} onChange={(event) => setCardForm({ ...cardForm, aliases: event.target.value })} /></label>
      <label>Date label<input value={cardForm.dateLabel} onChange={(event) => setCardForm({ ...cardForm, dateLabel: event.target.value })} /></label>
      <button onClick={() => {
        const message = onCreateCard({ ...cardForm, aliases: cardForm.aliases.split(',').map((item) => item.trim()).filter(Boolean) })
        if (message) return setError(message)
        setCardForm({ title: '', summary: '', detail: '', unitId: graph.units?.[0]?.id ?? '', cardType: 'concept', aliases: '', dateLabel: '' })
      }}>Create card</button>

      <h3>Cards</h3>
      {graph.cards.map((card) => <details key={card.id}><summary>{card.title}</summary>
        <label>Title<input value={card.title} onChange={(event) => onUpdateCard(card.id, 'title', event.target.value)} /></label>
        <label>Summary<textarea value={card.summary} onChange={(event) => onUpdateCard(card.id, 'summary', event.target.value)} /></label>
        <label>Detail<textarea value={card.detail} onChange={(event) => onUpdateCard(card.id, 'detail', event.target.value)} /></label>
        <label>Unit<select value={card.unitId} onChange={(event) => onUpdateCard(card.id, 'unitId', event.target.value)}>{(graph.units ?? []).map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}</select></label>
        <label>Card type<select value={card.cardType ?? ''} onChange={(event) => onUpdateCard(card.id, 'cardType', event.target.value)}><option value="">none</option>{['event','person','concept','institution','text','place'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <label>Aliases<input value={(card.aliases ?? []).join(', ')} onChange={(event) => onUpdateCard(card.id, 'aliases', event.target.value)} /></label>
        <label>Date label<input value={card.dateLabel ?? ''} onChange={(event) => onUpdateCard(card.id, 'dateLabel', event.target.value)} /></label>
        <button className="danger" onClick={() => window.confirm(`Delete "${card.title}"?`) && onDeleteCard(card.id)}>Delete card</button>
      </details>)}

      <h3>Create edge</h3>
      <label>From<select value={edgeForm.from} onChange={(event) => setEdgeForm({ ...edgeForm, from: event.target.value })}><option value="">Select source</option>{graph.cards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}</select></label>
      <label>To<select value={edgeForm.to} onChange={(event) => setEdgeForm({ ...edgeForm, to: event.target.value })}><option value="">Select target</option>{graph.cards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}</select></label>
      <label>Cue<input value={edgeForm.cue} onChange={(event) => setEdgeForm({ ...edgeForm, cue: event.target.value })} /></label>
      <label>Reason<textarea value={edgeForm.reason} onChange={(event) => setEdgeForm({ ...edgeForm, reason: event.target.value })} /></label>
      <label>Relation type<input value={edgeForm.relationType} onChange={(event) => setEdgeForm({ ...edgeForm, relationType: event.target.value })} /></label>
      <label>Importance<select value={edgeForm.importance} onChange={(event) => setEdgeForm({ ...edgeForm, importance: event.target.value as 'core' | 'secondary' })}><option value="secondary">secondary</option><option value="core">core</option></select></label>
      <button onClick={() => { const message = onCreateEdge(edgeForm); if (message) setError(message); else setEdgeForm({ from: '', to: '', cue: '', reason: '', relationType: '', importance: 'secondary' }) }}>Create edge</button>

      <h3>Edges</h3>
      {graph.edges.map((edge) => <details key={edge.id}><summary>{cardTitleById.get(edge.from) ?? edge.from} → {cardTitleById.get(edge.to) ?? edge.to}</summary>
        <label>From<select value={edge.from} onChange={(event) => setError(onRewireEdge(edge.id, event.target.value, edge.to) ?? '')}>{graph.cards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}</select></label>
        <label>To<select value={edge.to} onChange={(event) => setError(onRewireEdge(edge.id, edge.from, event.target.value) ?? '')}>{graph.cards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}</select></label>
        <label>Slot<input value={edge.slot} onChange={(event) => onUpdateEdge(edge.id, 'slot', event.target.value)} /></label>
        <label>Cue<input value={edge.cue} onChange={(event) => onUpdateEdge(edge.id, 'cue', event.target.value)} /></label>
        <label>Reason<textarea value={edge.reason} onChange={(event) => onUpdateEdge(edge.id, 'reason', event.target.value)} /></label>
        <label>Relation type<input value={edge.relationType ?? ''} onChange={(event) => onUpdateEdge(edge.id, 'relationType', event.target.value)} /></label>
        <label>Importance<select value={edge.importance ?? 'secondary'} onChange={(event) => onUpdateEdge(edge.id, 'importance', event.target.value)}><option value="secondary">secondary</option><option value="core">core</option></select></label>
        <p className="muted">Scope: {edge.scope ?? 'auto'}</p>
        <button className="danger" onClick={() => window.confirm('Delete this edge?') && onDeleteEdge(edge.id)}>Delete edge</button>
      </details>)}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
