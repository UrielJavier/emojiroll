import { PLAN } from '../lib/constants'
import type { EmojiState, StylePreset } from '../lib/types'

export const initialState: EmojiState = {
  text: 'IMAGINEERING',
  font: 'archivo',
  previewFont: null,
  size: 58,
  track: 4,
  mode: 'left',
  secPerLoop: 5,
  fps: 18,
  padding: 6,
  gap: 48,
  bg: '#2f4bd6',
  fg: '#ffffff',
  transparent: false,
  bold: true,
  bgType: 'solid',
  bgGradAngle: 90,
  bgGradStops: [{ color: '#2f6bff', pos: 0 }, { color: '#9b3bff', pos: 1 }],
  fillType: 'solid',
  gradAngle: 90,
  gradStops: [{ color: '#ff5a1f', pos: 0 }, { color: '#ffd400', pos: 1 }],
  shadow: false,
  shadowColor: '#ff4d3d',
  shadowDist: 4,
  shadowAngle: 45,
  stroke: false,
  strokeColor: '#16140f',
  strokeWidth: 3,
  planLimit: PLAN.free,
  emojiName: 'imagineering',
}

export type Action =
  | { type: 'patch'; patch: Partial<EmojiState> }
  | { type: 'swap' }
  | { type: 'applyPreset'; preset: StylePreset }

export function reducer(state: EmojiState, action: Action): EmojiState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch }
    case 'swap': {
      // swap the FULL background and text configuration (type, colour, stops, angle)
      const next: EmojiState = {
        ...state,
        bgType: state.fillType,
        fillType: state.bgType,
        bg: state.fg,
        fg: state.bg,
        bgGradStops: state.gradStops,
        gradStops: state.bgGradStops,
        bgGradAngle: state.gradAngle,
        gradAngle: state.bgGradAngle,
      }
      next.transparent = next.bgType === 'transparent'
      return next
    }
    case 'applyPreset': {
      const next = { ...state, ...action.preset }
      next.transparent = next.bgType === 'transparent'
      return next
    }
  }
}

/** Snapshot of every style-related field, deep-cloned for a saved preset. */
export function captureStyle(s: EmojiState): StylePreset {
  return JSON.parse(
    JSON.stringify({
      font: s.font,
      size: s.size,
      track: s.track,
      padding: s.padding,
      gap: s.gap,
      mode: s.mode,
      secPerLoop: s.secPerLoop,
      fps: s.fps,
      bold: s.bold,
      bgType: s.bgType,
      bg: s.bg,
      bgGradAngle: s.bgGradAngle,
      bgGradStops: s.bgGradStops,
      fillType: s.fillType,
      fg: s.fg,
      gradAngle: s.gradAngle,
      gradStops: s.gradStops,
      shadow: s.shadow,
      shadowColor: s.shadowColor,
      shadowDist: s.shadowDist,
      shadowAngle: s.shadowAngle,
      stroke: s.stroke,
      strokeColor: s.strokeColor,
      strokeWidth: s.strokeWidth,
    }),
  )
}
