import { Fill } from './types'
import type { EmojiState, TextLayer } from './types'

export type ContrastLevel = 'ok' | 'mid' | 'low' | 'bad'

/** relative luminance (WCAG) of a #hex colour */
export function lum(hex: string): number {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
  const r = parseInt(c.substr(0, 2), 16) / 255
  const g = parseInt(c.substr(2, 2), 16) / 255
  const b = parseInt(c.substr(4, 2), 16) / 255
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** ink colour that reads well on top of the given background */
export function contrastFor(hex: string): string {
  return lum(hex) > 0.42 ? '#16140f' : '#ffffff'
}

/** Slack emoji names: lowercase letters, numbers, - and _ */
export function sanitizeName(s: string): string {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** WCAG contrast ratio (1:1 .. 21:1) */
export function contrastRatio(a: string, b: string): number {
  const L1 = lum(a)
  const L2 = lum(b)
  const hi = Math.max(L1, L2)
  const lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}

function contrastBand(r: number): ContrastLevel {
  if (r >= 4.5) return 'ok'
  if (r >= 3) return 'mid'
  if (r >= 2) return 'low'
  return 'bad'
}

function worstPair(textCols: string[], bgCols: string[]): number {
  let min = Infinity
  textCols.forEach((t) => bgCols.forEach((b) => { min = Math.min(min, contrastRatio(t, b)) }))
  return min
}

export interface ContrastResult {
  level: ContrastLevel
  ratioText: string
  fillPct: number
  msg: string
}

/** Worst-case contrast between a layer's text and the background, plus localized guidance. */
export function computeContrast(layer: TextLayer, s: EmojiState, t: (key: string) => string): ContrastResult {
  const textTransparent = layer.fillType === Fill.Transparent
  const bgTransparent = s.bgType === Fill.Transparent
  const textColors =
    layer.fillType === Fill.Gradient && layer.gradStops.length ? layer.gradStops.map((x) => x.color) : [layer.fg]
  const bgColors =
    s.bgType === Fill.Gradient && s.bgGradStops.length ? s.bgGradStops.map((x) => x.color) : [s.bg]

  const themeNote = (prefix: string, light: number, dark: number) =>
    `${prefix} ${t('contrast.light')} ${light.toFixed(1)}:1 · ${t('contrast.dark')} ${dark.toFixed(1)}:1. `

  if (textTransparent && bgTransparent) {
    return { level: 'bad', ratioText: '—', fillPct: 0, msg: t('contrast.both') }
  }

  let r: number
  let note = ''
  if (textTransparent) {
    // the visible 'ink' is the background; the letters are holes onto the chat theme
    const rcl = worstPair(bgColors, ['#ffffff']) // light theme
    const rcd = worstPair(bgColors, ['#1a1d21']) // dark theme
    r = Math.min(rcl, rcd)
    note = themeNote(t('contrast.knockout'), rcl, rcd)
  } else if (bgTransparent) {
    const rl = worstPair(textColors, ['#ffffff'])
    const rd = worstPair(textColors, ['#1a1d21'])
    r = Math.min(rl, rd)
    note = themeNote(t('contrast.transparent'), rl, rd)
  } else {
    r = worstPair(textColors, bgColors)
    if (s.bgType === Fill.Gradient) note = t('contrast.bgGradient') + ' '
  }
  if (layer.fillType === Fill.Gradient) note = t('contrast.textGradient') + ' ' + note

  const cls = contrastBand(r)
  const fillPct = Math.max(0, Math.min(100, ((r - 1) / 6) * 100))
  const extra = !layer.stroke && (cls === 'low' || cls === 'bad') ? ' ' + t('contrast.tryStroke') : ''
  return { level: cls, ratioText: `${r.toFixed(1)}:1`, fillPct, msg: note + t(`contrast.${cls}`) + extra }
}
