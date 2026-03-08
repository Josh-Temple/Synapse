import { useMemo } from 'react'
import { getEdgeStrength } from '../progress'
import type { GraphData } from '../types'

interface AllModePanelProps {
  graph: GraphData
}

export const AllModePanel = ({ graph }: AllModePanelProps) => {
  const points = useMemo(() => {
    const radius = 180
    const cx = 220
    const cy = 220

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

  return (
    <section className="card">
      <h2>All mode</h2>
      <svg viewBox="0 0 460 460" className="graph-svg">
        {graph.edges.map((edge) => {
          const from = pointByCardId.get(edge.from)
          const to = pointByCardId.get(edge.to)
          const progress = graph.progress.find((item) => item.edgeId === edge.id)

          if (!from || !to) return null

          const strength = getEdgeStrength(progress)

          return (
            <g key={edge.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#5a67d8"
                strokeWidth={1 + strength * 4}
                opacity={0.8}
              />
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2} fontSize="9">
                {edge.slot}: {edge.reason}
              </text>
            </g>
          )
        })}
        {points.map((point) => (
          <g key={point.card.id}>
            <circle cx={point.x} cy={point.y} r="22" fill="#1a202c" />
            <text x={point.x} y={point.y + 4} textAnchor="middle" fill="white" fontSize="9">
              {point.card.title.slice(0, 12)}
            </text>
          </g>
        ))}
      </svg>

      <ul className="edge-list">
        {graph.edges.map((edge) => {
          const destination = graph.cards.find((card) => card.id === edge.to)
          const progress = graph.progress.find((item) => item.edgeId === edge.id)

          return (
            <li key={edge.id} className="edge-item">
              <div>
                <strong>{edge.slot}</strong> {edge.from} → {destination?.title ?? edge.to}
              </div>
              {edge.relationType && <div className="relation-type">relation: {edge.relationType}</div>}
              <div>{edge.reason}</div>
              <div>
                seen: {progress?.seenCount ?? 0} | remembered: {progress?.rememberedCount ?? 0} | missed:{' '}
                {progress?.missedCount ?? 0}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
