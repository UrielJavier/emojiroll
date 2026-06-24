import { FontCombo } from './FontCombo'
import { RangeField } from './RangeField'
import { useI18n } from '../i18n'
import type { FontKey, TextLayer } from '../lib/types'

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  onTextChange: (value: string) => void
  onPreviewFont: (font: FontKey | null) => void
  showGuide: boolean
  onShowGuide: (value: boolean) => void
  ensureFontKey: (font: FontKey) => void
  ensureAllFonts: () => void
}

export function TextPanel({
  layer,
  setLayer,
  onTextChange,
  onPreviewFont,
  showGuide,
  onShowGuide,
  ensureFontKey,
  ensureAllFonts,
}: Props) {
  const { t } = useI18n()
  return (
    <>
      <div className="group">
        <label className="field-label" htmlFor="text">
          {t('text.layerText')}
        </label>
        <input
          type="text"
          id="text"
          value={layer.text}
          maxLength={40}
          autoComplete="off"
          onChange={(e) => onTextChange(e.target.value)}
        />
        <p className="hint">{t('text.shortHint')}</p>
      </div>

      <div className="group">
        <label className="field-label">
          {t('text.font')} <span className="val">{t('text.fontHint')}</span>
        </label>
        <FontCombo
          value={layer.font}
          onChange={(f) => setLayer({ font: f })}
          onPreview={onPreviewFont}
          ensureFontKey={ensureFontKey}
          ensureAllFonts={ensureAllFonts}
        />
      </div>

      <RangeField
        id="size"
        label={t('text.size')}
        valueText={`${layer.size} px`}
        min={24}
        max={92}
        value={layer.size}
        onChange={(v) => setLayer({ size: v })}
      />
      <RangeField
        id="track"
        label={t('text.tracking')}
        valueText={`${layer.track} px`}
        min={0}
        max={24}
        value={layer.track}
        onChange={(v) => setLayer({ track: v })}
      />
      <RangeField
        id="angle"
        label={t('text.angle')}
        valueText={`${layer.angle}°`}
        min={-45}
        max={45}
        step={5}
        value={layer.angle}
        onChange={(v) => setLayer({ angle: v })}
      />
      <RangeField
        id="offsetY"
        label={t('text.offsetY')}
        valueText={`${layer.offsetY > 0 ? '+' : ''}${layer.offsetY} px`}
        min={-48}
        max={48}
        value={layer.offsetY}
        onChange={(v) => setLayer({ offsetY: v })}
        hint={t('text.offsetYHint')}
      >
        <label className="chk" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={layer.bold} onChange={(e) => setLayer({ bold: e.target.checked })} />{' '}
          {t('text.bold')}
        </label>
        <label className="chk" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={showGuide} onChange={(e) => onShowGuide(e.target.checked)} />{' '}
          {t('text.guide')}
        </label>
      </RangeField>
    </>
  )
}
