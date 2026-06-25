import { Segmented } from './Segmented'
import { ColorField } from './ColorField'
import { GradientEditor } from './GradientEditor'
import { ContrastMeter } from './ContrastMeter'
import { RangeField } from './RangeField'
import { DirPad } from './DirPad'
import { useI18n } from '../i18n'
import { Fill } from '../lib/types'
import type { ContrastResult } from '../lib/color'
import type { FillType, TextLayer } from '../lib/types'

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  contrast: ContrastResult
}

export function ColorsPanel({ layer, setLayer, contrast }: Props) {
  const { t } = useI18n()
  const fillOptions: { value: FillType; label: string }[] = [
    { value: Fill.Solid, label: t('color.type.solid') },
    { value: Fill.Gradient, label: t('color.type.gradient') },
    { value: Fill.Transparent, label: t('color.type.transparent') },
  ]

  return (
    <>
      {/* TEXT FILL (active layer) */}
      <div className="subsection">
        <span className="subhead">{t('color.layerText')}</span>
        <Segmented
          options={fillOptions}
          value={layer.fillType}
          onChange={(v) => setLayer({ fillType: v })}
          ariaLabel={t('color.fillTypeAria')}
        />
        {layer.fillType === Fill.Solid && (
          <div style={{ marginTop: 12 }}>
            <div className="solid-row">
              <ColorField id="fg" label={t('color.color')} value={layer.fg} onChange={(v) => setLayer({ fg: v })} />
            </div>
          </div>
        )}
        {layer.fillType === Fill.Gradient && (
          <div style={{ marginTop: 12 }}>
            <GradientEditor
              stops={layer.gradStops}
              onStopsChange={(s) => setLayer({ gradStops: s })}
              angle={layer.gradAngle}
              onAngleChange={(a) => setLayer({ gradAngle: a })}
              dirLabel={t('color.textGradDirAria')}
            />
          </div>
        )}
        {layer.fillType === Fill.Transparent && <p className="hint">{t('color.textTransparentHint')}</p>}
      </div>

      {/* STYLES (active layer) */}
      <div className="subsection">
        <span className="subhead">{t('color.styles')}</span>
        <div className="toggle-row">
          <label className="chk">
            <input type="checkbox" checked={layer.shadow} onChange={(e) => setLayer({ shadow: e.target.checked })} />{' '}
            {t('color.shadow')}
          </label>
          <label className="chk">
            <input type="checkbox" checked={layer.stroke} onChange={(e) => setLayer({ stroke: e.target.checked })} />{' '}
            {t('color.stroke')}
          </label>
        </div>

        {layer.shadow && (
          <div className="group" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 150 }}>
                <ColorField
                  id="shadowColor"
                  label={t('color.shadowColor')}
                  value={layer.shadowColor}
                  onChange={(v) => setLayer({ shadowColor: v })}
                  maxWidth={200}
                />
                <RangeField
                  id="shadowDist"
                  label={<span style={{ textTransform: 'none', fontWeight: 500 }}>{t('color.distance')}</span>}
                  valueText={`${layer.shadowDist} px`}
                  min={0}
                  max={14}
                  value={layer.shadowDist}
                  onChange={(v) => setLayer({ shadowDist: v })}
                />
              </div>
              <div>
                <span
                  className="field-label"
                  style={{ textTransform: 'none', fontWeight: 500, display: 'block', marginBottom: 7 }}
                >
                  {t('color.direction')}
                </span>
                <DirPad
                  value={layer.shadowAngle}
                  onChange={(a) => setLayer({ shadowAngle: a })}
                  ariaLabel={t('color.shadowDirAria')}
                />
              </div>
            </div>
          </div>
        )}

        {layer.stroke && (
          <div className="group" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <ColorField
                id="strokeColor"
                label={t('color.strokeColor')}
                value={layer.strokeColor}
                onChange={(v) => setLayer({ strokeColor: v })}
                maxWidth={170}
              />
              <div style={{ flex: 1, minWidth: 120 }}>
                <RangeField
                  id="strokeW"
                  label={<span style={{ textTransform: 'none', fontWeight: 500 }}>{t('color.thickness')}</span>}
                  valueText={`${layer.strokeWidth} px`}
                  min={1}
                  max={8}
                  value={layer.strokeWidth}
                  onChange={(v) => setLayer({ strokeWidth: v })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <ContrastMeter result={contrast} />
    </>
  )
}
