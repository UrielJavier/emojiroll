import { initialState } from './reducer'
import { STATE_STORE_KEY } from '../lib/constants'
import type { EmojiState } from '../lib/types'

/** Restore the work-in-progress state from localStorage, merged over defaults. */
export function loadState(): EmojiState {
  try {
    const raw = localStorage.getItem(STATE_STORE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return initialState
    // merge over defaults so newly-added fields are filled; the hover preview is transient
    const merged: EmojiState = { ...initialState, ...parsed, previewFont: null }
    merged.transparent = merged.bgType === 'transparent'
    return merged
  } catch {
    return initialState
  }
}

/** Persist the current state (without the transient hover preview font). */
export function saveState(state: EmojiState): void {
  try {
    const { previewFont: _omit, ...rest } = state
    localStorage.setItem(STATE_STORE_KEY, JSON.stringify(rest))
  } catch {
    /* storage full or blocked — ignore */
  }
}
