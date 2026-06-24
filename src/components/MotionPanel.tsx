import { Segmented } from './Segmented'
import { RangeField } from './RangeField'
import { SMOOTH_LABELS, SMOOTH_OPTIONS } from '../lib/constants'
import { framesFor } from '../lib/encode'
import { anyMoving } from '../lib/draw'
import type { EmojiState, Mode, TextLayer } from '../lib/types'

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'left', label: '← Izquierda' },
  { value: 'right', label: 'Derecha →' },
  { value: 'static', label: 'Fijo' },
]

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  state: EmojiState
  setGlobal: (patch: Partial<EmojiState>) => void
}

export function MotionPanel({ layer, setLayer, state, setGlobal }: Props) {
  const isStatic = layer.mode === 'static'
  const moving = anyMoving(state)
  const framesHint = moving ? `≈ ${framesFor(state.secPerLoop, state.fps)} frames` : '1 frame (todo fijo)'

  return (
    <div className="panel">
      <div className="group">
        <label className="field-label">Movimiento de la capa</label>
        <Segmented options={MODE_OPTIONS} value={layer.mode} onChange={(m) => setLayer({ mode: m })} ariaLabel="Movimiento" />
      </div>

      <RangeField
        id="speed"
        label="Velocidad relativa"
        valueText={`${layer.speed}×`}
        min={1}
        max={6}
        step={1}
        value={layer.speed}
        disabled={isStatic}
        onChange={(v) => setLayer({ speed: v })}
        hint="Capas con velocidades distintas crean el efecto parallax."
      />

      <RangeField
        id="gap"
        label="Separación entre repeticiones"
        valueText={`${layer.gap} px`}
        min={0}
        max={256}
        value={layer.gap}
        disabled={isStatic}
        onChange={(v) => setLayer({ gap: v })}
      />

      <div className="subsection">
        <span className="subhead">Bucle y salida (global)</span>
        <RangeField
          id="secloop"
          label="Duración del bucle"
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
            Suavidad <span className="val">{SMOOTH_LABELS[state.fps] ?? 'Estándar'}</span>
          </label>
          <select id="smooth" value={state.fps} disabled={!moving} onChange={(e) => setGlobal({ fps: +e.target.value })}>
            {SMOOTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <RangeField
          id="pad"
          label="Margen"
          valueText={`${state.padding} px`}
          min={0}
          max={28}
          value={state.padding}
          onChange={(v) => setGlobal({ padding: v })}
          hint="Aire alrededor del texto. Si hace falta, la letra se reduce sola para no tocar el borde."
        />
      </div>
    </div>
  )
}
