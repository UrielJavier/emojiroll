import { useCallback, useRef } from 'react'
import { FONTS } from '../lib/constants'
import type { EmojiState, FontKey } from '../lib/types'

/** Lazily loads webfonts via the FontFace API so canvas measurement/render is accurate. */
export function useFonts() {
  const loaded = useRef<Record<string, boolean>>({})

  const ensureFontKey = useCallback((key: FontKey, size?: number): Promise<unknown> => {
    const f = FONTS[key]
    if (!f || !f.wname || loaded.current[f.wname]) return Promise.resolve()
    loaded.current[f.wname] = true
    const sizes = [size || 58, 58, 92]
    const proms = sizes.map((sz) => {
      try {
        return document.fonts.load(sz + 'px "' + f.wname + '"')
      } catch {
        return Promise.resolve()
      }
    })
    return Promise.all(proms).catch(() => {})
  }, [])

  const ensureFont = useCallback(
    (s: EmojiState) => Promise.all(s.layers.map((l) => ensureFontKey(l.font, l.size))),
    [ensureFontKey],
  )

  const ensureAllFonts = useCallback(
    (size?: number) => {
      ;(Object.keys(FONTS) as FontKey[]).forEach((k) => ensureFontKey(k, size))
    },
    [ensureFontKey],
  )

  return { ensureFontKey, ensureFont, ensureAllFonts }
}
