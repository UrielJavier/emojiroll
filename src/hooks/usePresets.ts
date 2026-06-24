import { useEffect, useState } from 'react'
import { PRESETS_STORE_KEY } from '../lib/constants'
import type { StylePreset } from '../lib/types'

type PresetMap = Record<string, StylePreset>

/** Probe whether localStorage is usable (private mode / blocked storage returns false). */
function detectPersist(): boolean {
  try {
    localStorage.setItem('__t', '1')
    localStorage.removeItem('__t')
    return true
  } catch {
    return false
  }
}

function loadPresets(): PresetMap {
  try {
    const raw = localStorage.getItem(PRESETS_STORE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as PresetMap) : {}
  } catch {
    return {}
  }
}

/** Style presets, loaded from and persisted to localStorage whenever they change. */
export function usePresets() {
  const [canPersist] = useState(detectPersist)
  const [presets, setPresets] = useState<PresetMap>(loadPresets)

  useEffect(() => {
    if (!canPersist) return
    try {
      localStorage.setItem(PRESETS_STORE_KEY, JSON.stringify(presets))
    } catch {
      /* storage full or blocked — ignore */
    }
  }, [presets, canPersist])

  const savePreset = (name: string, style: StylePreset) =>
    setPresets((prev) => ({ ...prev, [name]: style }))

  const deletePreset = (name: string) =>
    setPresets((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })

  /** Merge imported presets into the current set (incoming names win on collision). */
  const importPresets = (incoming: PresetMap) => setPresets((prev) => ({ ...prev, ...incoming }))

  return { presets, canPersist, savePreset, deletePreset, importPresets }
}
