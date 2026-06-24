import { useEffect, useReducer, useRef, useState } from 'react'
import { reducer, initialState, captureStyle } from './state/reducer'
import { loadState, saveState } from './state/persist'
import { useAnimationLoop } from './hooks/useAnimationLoop'
import { useFonts } from './hooks/useFonts'
import { usePresets } from './hooks/usePresets'
import { computeContrast, sanitizeName } from './lib/color'
import { TextPanel } from './components/TextPanel'
import { MotionPanel } from './components/MotionPanel'
import { ColorsPanel } from './components/ColorsPanel'
import { PresetsPanel } from './components/PresetsPanel'
import { PreviewPanel } from './components/PreviewPanel'
import type { EmojiState, StylePreset } from './lib/types'

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState, loadState)
  const set = (patch: Partial<EmojiState>) => dispatch({ type: 'patch', patch })

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  const [playing, setPlaying] = useState(!prefersReducedMotion)
  const [showGuide, setShowGuide] = useState(true)
  const nameEdited = useRef(false)

  // if a restored state has a custom emoji name, don't auto-derive it from the text
  const didInit = useRef(false)
  if (!didInit.current) {
    didInit.current = true
    nameEdited.current = state.emojiName !== (sanitizeName(state.text) || 'emoji')
  }

  const bigRef = useRef<HTMLCanvasElement>(null)
  const inlineRef = useRef<HTMLCanvasElement>(null)

  // live refs so the rAF loop always sees the latest values without restarting
  const stateRef = useRef(state)
  stateRef.current = state
  const playingRef = useRef(playing)
  playingRef.current = playing

  const fonts = useFonts()
  const presets = usePresets()

  useAnimationLoop(bigRef, inlineRef, stateRef, playingRef)

  // load the initial committed font once
  useEffect(() => {
    fonts.ensureFont(stateRef.current)
  }, [fonts])

  // auto-save work-in-progress state (debounced) so a reload keeps your edits
  useEffect(() => {
    const id = setTimeout(() => saveState(state), 250)
    return () => clearTimeout(id)
  }, [state])

  const contrast = computeContrast(state)

  const onTextChange = (value: string) => {
    const patch: Partial<EmojiState> = { text: value }
    if (!nameEdited.current) patch.emojiName = sanitizeName(value) || 'emoji'
    set(patch)
  }
  const onEmojiNameChange = (value: string) => {
    nameEdited.current = true
    set({ emojiName: sanitizeName(value) || 'emoji' })
  }
  const onApplyPreset = (preset: StylePreset) => dispatch({ type: 'applyPreset', preset })

  return (
    <div className="wrap">
      <header>
        <p className="eyebrow">Emojis animados para Slack</p>
        <h1>Emojiroll</h1>
      </header>

      <div className="grid">
        <div>
          <TextPanel
            state={state}
            set={set}
            onTextChange={onTextChange}
            showGuide={showGuide}
            onShowGuide={setShowGuide}
            ensureFontKey={fonts.ensureFontKey}
            ensureAllFonts={() => fonts.ensureAllFonts(state.size)}
          />
          <MotionPanel state={state} set={set} />
          <ColorsPanel state={state} set={set} onSwap={() => dispatch({ type: 'swap' })} contrast={contrast} />
          <PresetsPanel
            presets={presets.presets}
            canPersist={presets.canPersist}
            onSave={(name) => presets.savePreset(name, captureStyle(state))}
            onApply={onApplyPreset}
            onDelete={presets.deletePreset}
            onImport={presets.importPresets}
          />
        </div>

        <div className="preview-col">
          <PreviewPanel
            state={state}
            set={set}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
            showGuide={showGuide}
            bigRef={bigRef}
            inlineRef={inlineRef}
            ensureFont={fonts.ensureFont}
            onEmojiNameChange={onEmojiNameChange}
          />
        </div>
      </div>
    </div>
  )
}
