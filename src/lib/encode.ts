import { GIFEncoder, quantize, applyPalette } from './gifenc'
import { drawScene } from './draw'
import type { EmojiState, GifResult } from './types'

/** frames for a loop of `sec` seconds at `fps`, clamped to [8, 64] */
export function framesFor(sec: number, fps: number): number {
  return Math.max(8, Math.min(64, Math.round(sec * fps)))
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
  }
  return btoa(bin)
}

/** Renders every frame and encodes a looping GIF with gifenc (main thread, no workers). */
export function encodeGif(state: EmojiState): GifResult {
  const transparent = state.bgType === 'transparent' || state.fillType === 'transparent'
  const format = transparent ? 'rgba4444' : 'rgb565'

  const off = document.createElement('canvas')
  off.width = 128
  off.height = 128
  const octx = off.getContext('2d')
  if (!octx) throw new Error('No se pudo crear el contexto de dibujo.')

  // frame plan
  const m0 = drawScene(octx, state, 0, true)
  let frames: number
  let step: number
  let delay: number
  if (state.mode === 'static') {
    frames = 1
    step = 0
    delay = 100
  } else {
    frames = framesFor(state.secPerLoop, state.fps)
    step = m0.cycle / frames
    delay = Math.round((state.secPerLoop * 1000) / frames) // loop lasts exactly secPerLoop
  }
  const dir = state.mode === 'right' ? -1 : 1

  // build a single palette from frame 0 (all frames share the same colors)
  const data0 = octx.getImageData(0, 0, 128, 128).data
  const palette = quantize(data0, 256, { format })
  let transparentIndex = 0
  if (transparent) {
    transparentIndex = palette.findIndex((p) => p.length >= 4 && p[3] === 0)
    if (transparentIndex < 0) {
      palette.push([0, 0, 0, 0])
      transparentIndex = palette.length - 1
    }
  }

  const enc = GIFEncoder()
  for (let i = 0; i < frames; i++) {
    drawScene(octx, state, dir * i * step, true)
    const data = octx.getImageData(0, 0, 128, 128).data
    const index = applyPalette(data, palette, format)
    const opts: Record<string, unknown> = { delay, dispose: transparent ? 2 : 0 }
    if (i === 0) {
      opts.palette = palette
      opts.repeat = 0
    }
    if (transparent) {
      opts.transparent = true
      opts.transparentIndex = transparentIndex
    }
    enc.writeFrame(index, 128, 128, opts)
  }
  enc.finish()

  const bytes = enc.bytes()
  const url = 'data:image/gif;base64,' + bytesToBase64(bytes)
  return { bytes: bytes.length, frames, url }
}
