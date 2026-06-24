import { useEffect } from 'react'
import type { RefObject } from 'react'
import { drawScene } from '../lib/draw'
import type { EmojiState } from '../lib/types'

/**
 * Drives the live preview: one requestAnimationFrame loop that scrolls the scene
 * and paints both the big preview and the inline (message) canvas every frame.
 * Reads the latest state/playing through refs so it never needs restarting.
 */
export function useAnimationLoop(
  bigRef: RefObject<HTMLCanvasElement | null>,
  inlineRef: RefObject<HTMLCanvasElement | null>,
  stateRef: RefObject<EmojiState>,
  playingRef: RefObject<boolean>,
) {
  useEffect(() => {
    const big = bigRef.current?.getContext('2d') ?? null
    const inline = inlineRef.current?.getContext('2d') ?? null
    let raf = 0
    let phase = 0
    let last = 0
    let lastCycle = 240 // px travelled in one full loop, updated each draw

    function loop(t: number) {
      if (!last) last = t
      const dt = (t - last) / 1000
      last = t
      const s = stateRef.current
      if (playingRef.current && s.mode !== 'static') {
        const dir = s.mode === 'right' ? -1 : 1
        const pxPerSec = lastCycle / s.secPerLoop
        phase += dir * pxPerSec * dt
      }
      if (big) lastCycle = drawScene(big, s, phase, false).cycle
      if (inline) {
        inline.clearRect(0, 0, 128, 128)
        drawScene(inline, s, phase, false)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [bigRef, inlineRef, stateRef, playingRef])
}
