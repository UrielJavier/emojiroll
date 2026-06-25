import { useState } from 'react'
import { TextPanel } from './TextPanel'
import { PositionPanel } from './PositionPanel'
import { MotionPanel } from './MotionPanel'
import { ColorsPanel } from './ColorsPanel'
import { useI18n } from '../i18n'
import type { ContrastResult } from '../lib/color'
import type { FontKey, TextLayer } from '../lib/types'

type Tab = 'texto' | 'posicion' | 'movimiento' | 'color'
const TABS: { id: Tab; key: string }[] = [
  { id: 'texto', key: 'tabs.text' },
  { id: 'posicion', key: 'tabs.position' },
  { id: 'movimiento', key: 'tabs.motion' },
  { id: 'color', key: 'tabs.color' },
]

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  onTextChange: (value: string) => void
  onPreviewFont: (font: FontKey | null) => void
  ensureFontKey: (font: FontKey) => void
  ensureAllFonts: () => void
  contrast: ContrastResult
}

/** Card that edits the active layer: Texto / Movimiento / Color tabs. */
export function LayerEditor(props: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>('texto')
  return (
    <>
      <div className="tabs" role="tablist" aria-label={t('editor.aria')}>
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
            ensureFontKey={props.ensureFontKey}
            ensureAllFonts={props.ensureAllFonts}
          />
        )}
        {tab === 'posicion' && <PositionPanel layer={props.layer} setLayer={props.setLayer} />}
        {tab === 'movimiento' && <MotionPanel layer={props.layer} setLayer={props.setLayer} />}
        {tab === 'color' && <ColorsPanel layer={props.layer} setLayer={props.setLayer} contrast={props.contrast} />}
      </div>
    </>
  )
}
