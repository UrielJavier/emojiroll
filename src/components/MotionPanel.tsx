import { Segmented } from './Segmented'
import { RangeField } from './RangeField'
import { SMOOTH_OPTIONS } from '../lib/constants'
import { framesFor } from '../lib/encode'
import { anyMoving } from '../lib/draw'
import { useI18n } from '../i18n'
import type { EmojiState, Mode, TextLayer } from '../lib/types'

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  state: EmojiState
  setGlobal: (patch: Partial<EmojiState>) => void
}

export function MotionPanel({ layer, setLayer, state, setGlobal }: Props) {
  const { t } = useI18n()
  const isStatic = layer.mode === 'static'
  const moving = anyMoving(state)
  const framesHint = moving ? `≈ ${framesFor(state.secPerLoop, state.fps)} frames` : t('motion.framesStatic')

  const modeOptions: { value: Mode; label: string }[] = [
    { value: 'left', label: t('motion.mode.left') },
    { value: 'right', label: t('motion.mode.right') },
    { value: 'static', label: t('motion.mode.static') },
  ]

  return (
    <>
      <div className="group">
        <label className="field-label">{t('motion.title')}</label>
        <Segmented
          options={modeOptions}
          value={layer.mode}
          onChange={(m) => setLayer({ mode: m })}
          ariaLabel={t('motion.modeAria')}
        />
      </div>

      <RangeField
        id="speed"
        label={t('motion.speed')}
        valueText={`${layer.speed}×`}
        min={1}
        max={6}
        step={1}
        value={layer.speed}
        disabled={isStatic}
        onChange={(v) => setLayer({ speed: v })}
        hint={t('motion.speedHint')}
      />

      <RangeField
        id="gap"
        label={t('motion.gap')}
        valueText={`${layer.gap} px`}
        min={0}
        max={256}
        value={layer.gap}
        disabled={isStatic}
        onChange={(v) => setLayer({ gap: v })}
      />

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
        />
      </div>
    </>
  )
}
