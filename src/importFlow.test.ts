import { describe, expect, it } from 'vitest'
import { mergeAppData } from './importFlow'
import { configureStorageEngine, loadImportBackup, saveImportBackup } from './storage'
import type { AppData } from './types'

const data = (id: string, title: string): AppData => ({
  graphs: [{
    id,
    title,
    units: [{ id: 'u1', title: 'Unit 1', order: 1 }],
    cards: [{ id: 'c1', title: 'Card', summary: '', detail: '', unitId: 'u1' }],
    edges: [],
    progress: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  }],
})

describe('import flow', () => {
  it('merges with id conflict handling', () => {
    const merged = mergeAppData(data('graph', 'Existing'), data('graph', 'Incoming'))
    expect(merged.graphs).toHaveLength(2)
    expect(merged.graphs[1].id).toBe('graph-2')
  })

  it('supports replace backup restore snapshot', () => {
    const memory = new Map<string, string>()
    configureStorageEngine({ getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => void memory.set(key, value) })
    const backup = data('backup', 'Backup Graph')
    saveImportBackup(backup)
    expect(loadImportBackup()?.graphs[0].id).toBe('backup')
  })
})
