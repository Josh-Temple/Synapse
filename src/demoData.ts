import type { AppData } from './types'

export const demoData: AppData = {
  graphs: [
    {
      id: 'graph-fr-rev',
      title: 'French Revolution',
      description: 'Concept graph for practicing historical connections.',
      createdAt: '2026-03-07T00:00:00Z',
      updatedAt: '2026-03-07T00:00:00Z',
      cards: [
        { id: 'french-revolution', title: 'French Revolution', summary: 'A major revolutionary upheaval beginning in 1789.', detail: 'It transformed France and influenced modern political history.' },
        { id: 'enlightenment', title: 'Enlightenment', summary: 'A movement emphasizing reason and critique of authority.', detail: 'Thinkers challenged monarchy, privilege, and church dominance.' },
        { id: 'ancien-regime', title: 'Ancien Régime', summary: 'Pre-revolution social and political order in France.', detail: 'Marked by estates, privilege, and fiscal imbalance.' },
        { id: 'national-assembly', title: 'National Assembly', summary: 'Body formed by the Third Estate in 1789.', detail: 'Claimed political legitimacy and launched constitutional reform.' },
        { id: 'reign-of-terror', title: 'Reign of Terror', summary: 'Period of intense political repression and executions.', detail: 'Driven by war pressure, factional conflict, and revolutionary defense.' },
        { id: 'napoleon', title: 'Napoleon Bonaparte', summary: 'Military leader who rose after revolutionary turmoil.', detail: 'Consolidated state institutions while ending the revolutionary republic.' },
        { id: 'declaration-rights', title: 'Declaration of the Rights of Man', summary: 'Foundational statement of rights from 1789.', detail: 'Declared liberty and equality, shaping revolutionary legitimacy.' },
      ],
      edges: [
        { id: 'e1', from: 'french-revolution', to: 'enlightenment', reason: 'Enlightenment ideas influenced revolutionary demands.', slot: 'A', cue: 'ideas' },
        { id: 'e2', from: 'french-revolution', to: 'ancien-regime', reason: 'Revolution emerged against the old social order.', slot: 'B', cue: 'old order' },
        { id: 'e3', from: 'french-revolution', to: 'national-assembly', reason: 'The Assembly became an institutional driver of change.', slot: 'C', cue: 'new body' },
        { id: 'e4', from: 'french-revolution', to: 'declaration-rights', reason: 'Rights declaration expressed core principles.', slot: 'D', cue: 'rights text' },
        { id: 'e5', from: 'national-assembly', to: 'declaration-rights', reason: 'The Assembly authored and approved it.', slot: 'A', cue: 'authored' },
        { id: 'e6', from: 'national-assembly', to: 'reign-of-terror', reason: 'Early constitutional conflict fed later radicalization.', slot: 'B', cue: 'radicalization' },
        { id: 'e7', from: 'reign-of-terror', to: 'napoleon', reason: 'Instability after terror opened room for military authority.', slot: 'A', cue: 'power vacuum' },
        { id: 'e8', from: 'ancien-regime', to: 'national-assembly', reason: 'Collapse of old institutions enabled the Assembly.', slot: 'A', cue: 'institutional break' },
        { id: 'e9', from: 'enlightenment', to: 'declaration-rights', reason: 'Natural rights theory shaped the declaration language.', slot: 'A', cue: 'rights theory' }
      ],
      progress: []
    }
  ]
}
