import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { drawScene, anyMoving } from './draw'
import { Fill } from './types'
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
  const transparent = state.bgType === Fill.Transparent || state.layers.some((l) => l.fillType === Fill.Transparent)
  const format = transparent ? 'rgba4444' : 'rgb565'

  const off = document.createElement('canvas')
  off.width = 128
  off.height = 128
  const octx = off.getContext('2d')
  if (!octx) throw new Error('No se pudo crear el contexto de dibujo.')

  // frame plan: a static-only scene is a single frame; otherwise sample the master loop
  const moving = anyMoving(state)
  let frames: number
  let delay: number
  if (!moving) {
    frames = 1
    delay = 100
  } else {
    frames = framesFor(state.secPerLoop, state.fps)
    delay = Math.round((state.secPerLoop * 1000) / frames) // loop lasts exactly secPerLoop
  }

  // Build one palette for the whole loop. Sampling only frame 0 is wrong for moving
  // content: a scrolling image/text starts off-screen at frame 0, so its colors never
  // enter the palette — on a solid bg everything then quantizes to the single bg colour
  // (image vanishes) and on a gradient it maps to a garbled subset (image looks broken).
  // So we accumulate pixels from several frames spread across the loop and quantize those.
  const sampleCount = moving ? Math.min(frames, 8) : 1
  const frameBytes = 128 * 128 * 4
  let sample: Uint8Array | Uint8ClampedArray
  if (sampleCount === 1) {
    drawScene(octx, state, 0, true)
    sample = octx.getImageData(0, 0, 128, 128).data
  } else {
    const buf = new Uint8Array(sampleCount * frameBytes)
    for (let s = 0; s < sampleCount; s++) {
      drawScene(octx, state, s / sampleCount, true)
      buf.set(octx.getImageData(0, 0, 128, 128).data, s * frameBytes)
    }
    sample = buf
  }
  const palette = quantize(sample, 256, { format })
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
    drawScene(octx, state, i / frames, true) // phaseLoops in [0, 1): frame `frames` == frame 0
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
