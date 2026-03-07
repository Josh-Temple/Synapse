import type { ChangeEvent } from 'react'
import type { GraphData } from '../types'

interface HomePageProps {
  graphs: GraphData[]
  importError: string
  onOpenGraph: (graphId: string) => void
  onCreateGraph: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onExport: () => void
}

export const HomePage = ({
  graphs,
  importError,
  onOpenGraph,
  onCreateGraph,
  onImport,
  onExport,
}: HomePageProps) => (
  <main className="container">
    <header>
      <h1>Synapse</h1>
      <p>Recall concept connections with slot + cue based navigation.</p>
    </header>
    <section className="card">
      <h2>Graphs</h2>
      <ul>
        {graphs.map((graph) => (
          <li key={graph.id} className="graph-row">
            <button onClick={() => onOpenGraph(graph.id)}>Open</button>
            <strong>{graph.title}</strong>
          </li>
        ))}
      </ul>
      <div className="actions">
        <button onClick={onCreateGraph}>New graph</button>
        <label className="button-like">
          Import JSON
          <input type="file" accept="application/json" onChange={onImport} hidden />
        </label>
        <button onClick={onExport}>Export JSON</button>
      </div>
      {importError && <p className="error">{importError}</p>}
    </section>
  </main>
)
