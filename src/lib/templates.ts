import { initialState, makeLayer } from '../state/reducer'
import { Fill, Mode } from './types'
import type { StylePreset } from './types'

/** Fill a full StylePreset from a few overrides (defaults come from the initial state). */
function preset(p: Partial<StylePreset> & { layers: StylePreset['layers'] }): StylePreset {
  return {
    bg: initialState.bg,
    bgType: initialState.bgType,
    bgGradAngle: initialState.bgGradAngle,
    bgGradStops: initialState.bgGradStops,
    secPerLoop: initialState.secPerLoop,
    fps: initialState.fps,
    padding: initialState.padding,
    ...p,
  }
}

export interface Template {
  name: string
  preset: StylePreset
}

export const TEMPLATES: Template[] = [
  {
    name: 'Party',
    preset: preset({
      bgType: Fill.Gradient,
      bgGradAngle: 90,
      bgGradStops: [{ color: '#ff3b3b', pos: 0 }, { color: '#ffd400', pos: 0.5 }, { color: '#2f6bff', pos: 1 }],
      secPerLoop: 3,
      layers: [makeLayer({ text: 'PARTY', fg: '#ffffff', stroke: true, strokeColor: '#16140f', strokeWidth: 3, speed: 2 })],
    }),
  },
  {
    name: 'LGTM',
    preset: preset({ bg: '#1f9e6b', layers: [makeLayer({ text: 'LGTM', fg: '#ffffff', mode: Mode.Static })] }),
  },
  {
    name: 'LOADING',
    preset: preset({
      bg: '#16140f',
      secPerLoop: 2.5,
      layers: [makeLayer({ text: 'LOADING…', font: 'mono', fg: '#b6ff3a', size: 42 })],
    }),
  },
  {
    name: 'HYPE',
    preset: preset({
      bg: '#ff2d78',
      secPerLoop: 2,
      layers: [makeLayer({ text: 'HYPE', font: 'anton', fg: '#ffd400', size: 84, shadow: true, shadowColor: '#16140f' })],
    }),
  },
  {
    name: 'Parallax',
    preset: preset({
      bg: '#2f4bd6',
      layers: [
        makeLayer({ text: 'PARALLAX', font: 'anton', fg: '#9b3bff', size: 34, offsetY: -26, speed: 1 }),
        makeLayer({ text: 'EMOJIROLL', fg: '#ffd400', size: 48, offsetY: 16, speed: 2, angle: 12 }),
      ],
    }),
  },
  {
    name: 'Neon',
    preset: preset({
      bg: '#0a0a12',
      secPerLoop: 4,
      layers: [makeLayer({ text: 'NEON', font: 'grotesk', fg: '#22e0c8', stroke: true, strokeColor: '#0bdcff', strokeWidth: 2, size: 70 })],
    }),
  },
]
