import { useEffect } from 'react'
import type { RefObject } from 'react'
import { drawScene, anyMoving } from '../lib/draw'
import type { EmojiState } from '../lib/types'

/**
 * Drives the live preview: one requestAnimationFrame loop advancing a master-loop
 * phase (fraction of secPerLoop) and painting both the big preview and the inline
 * (message) canvas each frame. Reads the latest state/playing through refs.
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
    let phase = 0 // fraction of the master loop elapsed
    let last = 0

    function loop(t: number) {
      if (!last) last = t
      const dt = (t - last) / 1000
      last = t
      const s = stateRef.current
      if (playingRef.current && anyMoving(s) && s.secPerLoop > 0) {
        phase = (phase + dt / s.secPerLoop) % 1024
      }
      if (big) drawScene(big, s, phase, false)
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
