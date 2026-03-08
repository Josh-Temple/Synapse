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
    <header>
      <h1>Synapse</h1>
      <p>Recall concept connections with slot + cue based navigation.</p>
      <div className="actions">
        <button onClick={onToggleHelp}>{isHelpOpen ? 'Close guide' : 'Start here / How to use'}</button>
      </div>
    </header>

    {isHelpOpen && (
      <section className="card">
        <h2>How to use Synapse</h2>
        <p>Synapse is for recalling connections between concepts, not just isolated facts.</p>
        <ol>
          <li>Generate a draft deck externally (NotebookLM, GPTs, Gems, ChatGPT, Gemini, or manually).</li>
          <li>Import AI Draft from this home screen.</li>
          <li>Review in Learn mode using slot + cue hints.</li>
          <li>Refine cards and links over time.</li>
        </ol>
        <p><strong>Good topics:</strong> history causality, Buddhism/Christianity concepts, philosophy, psychology, statistics, AI/CS.</p>
        <details>
          <summary>Ideas for topics</summary>
          <ul>
            <li>World history events and causes</li>
            <li>Four Noble Truths and Eightfold Path connections</li>
            <li>Christian concepts and historical branches</li>
            <li>Cognitive biases and interventions</li>
            <li>Statistics and machine-learning concepts</li>
          </ul>
        </details>
      </section>
    )}

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
        <button onClick={onLoadSampleDeck}>Load sample deck</button>
        <label className="button-like">
          Import AI Draft
          <input type="file" accept="application/json" onChange={onImportAiDraft} hidden />
        </label>
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
