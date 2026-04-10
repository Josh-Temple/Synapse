import { useEffect, useMemo, useState } from 'react'
import { getEdgeStrength } from '../progress'
import type { Card, Edge, GraphData, StudyScope } from '../types'

interface AllModePanelProps {
  graph: GraphData
  cards: Card[]
  edges: Edge[]
  scope: StudyScope
  selectedUnitId: string | null
}

const findCard = (cards: Card[], cardId: string): Card | null => cards.find((card) => card.id === cardId) ?? null
const compactLabel = (title: string): string => (title.length > 14 ? `${title.slice(0, 12)}…` : title)

export const AllModePanel = ({ graph, cards, edges, scope, selectedUnitId }: AllModePanelProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id ?? '')
  const [hopLevel, setHopLevel] = useState<1 | 2>(1)
  const [search, setSearch] = useState('')
  const [relationFilter, setRelationFilter] = useState('all')
  const [importanceFilter, setImportanceFilter] = useState<'all' | 'core'>('all')
  const [cardTypeFilter, setCardTypeFilter] = useState('all')

  useEffect(() => {
    setSelectedCardId(cards[0]?.id ?? '')
    setSearch('')
  }, [graph.id, cards])

  const filteredCards = useMemo(() => cards.filter((card) => cardTypeFilter === 'all' || card.cardType === cardTypeFilter), [cards, cardTypeFilter])
  const allowedCardIds = new Set(filteredCards.map((card) => card.id))
  const filteredEdges = useMemo(() => edges.filter((edge) => {
    if (!allowedCardIds.has(edge.from) || !allowedCardIds.has(edge.to)) return false
    if (relationFilter !== 'all' && edge.relationType !== relationFilter) return false
    if (importanceFilter === 'core' && edge.importance !== 'core') return false
    return true
  }), [edges, relationFilter, importanceFilter, allowedCardIds])

  const points = useMemo(() => filteredCards.map((card, idx) => {
    const angle = (Math.PI * 2 * idx) / Math.max(filteredCards.length, 1)
    return { card, x: 190 + 150 * Math.cos(angle), y: 190 + 150 * Math.sin(angle) }
  }), [filteredCards])

  const pointByCardId = new Map(points.map((point) => [point.card.id, point]))
  const selected = findCard(filteredCards, selectedCardId) ?? filteredCards[0] ?? null

  const neighborhood = useMemo(() => {
    if (!selected) return new Set<string>()
    const ids = new Set<string>([selected.id])
    filteredEdges.filter((edge) => edge.from === selected.id || edge.to === selected.id).forEach((edge) => { ids.add(edge.from); ids.add(edge.to) })
    if (hopLevel === 2) {
      filteredEdges.forEach((edge) => { if (ids.has(edge.from) || ids.has(edge.to)) { ids.add(edge.from); ids.add(edge.to) } })
    }
    return ids
  }, [filteredEdges, hopLevel, selected])

  const outgoingEdges = selected ? filteredEdges.filter((edge) => edge.from === selected.id) : []
  const incomingEdges = selected ? filteredEdges.filter((edge) => edge.to === selected.id) : []
  const relationTypes = Array.from(new Set(edges.map((edge) => edge.relationType).filter(Boolean))) as string[]

  return (
    <section className="all-panel">
      <h2>All mode ({scope})</h2>
      <div className="filter-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search concept" />
        <select value={relationFilter} onChange={(event) => setRelationFilter(event.target.value)}><option value="all">All relations</option>{relationTypes.map((rt) => <option key={rt} value={rt}>{rt}</option>)}</select>
        <select value={importanceFilter} onChange={(event) => setImportanceFilter(event.target.value as 'all' | 'core')}><option value="all">All importance</option><option value="core">Core only</option></select>
        <select value={cardTypeFilter} onChange={(event) => setCardTypeFilter(event.target.value)}><option value="all">All card types</option>{['event', 'person', 'concept', 'institution', 'text', 'place'].map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <div className="segmented compact">
          <button onClick={() => setHopLevel(1)} className={hopLevel === 1 ? 'active' : ''}>1-hop</button>
          <button onClick={() => setHopLevel(2)} className={hopLevel === 2 ? 'active' : ''}>2-hop</button>
        </div>
      </div>
      {search && <div className="actions small">{filteredCards.filter((card) => card.title.toLowerCase().includes(search.toLowerCase())).slice(0, 8).map((card) => <button className="ghost" key={card.id} onClick={() => setSelectedCardId(card.id)}>{card.title}</button>)}</div>}
      <div className="all-mode-layout">
        <div>
          <svg viewBox="0 0 400 400" className="graph-svg compact">
            {filteredEdges.map((edge) => {
              const from = pointByCardId.get(edge.from)
              const to = pointByCardId.get(edge.to)
              const progress = graph.progress.find((item) => item.edgeId === edge.id)
              if (!from || !to) return null
              const strength = getEdgeStrength(progress)
              const isNearSelected = neighborhood.has(edge.from) && neighborhood.has(edge.to)
              return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={edge.scope === 'cross-unit' ? '#6d28d9' : '#9ca3af'} strokeDasharray={edge.scope === 'cross-unit' ? '4 3' : undefined} strokeWidth={1 + strength * 3} opacity={isNearSelected ? 0.9 : 0.2} />
            })}
            {points.map((point) => {
              const isSelected = selected?.id === point.card.id
              const inNeighborhood = neighborhood.has(point.card.id)
              const isSelectedUnit = point.card.unitId === selectedUnitId
              return <g key={point.card.id} className="clickable" onClick={() => setSelectedCardId(point.card.id)}>
                <circle cx={point.x} cy={point.y} r={isSelected ? '22' : '16'} fill={isSelected ? '#0f172a' : isSelectedUnit ? '#475569' : '#94a3b8'} opacity={inNeighborhood ? 1 : 0.4} />
                <text x={point.x} y={point.y + 3} textAnchor="middle" fill="white" fontSize="8">{compactLabel(point.card.title)}</text>
              </g>
            })}
          </svg>
        </div>
        <article className="details-panel">
          {!selected ? <p>No card selected.</p> : <>
            <h3>{selected.title}</h3>
            <p><strong>Unit:</strong> {graph.units?.find((u) => u.id === selected.unitId)?.title ?? selected.unitId}</p>
            <p><strong>Type:</strong> {selected.cardType ?? '—'} {selected.dateLabel ? `· ${selected.dateLabel}` : ''}</p>
            <h4>Outgoing links</h4>
            {outgoingEdges.length === 0 ? <p>None</p> : <ul className="edge-list simple">{outgoingEdges.map((edge) => <li key={edge.id} className="edge-item"><div><strong>{edge.slot}</strong> → {findCard(graph.cards, edge.to)?.title ?? edge.to}</div><div>{edge.scope} · {edge.importance}</div><div>{edge.relationType ?? '—'}</div></li>)}</ul>}
            <h4>Incoming links</h4>
            {incomingEdges.length === 0 ? <p>None</p> : <ul className="edge-list simple">{incomingEdges.map((edge) => <li key={edge.id} className="edge-item"><div>{findCard(graph.cards, edge.from)?.title ?? edge.from} → {selected.title}</div><div>{edge.scope} · {edge.importance}</div><div>{edge.relationType ?? '—'}</div></li>)}</ul>}
          </>}
        </article>
      </div>
    </section>
  )
}
