import { useEffect, useMemo, useState } from 'react'
import { getEdgeStrength } from '../progress'
import type { Card, GraphData } from '../types'

interface AllModePanelProps {
  graph: GraphData
}

const findCard = (cards: Card[], cardId: string): Card | null => cards.find((card) => card.id === cardId) ?? null
const compactLabel = (title: string): string => (title.length > 14 ? `${title.slice(0, 12)}…` : title)

export const AllModePanel = ({ graph }: AllModePanelProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(graph.cards[0]?.id ?? '')
  const [hopLevel, setHopLevel] = useState<1 | 2>(1)
  const [search, setSearch] = useState('')

  const points = useMemo(() => {
    const radius = 150
    const cx = 190
    const cy = 190

    return graph.cards.map((card, idx) => {
      const angle = (Math.PI * 2 * idx) / Math.max(graph.cards.length, 1)
      return {
        card,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      }
    })
  }, [graph.cards])

  const pointByCardId = new Map(points.map((point) => [point.card.id, point]))
  const selected = findCard(graph.cards, selectedCardId) ?? graph.cards[0] ?? null

  useEffect(() => {
    setSelectedCardId(graph.cards[0]?.id ?? '')
    setSearch('')
  }, [graph.id, graph.cards])

  const neighborhood = useMemo(() => {
    if (!selected) return new Set<string>()
    const ids = new Set<string>([selected.id])
    const firstHop = graph.edges.filter((edge) => edge.from === selected.id || edge.to === selected.id)
    firstHop.forEach((edge) => {
      ids.add(edge.from)
      ids.add(edge.to)
    })

    if (hopLevel === 2) {
      graph.edges.forEach((edge) => {
        if (ids.has(edge.from) || ids.has(edge.to)) {
          ids.add(edge.from)
          ids.add(edge.to)
        }
      })
    }

    return ids
  }, [graph.edges, hopLevel, selected])

  const outgoingEdges = selected ? graph.edges.filter((edge) => edge.from === selected.id) : []
  const incomingEdges = selected ? graph.edges.filter((edge) => edge.to === selected.id) : []

  return (
    <section className="card">
      <h2>All mode (overview + selected concept details)</h2>
      <div className="actions small">
        <label>
          Search concept
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type a card title"
          />
        </label>
        <button onClick={() => setHopLevel(1)} className={hopLevel === 1 ? 'success' : ''}>1-hop focus</button>
        <button onClick={() => setHopLevel(2)} className={hopLevel === 2 ? 'success' : ''}>2-hop focus</button>
      </div>
      {search && (
        <div className="actions small">
          {graph.cards
            .filter((card) => card.title.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 8)
            .map((card) => (
              <button key={card.id} onClick={() => setSelectedCardId(card.id)}>{card.title}</button>
            ))}
        </div>
      )}
      <div className="all-mode-layout">
        <div>
          <svg viewBox="0 0 400 400" className="graph-svg compact">
            {graph.edges.map((edge) => {
              const from = pointByCardId.get(edge.from)
              const to = pointByCardId.get(edge.to)
              const progress = graph.progress.find((item) => item.edgeId === edge.id)

              if (!from || !to) return null

              const strength = getEdgeStrength(progress)
              const isNearSelected = neighborhood.has(edge.from) && neighborhood.has(edge.to)
              const isConnectedToSelected = selected ? edge.from === selected.id || edge.to === selected.id : false

              return (
                <line
                  key={edge.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isConnectedToSelected ? '#4338ca' : '#9ca3af'}
                  strokeWidth={1 + strength * 3}
                  opacity={isNearSelected ? 0.95 : 0.15}
                />
              )
            })}
            {points.map((point) => {
              const isSelected = selected?.id === point.card.id
              const inNeighborhood = neighborhood.has(point.card.id)

              return (
                <g key={point.card.id} className="clickable" onClick={() => setSelectedCardId(point.card.id)}>
                  <circle cx={point.x} cy={point.y} r={isSelected ? '22' : '16'} fill={isSelected ? '#111827' : '#374151'} opacity={inNeighborhood ? 1 : 0.35} />
                  <text x={point.x} y={point.y + 3} textAnchor="middle" fill="white" fontSize="8" opacity={inNeighborhood ? 1 : 0.5}>
                    {compactLabel(point.card.title)}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="muted">Tip: click a node to inspect one concept and its local links.</p>
        </div>

        <article className="details-panel">
          {!selected ? (
            <p>No card selected.</p>
          ) : (
            <>
              <h3>{selected.title}</h3>
              <p><strong>Summary:</strong> {selected.summary || '—'}</p>
              <p><strong>Detail:</strong> {selected.detail || '—'}</p>

              <h4>Outgoing links</h4>
              {outgoingEdges.length === 0 ? <p>None</p> : (
                <ul className="edge-list">
                  {outgoingEdges.map((edge) => {
                    const destination = findCard(graph.cards, edge.to)
                    return (
                      <li key={edge.id} className="edge-item">
                        <div><strong>{edge.slot}</strong> → {destination?.title ?? edge.to}</div>
                        <div>relationType: {edge.relationType ?? '—'}</div>
                        <div>cue: {edge.cue}</div>
                        <div>reason: {edge.reason}</div>
                      </li>
                    )
                  })}
                </ul>
              )}

              <h4>Incoming links</h4>
              {incomingEdges.length === 0 ? <p>None</p> : (
                <ul className="edge-list">
                  {incomingEdges.map((edge) => {
                    const source = findCard(graph.cards, edge.from)
                    return (
                      <li key={edge.id} className="edge-item">
                        <div><strong>{source?.title ?? edge.from}</strong> → {selected.title}</div>
                        <div>relationType: {edge.relationType ?? '—'}</div>
                        <div>cue: {edge.cue}</div>
                        <div>reason: {edge.reason}</div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </article>
      </div>
    </section>
  )
}
