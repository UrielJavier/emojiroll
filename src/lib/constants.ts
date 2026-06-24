import type { FontKey, GradStop, Plan } from './types'

interface FontDef {
  css: string
  name: string
  /** webfont family name to await via document.fonts.load, or null for system fonts */
  wname: string | null
}

export const FONTS: Record<FontKey, FontDef> = {
  archivo: { css: '"Archivo Black", system-ui, sans-serif', name: 'Archivo Black', wname: 'Archivo Black' },
  bungee: { css: '"Bungee", system-ui, sans-serif', name: 'Bungee', wname: 'Bungee' },
  anton: { css: '"Anton", system-ui, sans-serif', name: 'Anton', wname: 'Anton' },
  grotesk: { css: '"Space Grotesk", system-ui, sans-serif', name: 'Space Grotesk', wname: 'Space Grotesk' },
  press: { css: '"Press Start 2P", monospace', name: 'Press Start 2P', wname: 'Press Start 2P' },
  pacifico: { css: '"Pacifico", cursive', name: 'Pacifico', wname: 'Pacifico' },
  system: { css: 'system-ui, "Segoe UI", Roboto, sans-serif', name: 'system', wname: null },
  mono: { css: 'ui-monospace, "JetBrains Mono", Menlo, monospace', name: 'mono', wname: null },
}

export interface FontOption {
  val: FontKey
  label: string
  family: string
  fontSize?: string
}

export const FONT_OPTIONS: FontOption[] = [
  { val: 'archivo', label: 'Archivo Black — gruesa', family: "'Archivo Black',sans-serif" },
  { val: 'bungee', label: 'Bungee — bloque', family: "'Bungee',sans-serif" },
  { val: 'anton', label: 'Anton — condensada alta', family: "'Anton',sans-serif" },
  { val: 'grotesk', label: 'Space Grotesk — limpia', family: "'Space Grotesk',sans-serif" },
  { val: 'press', label: 'Press Start 2P — píxel', family: "'Press Start 2P',monospace", fontSize: '11px' },
  { val: 'pacifico', label: 'Pacifico — script', family: "'Pacifico',cursive" },
  { val: 'system', label: 'Sistema — sans', family: 'system-ui,sans-serif' },
  { val: 'mono', label: 'Monoespaciada', family: 'ui-monospace,monospace' },
]

export const SWATCHES = [
  '#2f4bd6', '#7b2ff7', '#ff5a1f', '#ff2d78', '#22b4a0',
  '#b6ff3a', '#16140f', '#ffffff', '#4a154b', '#ffd400',
]

export const PLAN: Record<Plan, number> = {
  free: 128 * 1024, // Slack: 128 KB gratis
  paid: 1024 * 1024, // 1 MB de pago
}

export const GRAD_PRESETS: Record<string, GradStop[]> = {
  rainbow: [
    { color: '#ff3b3b', pos: 0 }, { color: '#ff9a1f', pos: 0.2 }, { color: '#ffe11f', pos: 0.4 },
    { color: '#37c871', pos: 0.6 }, { color: '#2f6bff', pos: 0.8 }, { color: '#9b3bff', pos: 1 },
  ],
  sunset: [{ color: '#ff5a1f', pos: 0 }, { color: '#ff2d78', pos: 0.55 }, { color: '#7b2ff7', pos: 1 }],
  ocean: [{ color: '#22b4a0', pos: 0 }, { color: '#2f6bff', pos: 1 }],
  gold: [{ color: '#fff3b0', pos: 0 }, { color: '#ffd400', pos: 0.5 }, { color: '#b8860b', pos: 1 }],
}

export const GRAD_PRESET_OPTIONS = [
  { key: 'rainbow', label: 'Arcoíris' },
  { key: 'sunset', label: 'Atardecer' },
  { key: 'ocean', label: 'Océano' },
  { key: 'gold', label: 'Oro' },
]

/** 3×3 direction pad; null marks the inert centre cell. `key` is an i18n key. */
export interface DirCell {
  angle: number
  arrow: string
  key: string
}
export const DIR_CELLS: (DirCell | null)[] = [
  { angle: 225, arrow: '↖', key: 'dir.tl' },
  { angle: 270, arrow: '↑', key: 'dir.t' },
  { angle: 315, arrow: '↗', key: 'dir.tr' },
  { angle: 180, arrow: '←', key: 'dir.l' },
  null,
  { angle: 0, arrow: '→', key: 'dir.r' },
  { angle: 135, arrow: '↙', key: 'dir.bl' },
  { angle: 90, arrow: '↓', key: 'dir.b' },
  { angle: 45, arrow: '↘', key: 'dir.br' },
]

export const SMOOTH_LABELS: Record<number, string> = { 12: 'Compacto', 18: 'Estándar', 25: 'Suave' }
export const SMOOTH_OPTIONS = [
  { value: 12, label: 'Compacto — menos frames, menos peso' },
  { value: 18, label: 'Estándar' },
  { value: 25, label: 'Suave — más frames, más peso' },
]

export const PRESETS_STORE_KEY = 'slackEmojiPresets_v2'
export const STATE_STORE_KEY = 'slackEmojiState_v2'
