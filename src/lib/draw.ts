import { FONTS } from './constants'
import { Effect, Fill, Mode } from './types'
import type { EmojiState, TextLayer } from './types'

type Ctx = CanvasRenderingContext2D

interface Measure {
  chars: string[]
  widths: number[]
  total: number
}

export function fontString(l: TextLayer): string {
  const f = FONTS[l.font]
  const weight = l.font === 'system' || l.font === 'mono' ? (l.bold ? '700' : '400') : '400'
  return weight + ' ' + l.size + 'px ' + f.css
}

function measure(ctx: Ctx, l: TextLayer): Measure {
  ctx.font = fontString(l)
  const chars = Array.from(l.text.length ? l.text : ' ')
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + l.track * (chars.length - 1)
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
function drawWord(ctx: Ctx, m: Measure, x: number, y: number, l: TextLayer, fillStyle: string | CanvasGradient) {
  if (l.shadow) {
    const ang = typeof l.shadowAngle === 'number' ? l.shadowAngle : 45
    const rad = (ang * Math.PI) / 180
    const dx = Math.round(Math.cos(rad) * l.shadowDist)
    const dy = Math.round(Math.sin(rad) * l.shadowDist)
    ctx.fillStyle = l.shadowColor
    drawChars(ctx, m, x + dx, y + dy, l.track)
  }
  if (l.stroke && l.strokeWidth > 0) {
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2
    ctx.lineWidth = l.strokeWidth * 2 // half is covered by the fill, so visible outline ≈ strokeWidth
    ctx.strokeStyle = l.strokeColor
    drawChars(ctx, m, x, y, l.track, 'stroke')
  }
  if (l.fillType === Fill.Transparent) {
    // knockout: punch the glyph out of whatever is behind it
    const prevOp = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = '#000'
    drawChars(ctx, m, x, y, l.track)
    ctx.globalCompositeOperation = prevOp
  } else {
    ctx.fillStyle = fillStyle || l.fg
    drawChars(ctx, m, x, y, l.track)
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
  l: TextLayer,
  x: number,
  y: number,
  width: number,
  asc: number,
  desc: number,
): string | CanvasGradient {
  if (l.fillType !== Fill.Gradient || !l.gradStops || l.gradStops.length < 2) return l.fg
  const rad = ((l.gradAngle || 0) * Math.PI) / 180
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
  l.gradStops
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .forEach((st) => g.addColorStop(Math.max(0, Math.min(1, st.pos)), st.color))
  return g
}

// real glyph box for the current text (relative to alphabetic baseline)
function glyphMetrics(ctx: Ctx, l: TextLayer): { asc: number; desc: number; h: number } {
  ctx.font = fontString(l)
  const bb = ctx.measureText(l.text && l.text.length ? l.text : ' ')
  const asc = isFinite(bb.actualBoundingBoxAscent) ? bb.actualBoundingBoxAscent : l.size * 0.72
  const desc = isFinite(bb.actualBoundingBoxDescent) ? bb.actualBoundingBoxDescent : l.size * 0.2
  return { asc, desc, h: asc + desc }
}

// Offscreen probe to measure a layer's real painted ink. We centre the body band
// (cap height), ignoring accent/diacritic overshoot above the caps and descenders
// below the baseline — so "Café" sits centred like an all-caps word would.
const _probe = typeof document !== 'undefined' ? document.createElement('canvas') : null
const _pctx = _probe ? _probe.getContext('2d', { willReadFrequently: true }) : null
const _bodyMemo = new Map<string, number>()

/** Painted-ink extent of `text`, in px above/below the alphabetic baseline (or null). */
function scanExtent(text: string, fStr: string, sw: number, size: number): { asc: number; desc: number } | null {
  if (!_probe || !_pctx) return null
  _pctx.font = fStr
  const measured = Math.ceil(_pctx.measureText(text).width)
  const pad = 8 + sw * 2
  const w = Math.min(4096, Math.max(16, measured) + pad * 2)
  const h = Math.ceil(size * 2 + pad * 2 + sw * 2)
  _probe.width = w // resizing resets the context, so re-apply state below
  _probe.height = h
  const baseY = Math.round(h / 2)
  _pctx.font = fStr
  _pctx.textBaseline = 'alphabetic'
  if (sw) {
    _pctx.lineJoin = 'round'
    _pctx.miterLimit = 2
    _pctx.lineWidth = sw * 2
    _pctx.strokeStyle = '#fff'
    _pctx.strokeText(text, pad, baseY)
  }
  _pctx.fillStyle = '#fff'
  _pctx.fillText(text, pad, baseY)

  const data = _pctx.getImageData(0, 0, w, h).data
  let top = -1
  let bot = -1
  for (let y = 0; y < h; y++) {
    const row = y * w * 4
    for (let x = 0; x < w; x++) {
      if (data[row + x * 4 + 3] > 8) {
        if (top < 0) top = y
        bot = y
        break
      }
    }
  }
  if (top < 0) return null
  return { asc: baseY - top, desc: bot - baseY }
}

/** Ascent (px above baseline) of a layer's body band: real ink ascent clamped to cap height. */
function bodyAscent(l: TextLayer): number | null {
  if (!_probe || !_pctx) return null
  const fStr = fontString(l)
  const ready = typeof document !== 'undefined' && document.fonts ? document.fonts.check(fStr) : true
  const sw = l.stroke && l.strokeWidth > 0 ? l.strokeWidth : 0
  const text = l.text && l.text.length ? l.text : ' '
  const key = `${text}|${fStr}|${sw}|${ready}`
  const cached = _bodyMemo.get(key)
  if (cached !== undefined) return cached

  const full = scanExtent(text, fStr, sw, l.size)
  if (!full) return null
  const cap = scanExtent('H', fStr, sw, l.size)
  const capAsc = cap ? cap.asc : full.asc
  const asc = Math.min(full.asc, capAsc)
  if (_bodyMemo.size > 64) _bodyMemo.clear()
  _bodyMemo.set(key, asc)
  return asc
}

// cache of uploaded layer images by data URL
const _imgCache = new Map<string, HTMLImageElement>()
function getImage(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null
  let img = _imgCache.get(src)
  if (!img) {
    img = new Image()
    img.src = src
    _imgCache.set(src, img)
  }
  return img
}
function imgReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0
}

/** Wait until every layer image is decoded (used before encoding so no frame is blank). */
export function preloadImages(state: EmojiState): Promise<unknown> {
  const srcs = state.layers.map((l) => l.image).filter((s): s is string => !!s)
  return Promise.all(
    srcs.map((src) => {
      const img = getImage(src)
      if (!img || (img.complete && img.naturalWidth > 0)) return Promise.resolve()
      return new Promise<void>((res) => {
        img.onload = () => res()
        img.onerror = () => res()
      })
    }),
  )
}

/** x positions for the layer's tiles (one centred tile when static, else the scrolling row). */
function tileXs(layer: TextLayer, total: number, phaseLoops: number, rotated: boolean): number[] {
  if (layer.mode === Mode.Static) return [Math.round((128 - total) / 2)]
  const cycle = total + layer.gap
  const dir = layer.mode === Mode.Right ? -1 : 1
  const off = (((dir * layer.speed * cycle * phaseLoops) % cycle) + cycle) % cycle
  const base = 128 - off
  // rotation needs the row to reach the canvas diagonal (~181px), so tile wider
  const xMin = rotated ? -110 : -cycle
  const xMax = rotated ? 238 : 128 + cycle
  const xs: number[] = []
  for (let k = Math.floor((xMin - base) / cycle); k <= Math.ceil((xMax - base) / cycle); k++) xs.push(base + k * cycle)
  return xs
}

/** Draws a single layer (text or image) with its parallax offset, angle and effect. */
function drawLayer(ctx: Ctx, layer: TextLayer, state: EmojiState, phaseLoops: number, forEncode: boolean) {
  const fk = !forEncode && state.previewFont && layer.id === state.activeLayerId ? state.previewFont : layer.font
  let eff: TextLayer = fk === layer.font ? layer : { ...layer, font: fk }

  ctx.textBaseline = 'alphabetic'
  const pad = state.padding || 0
  const maxH = 128 - 2 * pad
  const maxW = 128 - 2 * pad

  // effect, driven by the loop phase (integer cycles per loop → seamless)
  const cycles = eff.effectSpeed || 2
  const wave = Math.sin(phaseLoops * Math.PI * 2 * cycles)
  if (eff.effect === Effect.Blink && Math.floor(phaseLoops * 2 * cycles) % 2 === 1) return
  let vy = 64 + eff.offsetY
  if (eff.effect === Effect.Bob) vy += Math.round(wave * 6)
  const pulse = eff.effect === Effect.Pulse ? 1 + wave * 0.12 : 1
  const rainbow =
    eff.effect === Effect.Rainbow ? `hsl(${Math.round((((phaseLoops * 360 * cycles) % 360) + 360) % 360)}, 85%, 56%)` : null

  // resolve what to paint (image or text) and how wide it is
  let total: number
  let paintTile: (x: number) => void

  if (eff.image) {
    const img = getImage(eff.image)
    if (!imgReady(img)) return
    let h = Math.min(eff.size, maxH)
    let w = Math.max(1, Math.round((img.naturalWidth / img.naturalHeight) * h))
    if (eff.mode === Mode.Static && w > maxW) {
      const s = maxW / w
      w = Math.round(w * s)
      h = Math.round(h * s)
    }
    total = w
    paintTile = (x) => ctx.drawImage(img, Math.round(x), Math.round(vy - h / 2), w, h)
  } else {
    const strokeExtra = eff.stroke && eff.strokeWidth > 0 ? eff.strokeWidth * 2 : 0
    let met = glyphMetrics(ctx, eff)
    let m = measure(ctx, eff)
    let scale = 1
    if (met.h + strokeExtra > maxH) scale = Math.min(scale, Math.max(0.1, maxH - strokeExtra) / met.h)
    if (eff.mode === Mode.Static && m.total + strokeExtra > maxW)
      scale = Math.min(scale, Math.max(0.1, maxW - strokeExtra) / m.total)
    if (scale < 1) {
      eff = { ...eff, size: Math.max(8, Math.floor(eff.size * scale)) }
      met = glyphMetrics(ctx, eff)
      m = measure(ctx, eff)
    }
    const ba = bodyAscent(eff)
    const half = (ba != null ? ba : met.asc - met.desc) / 2
    const m2 = m
    const met2 = met
    const eff2 = eff
    total = m.total
    paintTile = (x) => {
      const y = Math.round(vy + half)
      drawWord(ctx, m2, x, y, eff2, rainbow ?? buildFill(ctx, eff2, x, y, m2.total, met2.asc, met2.desc))
    }
  }

  const rad = ((eff.angle || 0) * Math.PI) / 180
  const transformed = rad !== 0 || pulse !== 1
  if (transformed) {
    ctx.save()
    ctx.translate(64, 64)
    ctx.rotate(rad)
    ctx.scale(pulse, pulse)
    ctx.translate(-64, -64)
  }
  for (const x of tileXs(eff, total, phaseLoops, rad !== 0)) paintTile(x)
  if (transformed) ctx.restore()
}

/**
 * Draws the full scene (background + every layer) at `phaseLoops` (fraction of the
 * master loop; each layer scrolls `speed` whole cycles per loop, so the loop is seamless).
 * `forEncode` ignores the hover preview font (encoding always uses the committed font).
 */
export function drawScene(ctx: Ctx, state: EmojiState, phaseLoops: number, forEncode: boolean): void {
  ctx.clearRect(0, 0, 128, 128)
  if (state.bgType === Fill.Gradient) {
    ctx.fillStyle = buildBgGradient(ctx, state)
    ctx.fillRect(0, 0, 128, 128)
  } else if (state.bgType !== Fill.Transparent) {
    ctx.fillStyle = state.bg
    ctx.fillRect(0, 0, 128, 128)
  }
  for (const layer of state.layers) {
    drawLayer(ctx, layer, state, phaseLoops, forEncode)
  }
}

/** True if anything animates (a layer scrolls or has an effect) → the GIF needs frames. */
export function anyMoving(state: EmojiState): boolean {
  return state.layers.some((l) => l.mode !== Mode.Static || l.effect !== Effect.None)
}
