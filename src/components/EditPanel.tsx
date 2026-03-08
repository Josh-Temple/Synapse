import type { GraphData } from '../types'

interface EditPanelProps {
  graph: GraphData
  onUpdateGraphField: (field: 'title' | 'description', value: string) => void
  onUpdateCard: (cardId: string, field: 'title' | 'summary' | 'detail', value: string) => void
  onUpdateEdge: (edgeId: string, field: 'cue' | 'reason' | 'slot' | 'relationType', value: string) => void
}

export const EditPanel = ({
  graph,
  onUpdateGraphField,
  onUpdateCard,
  onUpdateEdge,
}: EditPanelProps) => (
  <section className="card">
    <h2>Light edit panel</h2>
    <label>
      Graph title
      <input value={graph.title} onChange={(event) => onUpdateGraphField('title', event.target.value)} />
    </label>
    <label>
      Graph description
      <textarea
        value={graph.description ?? ''}
        onChange={(event) => onUpdateGraphField('description', event.target.value)}
      />
    </label>

    <h3>Cards</h3>
    {graph.cards.map((card) => (
      <details key={card.id}>
        <summary>{card.title}</summary>
        <label>
          Title
          <input value={card.title} onChange={(event) => onUpdateCard(card.id, 'title', event.target.value)} />
        </label>
        <label>
          Summary
          <textarea
            value={card.summary}
            onChange={(event) => onUpdateCard(card.id, 'summary', event.target.value)}
          />
        </label>
        <label>
          Detail
          <textarea
            value={card.detail}
            onChange={(event) => onUpdateCard(card.id, 'detail', event.target.value)}
          />
        </label>
      </details>
    ))}

    <h3>Edges</h3>
    {graph.edges.map((edge) => (
      <details key={edge.id}>
        <summary>
          {edge.id}: {edge.from} → {edge.to}
        </summary>
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
          <textarea
            value={edge.reason}
            onChange={(event) => onUpdateEdge(edge.id, 'reason', event.target.value)}
          />
        </label>
        <label>
          Relation type
          <input
            value={edge.relationType ?? ''}
            onChange={(event) => onUpdateEdge(edge.id, 'relationType', event.target.value)}
          />
        </label>
      </details>
    ))}
  </section>
)
