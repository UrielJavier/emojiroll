import { PLAN } from '../lib/constants'
import { sanitizeName } from '../lib/color'
import { Effect, Fill, Mode } from '../lib/types'
import type { EmojiState, StylePreset, TextLayer } from '../lib/types'

let _seq = 0
function newId(): string {
  _seq += 1
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `layer-${_seq}`
}

export function makeLayer(overrides: Partial<TextLayer> = {}): TextLayer {
  return {
    text: 'IMAGINEERING',
    font: 'archivo',
    size: 58,
    track: 4,
    bold: true,
    mode: Mode.Left,
    speed: 1,
    gap: 48,
    angle: 0,
    offsetY: 0,
    effect: Effect.None,
    fillType: Fill.Solid,
    fg: '#ffffff',
    gradAngle: 90,
    gradStops: [{ color: '#ff5a1f', pos: 0 }, { color: '#ffd400', pos: 1 }],
    shadow: false,
    shadowColor: '#ff4d3d',
    shadowDist: 4,
    shadowAngle: 45,
    stroke: false,
    strokeColor: '#16140f',
    strokeWidth: 3,
    ...overrides,
    id: newId(),
  }
}

const firstLayer = makeLayer()

export const initialState: EmojiState = {
  layers: [firstLayer],
  activeLayerId: firstLayer.id,
  previewFont: null,
  bg: '#2f4bd6',
  bgType: Fill.Solid,
  bgGradAngle: 90,
  bgGradStops: [{ color: '#2f6bff', pos: 0 }, { color: '#9b3bff', pos: 1 }],
  transparent: false,
  secPerLoop: 5,
  fps: 18,
  padding: 6,
  planLimit: PLAN.free,
  emojiName: 'imagineering',
}

export function getActiveLayer(s: EmojiState): TextLayer {
  return s.layers.find((l) => l.id === s.activeLayerId) ?? s.layers[0]
}

export type Action =
  | { type: 'patch'; patch: Partial<EmojiState> }
  | { type: 'patchLayer'; id: string; patch: Partial<TextLayer> }
  | { type: 'addLayer'; text?: string }
  | { type: 'removeLayer'; id: string }
  | { type: 'moveLayer'; id: string; dir: -1 | 1 }
  | { type: 'reorderLayer'; id: string; beforeId: string | null }
  | { type: 'setActive'; id: string }
  | { type: 'swap' }
  | { type: 'applyPreset'; preset: StylePreset }
  | { type: 'reset'; text?: string }

const SWATCH_ROTATE = ['#ffd400', '#ff5a1f', '#22b4a0', '#ff2d78', '#b6ff3a', '#7b2ff7']

export function reducer(state: EmojiState, action: Action): EmojiState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch }

    case 'patchLayer':
      return {
        ...state,
        layers: state.layers.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      }

    case 'addLayer': {
      const active = getActiveLayer(state)
      const color = SWATCH_ROTATE[state.layers.length % SWATCH_ROTATE.length]
      const layer = makeLayer({
        ...active,
        text: action.text ?? 'TEXTO',
        fg: color,
        fillType: Fill.Solid,
        speed: Math.min(6, active.speed + 1),
        offsetY: 0,
      })
      return { ...state, layers: [...state.layers, layer], activeLayerId: layer.id }
    }

    case 'removeLayer': {
      if (state.layers.length <= 1) return state
      const layers = state.layers.filter((l) => l.id !== action.id)
      const activeLayerId = state.activeLayerId === action.id ? layers[0].id : state.activeLayerId
      return { ...state, layers, activeLayerId }
    }

    case 'moveLayer': {
      const i = state.layers.findIndex((l) => l.id === action.id)
      const j = i + action.dir
      if (i < 0 || j < 0 || j >= state.layers.length) return state
      const layers = state.layers.slice()
      ;[layers[i], layers[j]] = [layers[j], layers[i]]
      return { ...state, layers }
    }

    case 'reorderLayer': {
      // move `id` to just before `beforeId` (or to the end when beforeId is null)
      if (action.id === action.beforeId) return state
      const item = state.layers.find((l) => l.id === action.id)
      if (!item) return state
      const without = state.layers.filter((l) => l.id !== action.id)
      const at = action.beforeId ? without.findIndex((l) => l.id === action.beforeId) : without.length
      const layers = without.slice()
      layers.splice(at < 0 ? without.length : at, 0, item)
      return { ...state, layers }
    }

    case 'setActive':
      return { ...state, activeLayerId: action.id, previewFont: null }

    case 'swap': {
      const active = getActiveLayer(state)
      const layers = state.layers.map((l) =>
        l.id === active.id
          ? {
              ...l,
              fillType: state.bgType,
              fg: state.bg,
              gradStops: state.bgGradStops,
              gradAngle: state.bgGradAngle,
            }
          : l,
      )
      return {
        ...state,
        layers,
        bgType: active.fillType,
        bg: active.fg,
        bgGradStops: active.gradStops,
        bgGradAngle: active.gradAngle,
        transparent: active.fillType === Fill.Transparent,
      }
    }

    case 'applyPreset': {
      const preset: StylePreset = JSON.parse(JSON.stringify(action.preset))
      const layers = preset.layers.map((l) => ({ ...l, id: newId() }))
      return {
        ...state,
        layers,
        activeLayerId: layers[0]?.id ?? state.activeLayerId,
        bg: preset.bg,
        bgType: preset.bgType,
        bgGradAngle: preset.bgGradAngle,
        bgGradStops: preset.bgGradStops,
        secPerLoop: preset.secPerLoop,
        fps: preset.fps,
        padding: preset.padding,
        transparent: preset.bgType === Fill.Transparent,
      }
    }

    case 'reset': {
      const text = action.text ?? 'IMAGINEERING'
      const layer = makeLayer({ text })
      return {
        ...initialState,
        layers: [layer],
        activeLayerId: layer.id,
        previewFont: null,
        emojiName: sanitizeName(text) || 'emoji',
      }
    }
  }
}

/** Snapshot of the whole composition (layers + background + timing), deep-cloned. */
export function captureStyle(s: EmojiState): StylePreset {
  return JSON.parse(
    JSON.stringify({
      layers: s.layers,
      bg: s.bg,
      bgType: s.bgType,
      bgGradAngle: s.bgGradAngle,
      bgGradStops: s.bgGradStops,
      secPerLoop: s.secPerLoop,
      fps: s.fps,
      padding: s.padding,
    }),
  )
}
