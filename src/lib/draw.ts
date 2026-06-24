import { FONTS } from './constants'
import type { EmojiState } from './types'

type Ctx = CanvasRenderingContext2D

interface Measure {
  chars: string[]
  widths: number[]
  total: number
}

export interface SceneInfo {
  total: number
  /** distance travelled in one full loop (px); equals total for static mode */
  cycle: number
}

export function fontString(s: EmojiState): string {
  const f = FONTS[s.font]
  const weight = s.font === 'system' || s.font === 'mono' ? (s.bold ? '700' : '400') : '400'
  return weight + ' ' + s.size + 'px ' + f.css
}

function measure(ctx: Ctx, s: EmojiState): Measure {
  ctx.font = fontString(s)
  const chars = Array.from(s.text.length ? s.text : ' ')
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + s.track * (chars.length - 1)
  return { chars, widths, total }
}

function drawChars(ctx: Ctx, m: Measure, x: number, y: number, track: number, method?: 'stroke') {
  const fn = method === 'stroke' ? 'strokeText' : 'fillText'
  let cx = x
  for (let i = 0; i < m.chars.length; i++) {
    ctx[fn](m.chars[i], cx, y)
    cx += m.widths[i] + track
  }
}

// draws one word: shadow (behind) + outline + main fill
function drawWord(ctx: Ctx, m: Measure, x: number, y: number, s: EmojiState, fillStyle: string | CanvasGradient) {
  if (s.shadow) {
    const ang = typeof s.shadowAngle === 'number' ? s.shadowAngle : 45
    const rad = (ang * Math.PI) / 180
    const dx = Math.round(Math.cos(rad) * s.shadowDist)
    const dy = Math.round(Math.sin(rad) * s.shadowDist)
    ctx.fillStyle = s.shadowColor
    drawChars(ctx, m, x + dx, y + dy, s.track)
  }
  if (s.stroke && s.strokeWidth > 0) {
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2
    ctx.lineWidth = s.strokeWidth * 2 // half is covered by the fill, so visible outline ≈ strokeWidth
    ctx.strokeStyle = s.strokeColor
    drawChars(ctx, m, x, y, s.track, 'stroke')
  }
  if (s.fillType === 'transparent') {
    // knockout: punch the glyph out of whatever is behind it
    const prevOp = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = '#000'
    drawChars(ctx, m, x, y, s.track)
    ctx.globalCompositeOperation = prevOp
  } else {
    ctx.fillStyle = fillStyle || s.fg
    drawChars(ctx, m, x, y, s.track)
  }
}

// background gradient spanning the whole 128×128 canvas
function buildBgGradient(ctx: Ctx, s: EmojiState): string | CanvasGradient {
  const stops = s.bgGradStops
  if (!stops || stops.length < 2) return s.bg
  const rad = ((s.bgGradAngle || 0) * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = Math.sin(rad)
  const ext = Math.abs(ux) * 64 + Math.abs(uy) * 64 || 1
  const g = ctx.createLinearGradient(64 - ux * ext, 64 - uy * ext, 64 + ux * ext, 64 + uy * ext)
  stops
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .forEach((st) => g.addColorStop(Math.max(0, Math.min(1, st.pos)), st.color))
  return g
}

// fill style for one word: solid colour or a per-word linear gradient
function buildFill(
  ctx: Ctx,
  s: EmojiState,
  x: number,
  y: number,
  width: number,
  asc: number,
  desc: number,
): string | CanvasGradient {
  if (s.fillType !== 'gradient' || !s.gradStops || s.gradStops.length < 2) return s.fg
  const rad = ((s.gradAngle || 0) * Math.PI) / 180
  const top = y - asc
  const bottom = y + desc
  const left = x
  const right = x + width
  const cx = (left + right) / 2
  const cy = (top + bottom) / 2
  const halfW = (right - left) / 2
  const halfH = (bottom - top) / 2
  const ux = Math.cos(rad)
  const uy = Math.sin(rad)
  const ext = Math.abs(ux) * halfW + Math.abs(uy) * halfH || 1
  const g = ctx.createLinearGradient(cx - ux * ext, cy - uy * ext, cx + ux * ext, cy + uy * ext)
  s.gradStops
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .forEach((st) => g.addColorStop(Math.max(0, Math.min(1, st.pos)), st.color))
  return g
}

// real glyph box for the current text (relative to alphabetic baseline)
function glyphMetrics(ctx: Ctx, eff: EmojiState): { asc: number; desc: number; h: number } {
  ctx.font = fontString(eff)
  const bb = ctx.measureText(eff.text && eff.text.length ? eff.text : ' ')
  const asc = isFinite(bb.actualBoundingBoxAscent) ? bb.actualBoundingBoxAscent : eff.size * 0.72
  const desc = isFinite(bb.actualBoundingBoxDescent) ? bb.actualBoundingBoxDescent : eff.size * 0.2
  return { asc, desc, h: asc + desc }
}

/**
 * Draws one full scene at the given scroll offset (px) and returns its measurements.
 * `forEncode` ignores the hover preview font (encoding always uses the committed font).
 */
export function drawScene(ctx: Ctx, s: EmojiState, offset: number, forEncode: boolean): SceneInfo {
  ctx.clearRect(0, 0, 128, 128)
  if (s.bgType === 'gradient') {
    ctx.fillStyle = buildBgGradient(ctx, s)
    ctx.fillRect(0, 0, 128, 128)
  } else if (s.bgType !== 'transparent') {
    ctx.fillStyle = s.bg
    ctx.fillRect(0, 0, 128, 128)
  }
  // when transparent, leave the canvas cleared (alpha 0)
  const fk = !forEncode && s.previewFont ? s.previewFont : s.font
  let eff: EmojiState = fk === s.font ? s : { ...s, font: fk }

  ctx.textBaseline = 'alphabetic'

  // margin: shrink the font so text (plus outline) fits inside the padded box
  const pad = eff.padding || 0
  const maxH = 128 - 2 * pad
  const maxW = 128 - 2 * pad
  const strokeExtra = eff.stroke && eff.strokeWidth > 0 ? eff.strokeWidth * 2 : 0
  let met = glyphMetrics(ctx, eff)
  let m = measure(ctx, eff)
  let scale = 1
  if (met.h + strokeExtra > maxH) scale = Math.min(scale, Math.max(0.1, maxH - strokeExtra) / met.h)
  if (s.mode === 'static' && m.total + strokeExtra > maxW)
    scale = Math.min(scale, Math.max(0.1, maxW - strokeExtra) / m.total)
  if (scale < 1) {
    eff = { ...eff, size: Math.max(8, Math.floor(eff.size * scale)) }
    met = glyphMetrics(ctx, eff)
    m = measure(ctx, eff)
  }

  // baseline that centres the real glyph block in the canvas
  const y = Math.round(64 + (met.asc - met.desc) / 2)
  if (s.mode === 'static') {
    const sx = Math.round((128 - m.total) / 2)
    drawWord(ctx, m, sx, y, eff, buildFill(ctx, eff, sx, y, m.total, met.asc, met.desc))
    return { total: m.total, cycle: m.total }
  }
  const gap = typeof eff.gap === 'number' ? eff.gap : Math.max(28, eff.size * 0.6)
  const cycle = m.total + gap
  const off = ((offset % cycle) + cycle) % cycle
  const start = 128 - off
  for (let x = start - cycle; x < 128 + cycle; x += cycle) {
    drawWord(ctx, m, x, y, eff, buildFill(ctx, eff, x, y, m.total, met.asc, met.desc))
  }
  return { total: m.total, cycle }
}
