import { initialState, makeLayer } from './reducer'
import { STATE_STORE_KEY } from '../lib/constants'
import type { EmojiState, TextLayer } from '../lib/types'

/** Restore the work-in-progress state from localStorage, merged over defaults. */
export function loadState(): EmojiState {
  try {
    const raw = localStorage.getItem(STATE_STORE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return initialState

    const layersRaw = Array.isArray(parsed.layers) ? parsed.layers : null
    const layers: TextLayer[] = layersRaw && layersRaw.length
      ? layersRaw.map((l: Partial<TextLayer>) => {
          const merged = { ...makeLayer(), ...l } as TextLayer
          if (l.id) merged.id = l.id
          return merged
        })
      : initialState.layers

    const merged: EmojiState = { ...initialState, ...parsed, layers, previewFont: null }
    if (!layers.some((l) => l.id === merged.activeLayerId)) merged.activeLayerId = layers[0].id
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
