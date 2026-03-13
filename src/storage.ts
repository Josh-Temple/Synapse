import { demoData } from './demoData'
import { validateAndNormalizeAppData } from './graphValidation'
import type { AppData, LearnState } from './types'

const APP_KEY = 'synapse.appData'
const LEARN_KEY = 'synapse.learnState'
const LAST_GRAPH_KEY = 'synapse.lastGraphId'

interface StorageEngine {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

const createLocalStorageEngine = (): StorageEngine => ({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
})

let engine: StorageEngine = createLocalStorageEngine()

export const configureStorageEngine = (nextEngine: StorageEngine): void => {
  engine = nextEngine
}

export const loadAppData = (): AppData => {
  const raw = engine.getItem(APP_KEY)
  if (!raw) return demoData
  try {
    return validateAndNormalizeAppData(JSON.parse(raw))
  } catch {
    return demoData
  }
}

export const saveAppData = (data: AppData): void => {
  engine.setItem(APP_KEY, JSON.stringify(data))
}

export const loadLearnState = (): LearnState | null => {
  const raw = engine.getItem(LEARN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LearnState
  } catch {
    return null
  }
}

export const saveLearnState = (state: LearnState): void => {
  engine.setItem(LEARN_KEY, JSON.stringify(state))
}

export const loadLastGraphId = (): string | null => engine.getItem(LAST_GRAPH_KEY)

export const saveLastGraphId = (graphId: string): void => engine.setItem(LAST_GRAPH_KEY, graphId)
