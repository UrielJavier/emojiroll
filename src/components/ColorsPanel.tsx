import { Segmented } from './Segmented'
import { ColorField } from './ColorField'
import { GradientEditor } from './GradientEditor'
import { ContrastMeter } from './ContrastMeter'
import { RangeField } from './RangeField'
import { DirPad } from './DirPad'
import { SWATCHES } from '../lib/constants'
import { contrastFor } from '../lib/color'
import type { ContrastResult } from '../lib/color'
import type { BgType, EmojiState, FillType } from '../lib/types'

const BG_OPTIONS: { value: BgType; label: string }[] = [
  { value: 'solid', label: 'Sólido' },
  { value: 'gradient', label: 'Degradado' },
  { value: 'transparent', label: 'Transparente' },
]
const FILL_OPTIONS: { value: FillType; label: string }[] = [
  { value: 'solid', label: 'Sólido' },
  { value: 'gradient', label: 'Degradado' },
  { value: 'transparent', label: 'Transparente' },
]

interface Props {
  state: EmojiState
  set: (patch: Partial<EmojiState>) => void
  onSwap: () => void
  contrast: ContrastResult
}

export function ColorsPanel({ state, set, onSwap, contrast }: Props) {
  const onSwatch = (hex: string) => set({ bg: hex, fg: contrastFor(hex), bgType: 'solid', transparent: false })

  return (
    <div className="panel panel-colors">
      {/* FONDO */}
      <div className="subsection">
        <div className="subhead-row">
          <span className="subhead">Fondo</span>
          <button
            className="swap-corner"
            title="Intercambiar colores de fondo y texto"
            aria-label="Intercambiar colores de fondo y texto"
            onClick={onSwap}
          >
            ⇅
          </button>
        </div>
        <Segmented
          options={BG_OPTIONS}
          value={state.bgType}
          onChange={(t) => set({ bgType: t, transparent: t === 'transparent' })}
          ariaLabel="Tipo de fondo"
        />
        {state.bgType === 'solid' && (
          <div style={{ marginTop: 12 }}>
            <div className="solid-row">
              <ColorField id="bg" label="Color" value={state.bg} onChange={(v) => set({ bg: v })} />
            </div>
            <div className="swatches" aria-label="Fondos rápidos">
              {SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  className="swatch"
                  style={{ background: hex }}
                  title={hex}
                  aria-label={`Fondo ${hex}`}
                  onClick={() => onSwatch(hex)}
                />
              ))}
            </div>
          </div>
        )}
        {state.bgType === 'gradient' && (
          <div style={{ marginTop: 12 }}>
            <GradientEditor
              stops={state.bgGradStops}
              onStopsChange={(s) => set({ bgGradStops: s })}
              angle={state.bgGradAngle}
              onAngleChange={(a) => set({ bgGradAngle: a })}
              dirLabel="Dirección del degradado de fondo"
            />
          </div>
        )}
        {state.bgType === 'transparent' && (
          <p className="hint">
            Sin fondo. La legibilidad dependerá del tema (claro u oscuro) de quien lo vea — compruébalo con el conmutador
            del mensaje y el medidor de contraste.
          </p>
        )}
      </div>

      {/* TEXTO */}
      <div className="subsection">
        <span className="subhead">Texto</span>
        <Segmented
          options={FILL_OPTIONS}
          value={state.fillType}
          onChange={(t) => set({ fillType: t })}
          ariaLabel="Tipo de relleno"
        />
        {state.fillType === 'solid' && (
          <div style={{ marginTop: 12 }}>
            <div className="solid-row">
              <ColorField id="fg" label="Color" value={state.fg} onChange={(v) => set({ fg: v })} />
            </div>
          </div>
        )}
        {state.fillType === 'gradient' && (
          <div style={{ marginTop: 12 }}>
            <GradientEditor
              stops={state.gradStops}
              onStopsChange={(s) => set({ gradStops: s })}
              angle={state.gradAngle}
              onAngleChange={(a) => set({ gradAngle: a })}
              dirLabel="Dirección del degradado"
            />
          </div>
        )}
        {state.fillType === 'transparent' && (
          <p className="hint">
            Texto calado: se ve a través de las letras (efecto recorte). Necesita un fondo sólido o degradado para
            notarse.
          </p>
        )}
        <label className="chk" style={{ marginTop: 12 }}>
          <input type="checkbox" checked={state.bold} onChange={(e) => set({ bold: e.target.checked })} /> Negrita
        </label>
      </div>

      {/* ESTILOS */}
      <div className="subsection">
        <span className="subhead">Estilos</span>
        <div className="toggle-row">
          <label className="chk">
            <input type="checkbox" checked={state.shadow} onChange={(e) => set({ shadow: e.target.checked })} /> Sombra
          </label>
          <label className="chk">
            <input type="checkbox" checked={state.stroke} onChange={(e) => set({ stroke: e.target.checked })} /> Contorno
          </label>
        </div>

        {state.shadow && (
          <div className="group" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 150 }}>
                <ColorField
                  id="shadowColor"
                  label="Color de sombra"
                  value={state.shadowColor}
                  onChange={(v) => set({ shadowColor: v })}
                  maxWidth={200}
                />
                <RangeField
                  id="shadowDist"
                  label={<span style={{ textTransform: 'none', fontWeight: 500 }}>Distancia</span>}
                  valueText={`${state.shadowDist} px`}
                  min={0}
                  max={14}
                  value={state.shadowDist}
                  onChange={(v) => set({ shadowDist: v })}
                />
              </div>
              <div>
                <span
                  className="field-label"
                  style={{ textTransform: 'none', fontWeight: 500, display: 'block', marginBottom: 7 }}
                >
                  Dirección
                </span>
                <DirPad
                  value={state.shadowAngle}
                  onChange={(a) => set({ shadowAngle: a })}
                  ariaLabel="Dirección de la sombra"
                />
              </div>
            </div>
          </div>
        )}

        {state.stroke && (
          <div className="group" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <ColorField
                id="strokeColor"
                label="Color de contorno"
                value={state.strokeColor}
                onChange={(v) => set({ strokeColor: v })}
                maxWidth={170}
              />
              <div style={{ flex: 1, minWidth: 120 }}>
                <RangeField
                  id="strokeW"
                  label={<span style={{ textTransform: 'none', fontWeight: 500 }}>Grosor</span>}
                  valueText={`${state.strokeWidth} px`}
                  min={1}
                  max={8}
                  value={state.strokeWidth}
                  onChange={(v) => set({ strokeWidth: v })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <ContrastMeter result={contrast} />
    </div>
  )
}
