import type { ChangeEvent } from 'react'
import type { DraftImportPreview } from '../aiDraftImport'
import type { GraphData } from '../types'

interface HomePageProps {
  graphs: GraphData[]
  importError: string
  draftPreview: DraftImportPreview | null
  isHelpOpen: boolean
  onOpenGraph: (graphId: string) => void
  onCreateGraph: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onImportAiDraft: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onConfirmAiDraft: () => void
  onCancelAiDraft: () => void
  onExport: () => void
  onLoadSampleDeck: () => void
  onToggleHelp: () => void
}

export const HomePage = ({
  graphs,
  importError,
  draftPreview,
  isHelpOpen,
  onOpenGraph,
  onCreateGraph,
  onImport,
  onImportAiDraft,
  onConfirmAiDraft,
  onCancelAiDraft,
  onExport,
  onLoadSampleDeck,
  onToggleHelp,
}: HomePageProps) => (
  <main className="container">
    <header className="hero card">
      <p className="eyebrow">Concept-network learning</p>
      <h1>Synapse</h1>
      <p className="hero-text">
        Learn how ideas connect. Use the graph as support, then train recall in Learn mode with slot + cue prompts.
      </p>
      <div className="actions">
        <button onClick={onLoadSampleDeck}>1) Start with sample</button>
        <label className="button-like">
          2) Import AI Draft
          <input type="file" accept="application/json" onChange={onImportAiDraft} hidden />
        </label>
        <button onClick={onToggleHelp}>{isHelpOpen ? 'Close quick guide' : '3) Open quick guide'}</button>
      </div>
      <p className="muted">You can also open/edit existing graphs below.</p>
    </header>

    <section className="card fit-grid">
      <div>
        <h2>Good fit</h2>
        <p>History, religion, philosophy, psychology, AI/CS, statistics.</p>
      </div>
      <div>
        <h2>Less ideal</h2>
        <p>Pure vocabulary drilling, long-form memorization, freeform brainstorming.</p>
      </div>
    </section>

    {isHelpOpen && (
      <section className="card">
        <h2>Start here / How to use</h2>
        <ol>
          <li>Start with the sample deck or import your AI draft.</li>
          <li>Check connections in All mode (overview + details).</li>
          <li>Train recall in Learn mode using slot + cue.</li>
          <li>Refine card summaries and edge reasons as your understanding improves.</li>
        </ol>
      </section>
    )}

    <section className="card">
      <h2>Open or edit existing graph</h2>
      {graphs.length === 0 ? <p>No graph yet. Start with sample or create one.</p> : null}
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
          Import full JSON
          <input type="file" accept="application/json" onChange={onImport} hidden />
        </label>
        <button onClick={onExport}>Export JSON</button>
      </div>
      {importError && <p className="error">{importError}</p>}
    </section>

    {draftPreview && (
      <section className="card">
        <h2>AI draft import preview</h2>
        <p><strong>Graph:</strong> {draftPreview.report.graphTitle}</p>
        <p>
          <strong>Cards:</strong> {draftPreview.report.cardCount} | <strong>Links:</strong> {draftPreview.report.linkCount}
        </p>

        {draftPreview.report.errors.length > 0 && (
          <>
            <h3>Errors (import blocked)</h3>
            <ul>
              {draftPreview.report.errors.map((item) => (
                <li key={item} className="error">{item}</li>
              ))}
            </ul>
          </>
        )}

        {draftPreview.report.warnings.length > 0 && (
          <>
            <h3>Warnings</h3>
            <ul>
              {draftPreview.report.warnings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {draftPreview.report.infos.length > 0 && (
          <>
            <h3>Import notes</h3>
            <ul>
              {draftPreview.report.infos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}

        <div className="actions">
          <button onClick={onCancelAiDraft}>Cancel</button>
          <button disabled={!draftPreview.normalizedGraph} onClick={onConfirmAiDraft}>
            Confirm import
          </button>
        </div>
      </section>
    )}
  </main>
)
