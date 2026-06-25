import { Segmented } from './Segmented'
import { ColorField } from './ColorField'
import { GradientEditor } from './GradientEditor'
import { RangeField } from './RangeField'
import { SWATCHES, SMOOTH_OPTIONS } from '../lib/constants'
import { framesFor } from '../lib/encode'
import { anyMoving } from '../lib/draw'
import { contrastFor } from '../lib/color'
import { useI18n } from '../i18n'
import { Fill } from '../lib/types'
import type { BgType, EmojiState, TextLayer } from '../lib/types'

interface Props {
  state: EmojiState
  setGlobal: (patch: Partial<EmojiState>) => void
  setLayer: (patch: Partial<TextLayer>) => void
  onSwap: () => void
  showGuide: boolean
  onShowGuide: (value: boolean) => void
}

/** Global (not per-layer) settings: background + master loop + smoothness + margin. */
export function GeneralPanel({ state, setGlobal, setLayer, onSwap, showGuide, onShowGuide }: Props) {
  const { t } = useI18n()
  const moving = anyMoving(state)
  const framesHint = moving ? `≈ ${framesFor(state.secPerLoop, state.fps)} frames` : t('motion.framesStatic')

  const bgOptions: { value: BgType; label: string }[] = [
    { value: Fill.Solid, label: t('color.type.solid') },
    { value: Fill.Gradient, label: t('color.type.gradient') },
    { value: Fill.Transparent, label: t('color.type.transparent') },
  ]

  const onSwatch = (hex: string) => {
    setGlobal({ bg: hex, bgType: Fill.Solid, transparent: false })
    setLayer({ fg: contrastFor(hex) })
  }

  return (
    <div className="panel">
      {/* BACKGROUND */}
      <div className="subsection">
        <div className="subhead-row">
          <span className="subhead">{t('color.bg')}</span>
          <button className="swap-corner" title={t('color.swapTitle')} aria-label={t('color.swapTitle')} onClick={onSwap}>
            ⇅
          </button>
        </div>
        <Segmented
          options={bgOptions}
          value={state.bgType}
          onChange={(v) => setGlobal({ bgType: v, transparent: v === Fill.Transparent })}
          ariaLabel={t('color.bgTypeAria')}
        />
        {state.bgType === Fill.Solid && (
          <div style={{ marginTop: 12 }}>
            <div className="solid-row">
              <ColorField id="bg" label={t('color.color')} value={state.bg} onChange={(v) => setGlobal({ bg: v })} />
            </div>
            <div className="swatches" aria-label={t('color.quickBg')}>
              {SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  className="swatch"
                  style={{ background: hex }}
                  title={hex}
                  aria-label={`${t('color.bg')} ${hex}`}
                  onClick={() => onSwatch(hex)}
                />
              ))}
            </div>
          </div>
        )}
        {state.bgType === Fill.Gradient && (
          <div style={{ marginTop: 12 }}>
            <GradientEditor
              stops={state.bgGradStops}
              onStopsChange={(s) => setGlobal({ bgGradStops: s })}
              angle={state.bgGradAngle}
              onAngleChange={(a) => setGlobal({ bgGradAngle: a })}
              dirLabel={t('color.bgGradDirAria')}
            />
          </div>
        )}
        {state.bgType === Fill.Transparent && <p className="hint">{t('color.bgTransparentHint')}</p>}
      </div>

      {/* LOOP + OUTPUT */}
      <div className="subsection">
        <span className="subhead">{t('motion.global')}</span>
        <RangeField
          id="secloop"
          label={t('motion.loop')}
          valueText={`${state.secPerLoop.toFixed(1)} s`}
          min={1.5}
          max={10}
          step={0.5}
          value={state.secPerLoop}
          disabled={!moving}
          onChange={(v) => setGlobal({ secPerLoop: v })}
          hint={framesHint}
        />
        <div className="group">
          <label className="field-label" htmlFor="smooth">
            {t('motion.smooth')} <span className="val">{t(`smooth.label.${state.fps}`)}</span>
          </label>
          <select id="smooth" value={state.fps} disabled={!moving} onChange={(e) => setGlobal({ fps: +e.target.value })}>
            {SMOOTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(`smooth.opt.${o.value}`)}
              </option>
            ))}
          </select>
        </div>
        <RangeField
          id="pad"
          label={t('motion.margin')}
          valueText={`${state.padding} px`}
          min={0}
          max={28}
          value={state.padding}
          onChange={(v) => setGlobal({ padding: v })}
          hint={t('motion.marginHint')}
        >
          <label className="chk" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={showGuide} onChange={(e) => onShowGuide(e.target.checked)} /> {t('text.guide')}
          </label>
        </RangeField>
      </div>
    </div>
  )
}
