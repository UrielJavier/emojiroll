import { useState } from 'react'
import { TextPanel } from './TextPanel'
import { MotionPanel } from './MotionPanel'
import { ColorsPanel } from './ColorsPanel'
import { useI18n } from '../i18n'
import type { ContrastResult } from '../lib/color'
import type { EmojiState, FontKey, TextLayer } from '../lib/types'

type Tab = 'texto' | 'movimiento' | 'color'
const TABS: { id: Tab; key: string }[] = [
  { id: 'texto', key: 'tabs.text' },
  { id: 'movimiento', key: 'tabs.motion' },
  { id: 'color', key: 'tabs.color' },
]

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  state: EmojiState
  setGlobal: (patch: Partial<EmojiState>) => void
  onTextChange: (value: string) => void
  onPreviewFont: (font: FontKey | null) => void
  showGuide: boolean
  onShowGuide: (value: boolean) => void
  ensureFontKey: (font: FontKey) => void
  ensureAllFonts: () => void
  onSwap: () => void
  contrast: ContrastResult
}

/** A single card that edits the active layer, with Texto / Movimiento / Color tabs. */
export function LayerEditor(props: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>('texto')
  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Editar capa activa">
        {TABS.map((tabDef) => (
          <button
            key={tabDef.id}
            type="button"
            role="tab"
            aria-selected={tab === tabDef.id}
            className={tab === tabDef.id ? 'active' : undefined}
            onClick={() => setTab(tabDef.id)}
          >
            {t(tabDef.key)}
          </button>
        ))}
      </div>
      <div className="tab-body">
        {tab === 'texto' && (
          <TextPanel
            layer={props.layer}
            setLayer={props.setLayer}
            onTextChange={props.onTextChange}
            onPreviewFont={props.onPreviewFont}
            showGuide={props.showGuide}
            onShowGuide={props.onShowGuide}
            ensureFontKey={props.ensureFontKey}
            ensureAllFonts={props.ensureAllFonts}
          />
        )}
        {tab === 'movimiento' && (
          <MotionPanel layer={props.layer} setLayer={props.setLayer} state={props.state} setGlobal={props.setGlobal} />
        )}
        {tab === 'color' && (
          <ColorsPanel
            layer={props.layer}
            setLayer={props.setLayer}
            state={props.state}
            setGlobal={props.setGlobal}
            onSwap={props.onSwap}
            contrast={props.contrast}
          />
        )}
      </div>
    </div>
  )
}
