import { Segmented } from './Segmented'
import { RangeField } from './RangeField'
import { useI18n } from '../i18n'
import { Effect, Mode } from '../lib/types'
import type { TextLayer } from '../lib/types'

const EFFECTS = Object.values(Effect)

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
}

export function MotionPanel({ layer, setLayer }: Props) {
  const { t } = useI18n()
  const isStatic = layer.mode === Mode.Static

  const modeOptions: { value: Mode; label: string }[] = [
    { value: Mode.Left, label: t('motion.mode.left') },
    { value: Mode.Right, label: t('motion.mode.right') },
    { value: Mode.Static, label: t('motion.mode.static') },
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

      <div className="group">
        <label className="field-label" htmlFor="effect">
          {t('effect.label')}
        </label>
        <select id="effect" value={layer.effect} onChange={(e) => setLayer({ effect: e.target.value as Effect })}>
          {EFFECTS.map((fx) => (
            <option key={fx} value={fx}>
              {t(`effect.${fx}`)}
            </option>
          ))}
        </select>
      </div>

      {layer.effect !== Effect.None && (
        <RangeField
          id="effectSpeed"
          label={t('effect.speed')}
          valueText={`${layer.effectSpeed}×`}
          min={1}
          max={6}
          step={1}
          value={layer.effectSpeed}
          onChange={(v) => setLayer({ effectSpeed: v })}
        />
      )}
    </>
  )
}
