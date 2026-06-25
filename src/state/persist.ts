import { initialState, makeLayer } from './reducer'
import { STATE_STORE_KEY } from '../lib/constants'
import { detectLang, translate } from '../i18n'
import { sanitizeName } from '../lib/color'
import { Fill, LayerKind } from '../lib/types'
import type { EmojiState, TextLayer } from '../lib/types'

/** A fresh composition with the default layer text localized to the current URL's language. */
function freshDefault(): EmojiState {
  const text = translate(detectLang(), 'layer.default')
  const layer = makeLayer({ text })
  return { ...initialState, layers: [layer], activeLayerId: layer.id, emojiName: sanitizeName(text) || 'emoji' }
}

/** Merge a parsed (possibly partial/old) object over the defaults into a valid state. */
function hydrate(parsed: Record<string, unknown>): EmojiState {
  const layersRaw = Array.isArray(parsed.layers) ? (parsed.layers as Partial<TextLayer>[]) : null
  const layers: TextLayer[] =
    layersRaw && layersRaw.length
      ? layersRaw.map((l) => {
          const merged = { ...makeLayer(), ...l } as TextLayer
          if (l.id) merged.id = l.id
          // older layers predate `kind`: infer it from whether an image was set
          if (!l.kind) merged.kind = l.image ? LayerKind.Image : LayerKind.Text
          return merged
        })
      : initialState.layers

  const merged: EmojiState = { ...initialState, ...parsed, layers, previewFont: null }
  if (!layers.some((l) => l.id === merged.activeLayerId)) merged.activeLayerId = layers[0].id
  merged.transparent = merged.bgType === Fill.Transparent
  return merged
}

/** Decode a shared composition from the URL hash (#d=…), or null. */
function fromShareHash(): EmojiState | null {
  if (typeof window === 'undefined') return null
  const m = window.location.hash.match(/[#&]d=([^&]+)/)
  if (!m) return null
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(m[1]))))
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return null
    // strip the hash so later edits (saved to localStorage) win on reload
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    return hydrate(parsed)
  } catch {
    return null
  }
}

/** Restore state: a shared link (#d=…) wins, then localStorage, then a fresh default. */
export function loadState(): EmojiState {
  const shared = fromShareHash()
  if (shared) return shared
  try {
    const raw = localStorage.getItem(STATE_STORE_KEY)
    if (!raw) return freshDefault()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return freshDefault()
    return hydrate(parsed)
  } catch {
    return freshDefault()
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

/** A shareable URL hash payload (base64 of the composition, minus device-specific bits). */
export function encodeShare(state: EmojiState): string {
  const { previewFont: _p, planLimit: _l, ...rest } = state
  // drop uploaded images — their data URLs would make the link enormous
  const layers = rest.layers.map(({ image: _img, ...l }) => l)
  const json = JSON.stringify({ ...rest, layers })
  return encodeURIComponent(btoa(unescape(encodeURIComponent(json))))
}
