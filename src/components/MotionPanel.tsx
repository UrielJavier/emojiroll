import { Segmented } from './Segmented'
import { RangeField } from './RangeField'
import { SMOOTH_LABELS, SMOOTH_OPTIONS } from '../lib/constants'
import { framesFor } from '../lib/encode'
import type { EmojiState, Mode } from '../lib/types'

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'left', label: '← Izquierda' },
  { value: 'right', label: 'Derecha →' },
  { value: 'static', label: 'Fijo' },
]

interface Props {
  state: EmojiState
  set: (patch: Partial<EmojiState>) => void
}

export function MotionPanel({ state, set }: Props) {
  const isStatic = state.mode === 'static'
  const framesHint = isStatic ? '1 frame (fijo)' : `≈ ${framesFor(state.secPerLoop, state.fps)} frames`

  return (
    <div className="panel">
      <div className="group">
        <label className="field-label">Movimiento</label>
        <Segmented options={MODE_OPTIONS} value={state.mode} onChange={(m) => set({ mode: m })} ariaLabel="Movimiento" />
      </div>

      <RangeField
        id="secloop"
        label="Velocidad"
        valueText={`${state.secPerLoop.toFixed(1)} s / vuelta`}
        min={1.5}
        max={10}
        step={0.5}
        value={state.secPerLoop}
        disabled={isStatic}
        onChange={(v) => set({ secPerLoop: v })}
        hint={framesHint}
      />

      <RangeField
        id="gap"
        label="Separación entre repeticiones"
        valueText={`${state.gap} px`}
        min={0}
        max={256}
        value={state.gap}
        disabled={isStatic}
        onChange={(v) => set({ gap: v })}
        hint="Hueco entre una repetición y la siguiente: 0 = pegado (“luzluz”), alto = con espacio (“luz·····luz”)."
      />

      <div className="group">
        <label className="field-label" htmlFor="smooth">
          Suavidad <span className="val">{SMOOTH_LABELS[state.fps] ?? 'Estándar'}</span>
        </label>
        <select id="smooth" value={state.fps} onChange={(e) => set({ fps: +e.target.value })}>
          {SMOOTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
