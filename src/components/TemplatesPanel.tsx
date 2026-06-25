import { TEMPLATES } from '../lib/templates'
import { useI18n } from '../i18n'
import { Fill } from '../lib/types'
import type { StylePreset } from '../lib/types'

function swatch(p: StylePreset): string {
  if (p.bgType === Fill.Gradient && p.bgGradStops.length >= 2) {
    return (
      'linear-gradient(135deg,' +
      [...p.bgGradStops].sort((a, b) => a.pos - b.pos).map((s) => `${s.color} ${Math.round(s.pos * 100)}%`).join(',') +
      ')'
    )
  }
  if (p.bgType === Fill.Transparent) return 'repeating-conic-gradient(#d8d2c4 0% 25%, #f1ecdf 0% 50%) 50% / 10px 10px'
  return p.bg
}

export function TemplatesPanel({ onApply }: { onApply: (preset: StylePreset) => void }) {
  const { t } = useI18n()
  return (
    <div className="panel">
      <div className="subhead" style={{ marginBottom: 12 }}>
        {t('templates.title')}
      </div>
      <div className="tpl-grid">
        {TEMPLATES.map((tp) => (
          <button key={tp.name} type="button" className="tpl-chip" onClick={() => onApply(tp.preset)}>
            <span className="tpl-swatch" style={{ background: swatch(tp.preset) }} />
            {tp.name}
          </button>
        ))}
      </div>
    </div>
  )
}
