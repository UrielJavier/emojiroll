import { GRAD_PRESETS, GRAD_PRESET_OPTIONS } from '../lib/constants'
import { useI18n } from '../i18n'
import type { GradStop } from '../lib/types'
import { DirPad } from './DirPad'

function barCss(stops: GradStop[]): string {
  return (
    'linear-gradient(90deg,' +
    [...stops]
      .sort((a, b) => a.pos - b.pos)
      .map((s) => `${s.color} ${Math.round(s.pos * 100)}%`)
      .join(',') +
    ')'
  )
}

interface Props {
  stops: GradStop[]
  onStopsChange: (stops: GradStop[]) => void
  angle: number
  onAngleChange: (angle: number) => void
  dirLabel: string
}

export function GradientEditor({ stops, onStopsChange, angle, onAngleChange, dirLabel }: Props) {
  const { t } = useI18n()
  const setStop = (i: number, patch: Partial<GradStop>) =>
    onStopsChange(stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const removeStop = (i: number) => onStopsChange(stops.filter((_, idx) => idx !== i))
  const addStop = () => {
    if (stops.length >= 6) return
    onStopsChange([...stops, { color: '#ffffff', pos: 1 }])
  }
  const applyPreset = (key: string) => {
    const p = GRAD_PRESETS[key]
    if (p) onStopsChange(p.map((s) => ({ ...s })))
  }

  return (
    <>
      <div className="grad-row">
        <div className="grad-stops-col">
          <div className="grad-bar" style={{ background: barCss(stops) }} />
          <div>
            {stops.map((st, i) => (
              <div className="stop-row" key={i}>
                <input type="color" value={st.color} onChange={(e) => setStop(i, { color: e.target.value })} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(st.pos * 100)}
                  onChange={(e) => setStop(i, { pos: +e.target.value / 100 })}
                />
                <span className="stop-pos">{Math.round(st.pos * 100)}%</span>
                <button
                  type="button"
                  className="stop-del"
                  title={t('grad.removeStop')}
                  disabled={stops.length <= 2}
                  onClick={() => removeStop(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="add-stop" disabled={stops.length >= 6} onClick={addStop}>
            {t('grad.addStop')}
          </button>
        </div>
        <div className="grad-dir-col">
          <span
            className="field-label"
            style={{ textTransform: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', height: 18, marginBottom: 12 }}
          >
            {t('color.direction')}
          </span>
          <DirPad value={angle} onChange={onAngleChange} ariaLabel={dirLabel} />
        </div>
      </div>
      <div className="grad-presets">
        {GRAD_PRESET_OPTIONS.map((p) => (
          <button key={p.key} type="button" onClick={() => applyPreset(p.key)}>
            {t(`grad.${p.key}`)}
          </button>
        ))}
      </div>
    </>
  )
}
