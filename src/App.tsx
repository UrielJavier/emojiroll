import { useEffect, useReducer, useRef, useState } from 'react'
import { reducer, initialState, captureStyle, getActiveLayer } from './state/reducer'
import { loadState, saveState } from './state/persist'
import { useAnimationLoop } from './hooks/useAnimationLoop'
import { useFonts } from './hooks/useFonts'
import { usePresets } from './hooks/usePresets'
import { computeContrast, sanitizeName } from './lib/color'
import { useI18n } from './i18n'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { LayersPanel } from './components/LayersPanel'
import { LayerEditor } from './components/LayerEditor'
import { PresetsPanel } from './components/PresetsPanel'
import { PreviewPanel } from './components/PreviewPanel'
import type { EmojiState, StylePreset, TextLayer } from './lib/types'

export default function App() {
  const { t } = useI18n()
  const [state, dispatch] = useReducer(reducer, initialState, loadState)
  const active = getActiveLayer(state)
  const setGlobal = (patch: Partial<EmojiState>) => dispatch({ type: 'patch', patch })
  const setLayer = (patch: Partial<TextLayer>) => dispatch({ type: 'patchLayer', id: state.activeLayerId, patch })

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
    nameEdited.current = state.emojiName !== (sanitizeName(state.layers[0].text) || 'emoji')
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

  // load the initial committed fonts once
  useEffect(() => {
    fonts.ensureFont(stateRef.current)
  }, [fonts])

  // auto-save work-in-progress state (debounced) so a reload keeps your edits
  useEffect(() => {
    const id = setTimeout(() => saveState(state), 250)
    return () => clearTimeout(id)
  }, [state])

  const contrast = computeContrast(active, state)

  const onTextChange = (value: string) => {
    dispatch({ type: 'patchLayer', id: state.activeLayerId, patch: { text: value } })
    if (!nameEdited.current) {
      const firstText = state.activeLayerId === state.layers[0].id ? value : state.layers[0].text
      dispatch({ type: 'patch', patch: { emojiName: sanitizeName(firstText) || 'emoji' } })
    }
  }
  const onEmojiNameChange = (value: string) => {
    nameEdited.current = true
    setGlobal({ emojiName: sanitizeName(value) || 'emoji' })
  }
  const onApplyPreset = (preset: StylePreset) => dispatch({ type: 'applyPreset', preset })
  const onReset = () => {
    const ok = window.confirm(t('app.resetConfirm'))
    if (!ok) return
    nameEdited.current = false
    dispatch({ type: 'reset' })
  }

  return (
    <div className="wrap">
      <header className="topbar">
        <div>
          <p className="eyebrow">{t('app.eyebrow')}</p>
          <h1>Emojiroll</h1>
        </div>
        <div className="topbar-actions">
          <LanguageSwitcher />
          <button type="button" className="reset-btn" onClick={onReset}>
            {t('app.reset')}
          </button>
        </div>
      </header>

      <div className="grid">
        <div>
          <LayersPanel
            layers={state.layers}
            activeId={state.activeLayerId}
            onSelect={(id) => dispatch({ type: 'setActive', id })}
            onAdd={() => dispatch({ type: 'addLayer' })}
            onRemove={(id) => dispatch({ type: 'removeLayer', id })}
            onMove={(id, dir) => dispatch({ type: 'moveLayer', id, dir })}
            onReorder={(id, beforeId) => dispatch({ type: 'reorderLayer', id, beforeId })}
          />
          <LayerEditor
            layer={active}
            setLayer={setLayer}
            state={state}
            setGlobal={setGlobal}
            onTextChange={onTextChange}
            onPreviewFont={(f) => setGlobal({ previewFont: f })}
            showGuide={showGuide}
            onShowGuide={setShowGuide}
            ensureFontKey={fonts.ensureFontKey}
            ensureAllFonts={() => fonts.ensureAllFonts(active.size)}
            onSwap={() => dispatch({ type: 'swap' })}
            contrast={contrast}
          />
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
            set={setGlobal}
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
