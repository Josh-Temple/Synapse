import { demoData } from './demoData'
import { validateAndNormalizeAppData } from './graphValidation'
import type { AppData, LearnState } from './types'

const APP_KEY = 'synapse.appData'
const LEARN_KEY = 'synapse.learnState'
const LAST_GRAPH_KEY = 'synapse.lastGraphId'

export const loadAppData = (): AppData => {
  const raw = localStorage.getItem(APP_KEY)
  if (!raw) return demoData
  try {
    return validateAndNormalizeAppData(JSON.parse(raw))
  } catch {
    return demoData
  }
}

export const saveAppData = (data: AppData): void => {
  localStorage.setItem(APP_KEY, JSON.stringify(data))
}

export const loadLearnState = (): LearnState | null => {
  const raw = localStorage.getItem(LEARN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LearnState
  } catch {
    return null
  }
}

export const saveLearnState = (state: LearnState): void => {
  localStorage.setItem(LEARN_KEY, JSON.stringify(state))
}

export const loadLastGraphId = (): string | null => localStorage.getItem(LAST_GRAPH_KEY)

export const saveLastGraphId = (graphId: string): void => localStorage.setItem(LAST_GRAPH_KEY, graphId)
