import { RangeField } from './RangeField'
import { useI18n } from '../i18n'
import type { TextLayer } from '../lib/types'

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
}

/** Per-layer placement: diagonal angle + vertical offset. */
export function PositionPanel({ layer, setLayer }: Props) {
  const { t } = useI18n()
  return (
    <>
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
      />
    </>
  )
}
