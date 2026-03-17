import { describe, expect, it } from 'vitest'
import { mergeAppData } from './importFlow'
import { configureStorageEngine, loadImportBackup, saveImportBackup } from './storage'
import type { AppData } from './types'

const data = (id: string, title: string): AppData => ({
  graphs: [
    {
      id,
      title,
      cards: [{ id: 'c1', title: 'Card', summary: '', detail: '' }],
      edges: [],
      progress: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
})

describe('import flow', () => {
  it('merges with id conflict handling', () => {
    const existing = data('graph', 'Existing')
    const incoming = data('graph', 'Incoming')
    const merged = mergeAppData(existing, incoming)

    expect(merged.graphs).toHaveLength(2)
    expect(merged.graphs[0].id).toBe('graph')
    expect(merged.graphs[1].id).toBe('graph-2')
  })

  it('supports replace backup restore snapshot', () => {
    const memory = new Map<string, string>()
    configureStorageEngine({
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value)
      },
    })

    const backup = data('backup', 'Backup Graph')
    saveImportBackup(backup)
    const restored = loadImportBackup()

    expect(restored?.graphs[0].id).toBe('backup')
    expect(restored?.graphs[0].title).toBe('Backup Graph')
    expect(restored?.graphs[0].cards).toHaveLength(1)
  })
})
