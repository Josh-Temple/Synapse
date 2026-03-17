import { useMemo, useState } from 'react'
import type { Edge, GraphData } from '../types'

interface EditPanelProps {
  graph: GraphData
  onUpdateGraphField: (field: 'title' | 'description', value: string) => void
  onUpdateCard: (cardId: string, field: 'title' | 'summary' | 'detail', value: string) => void
  onUpdateEdge: (edgeId: string, field: 'cue' | 'reason' | 'slot' | 'relationType', value: string) => void
  onCreateCard: (input: { title: string; summary: string; detail: string }) => string | null
  onDeleteCard: (cardId: string) => void
  onCreateEdge: (input: Pick<Edge, 'from' | 'to' | 'cue' | 'reason'> & { relationType?: string }) => string | null
  onDeleteEdge: (edgeId: string) => void
  onRewireEdge: (edgeId: string, from: string, to: string) => string | null
}

export const EditPanel = ({
  graph,
  onUpdateGraphField,
  onUpdateCard,
  onUpdateEdge,
  onCreateCard,
  onDeleteCard,
  onCreateEdge,
  onDeleteEdge,
  onRewireEdge,
}: EditPanelProps) => {
  const [cardForm, setCardForm] = useState({ title: '', summary: '', detail: '' })
  const [edgeForm, setEdgeForm] = useState({ from: '', to: '', cue: '', reason: '', relationType: '' })
  const [error, setError] = useState('')
  const cardTitleById = useMemo(() => new Map(graph.cards.map((card) => [card.id, card.title])), [graph.cards])

  return (
    <section className="card">
      <h2>Edit graph content</h2>
      <label>
        Graph title
        <input value={graph.title} onChange={(event) => onUpdateGraphField('title', event.target.value)} />
      </label>
      <label>
        Graph description
        <textarea value={graph.description ?? ''} onChange={(event) => onUpdateGraphField('description', event.target.value)} />
      </label>

      <h3>Create card</h3>
      <label>
        Title
        <input value={cardForm.title} onChange={(event) => setCardForm({ ...cardForm, title: event.target.value })} />
      </label>
      <label>
        Summary
        <textarea value={cardForm.summary} onChange={(event) => setCardForm({ ...cardForm, summary: event.target.value })} />
      </label>
      <label>
        Detail
        <textarea value={cardForm.detail} onChange={(event) => setCardForm({ ...cardForm, detail: event.target.value })} />
      </label>
      <button
        onClick={() => {
          const message = onCreateCard(cardForm)
          if (message) {
            setError(message)
            return
          }
          setCardForm({ title: '', summary: '', detail: '' })
          setError('')
        }}
      >
        Create card
      </button>

      <h3>Cards</h3>
      {graph.cards.map((card) => {
        const connectedEdgeCount = graph.edges.filter((edge) => edge.from === card.id || edge.to === card.id).length
        return (
          <details key={card.id}>
            <summary>{card.title}</summary>
            <label>
              Title
              <input value={card.title} onChange={(event) => onUpdateCard(card.id, 'title', event.target.value)} />
            </label>
            <label>
              Summary
              <textarea value={card.summary} onChange={(event) => onUpdateCard(card.id, 'summary', event.target.value)} />
            </label>
            <label>
              Detail
              <textarea value={card.detail} onChange={(event) => onUpdateCard(card.id, 'detail', event.target.value)} />
            </label>
            <button
              className="danger"
              onClick={() => {
                const ok = window.confirm(
                  connectedEdgeCount > 0
                    ? `Delete "${card.title}" and ${connectedEdgeCount} connected edge(s)?`
                    : `Delete "${card.title}"?`,
                )
                if (ok) onDeleteCard(card.id)
              }}
            >
              Delete card
            </button>
          </details>
        )
      })}

      <h3>Create edge</h3>
      <label>
        From
        <select value={edgeForm.from} onChange={(event) => setEdgeForm({ ...edgeForm, from: event.target.value })}>
          <option value="">Select source</option>
          {graph.cards.map((card) => (
            <option key={card.id} value={card.id}>{card.title}</option>
          ))}
        </select>
      </label>
      <label>
        To
        <select value={edgeForm.to} onChange={(event) => setEdgeForm({ ...edgeForm, to: event.target.value })}>
          <option value="">Select target</option>
          {graph.cards.map((card) => (
            <option key={card.id} value={card.id}>{card.title}</option>
          ))}
        </select>
      </label>
      <label>
        Cue
        <input value={edgeForm.cue} onChange={(event) => setEdgeForm({ ...edgeForm, cue: event.target.value })} />
      </label>
      <label>
        Reason
        <textarea value={edgeForm.reason} onChange={(event) => setEdgeForm({ ...edgeForm, reason: event.target.value })} />
      </label>
      <label>
        Relation type
        <input value={edgeForm.relationType} onChange={(event) => setEdgeForm({ ...edgeForm, relationType: event.target.value })} />
      </label>
      <button
        onClick={() => {
          const message = onCreateEdge(edgeForm)
          if (message) {
            setError(message)
            return
          }
          setEdgeForm({ from: '', to: '', cue: '', reason: '', relationType: '' })
          setError('')
        }}
      >
        Create edge
      </button>

      <h3>Edges</h3>
      {graph.edges.map((edge) => (
        <details key={edge.id}>
          <summary>
            {cardTitleById.get(edge.from) ?? edge.from} → {cardTitleById.get(edge.to) ?? edge.to}
          </summary>
          <label>
            From
            <select
              value={edge.from}
              onChange={(event) => {
                const message = onRewireEdge(edge.id, event.target.value, edge.to)
                setError(message ?? '')
              }}
            >
              {graph.cards.map((card) => (
                <option key={card.id} value={card.id}>{card.title}</option>
              ))}
            </select>
          </label>
          <label>
            To
            <select
              value={edge.to}
              onChange={(event) => {
                const message = onRewireEdge(edge.id, edge.from, event.target.value)
                setError(message ?? '')
              }}
            >
              {graph.cards.map((card) => (
                <option key={card.id} value={card.id}>{card.title}</option>
              ))}
            </select>
          </label>
          <label>
            Slot
            <input value={edge.slot} onChange={(event) => onUpdateEdge(edge.id, 'slot', event.target.value)} />
          </label>
          <label>
            Cue
            <input value={edge.cue} onChange={(event) => onUpdateEdge(edge.id, 'cue', event.target.value)} />
          </label>
          <label>
            Reason
            <textarea value={edge.reason} onChange={(event) => onUpdateEdge(edge.id, 'reason', event.target.value)} />
          </label>
          <label>
            Relation type
            <input value={edge.relationType ?? ''} onChange={(event) => onUpdateEdge(edge.id, 'relationType', event.target.value)} />
          </label>
          <button className="danger" onClick={() => window.confirm('Delete this edge?') && onDeleteEdge(edge.id)}>
            Delete edge
          </button>
        </details>
      ))}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
