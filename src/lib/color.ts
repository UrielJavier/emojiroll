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

function contrastBand(r: number): { cls: ContrastLevel; msg: string } {
  if (r >= 4.5) return { cls: 'ok', msg: 'Buen contraste, se lee bien a tamaño emoji.' }
  if (r >= 3) return { cls: 'mid', msg: 'Aceptable para texto grande; a tamaño emoji puede quedar justo.' }
  if (r >= 2) return { cls: 'low', msg: 'Contraste bajo: costará leerse en pequeño.' }
  return { cls: 'bad', msg: 'Contraste muy bajo: casi ilegible. Cambia un color.' }
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

/** Worst-case contrast between a layer's text and the background, plus guidance. */
export function computeContrast(layer: TextLayer, s: EmojiState): ContrastResult {
  const textTransparent = layer.fillType === 'transparent'
  const bgTransparent = s.bgType === 'transparent'
  const textColors =
    layer.fillType === 'gradient' && layer.gradStops.length ? layer.gradStops.map((x) => x.color) : [layer.fg]
  const bgColors =
    s.bgType === 'gradient' && s.bgGradStops.length ? s.bgGradStops.map((x) => x.color) : [s.bg]

  if (textTransparent && bgTransparent) {
    return {
      level: 'bad',
      ratioText: '—',
      fillPct: 0,
      msg: 'Texto y fondo transparentes: el emoji quedaría invisible. Pon un fondo sólido o degradado.',
    }
  }

  let r: number
  let note = ''
  if (textTransparent) {
    // the visible 'ink' is the background; the letters are holes onto the chat theme
    const rcl = worstPair(bgColors, ['#ffffff']) // tema claro
    const rcd = worstPair(bgColors, ['#1a1d21']) // tema oscuro
    r = Math.min(rcl, rcd)
    note = `Texto calado (se ve el chat). Claro ${rcl.toFixed(1)}:1 · Oscuro ${rcd.toFixed(1)}:1. `
  } else if (bgTransparent) {
    const rl = worstPair(textColors, ['#ffffff'])
    const rd = worstPair(textColors, ['#1a1d21'])
    r = Math.min(rl, rd)
    note = `Transparente: depende del tema. Claro ${rl.toFixed(1)}:1 · Oscuro ${rd.toFixed(1)}:1. `
  } else {
    r = worstPair(textColors, bgColors)
    if (s.bgType === 'gradient') note = 'Fondo degradado. '
  }
  if (layer.fillType === 'gradient') note = 'Texto degradado (peor parada). ' + note

  const band = contrastBand(r)
  const fillPct = Math.max(0, Math.min(100, ((r - 1) / 6) * 100))
  const extra = !layer.stroke && (band.cls === 'low' || band.cls === 'bad') ? ' Prueba activar el contorno.' : ''
  return { level: band.cls, ratioText: `${r.toFixed(1)}:1`, fillPct, msg: note + band.msg + extra }
}
