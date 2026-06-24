import { Segmented } from './Segmented'
import { ColorField } from './ColorField'
import { GradientEditor } from './GradientEditor'
import { ContrastMeter } from './ContrastMeter'
import { RangeField } from './RangeField'
import { DirPad } from './DirPad'
import { SWATCHES } from '../lib/constants'
import { contrastFor } from '../lib/color'
import type { ContrastResult } from '../lib/color'
import type { BgType, EmojiState, FillType, TextLayer } from '../lib/types'

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
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  state: EmojiState
  setGlobal: (patch: Partial<EmojiState>) => void
  onSwap: () => void
  contrast: ContrastResult
}

export function ColorsPanel({ layer, setLayer, state, setGlobal, onSwap, contrast }: Props) {
  const onSwatch = (hex: string) => {
    setGlobal({ bg: hex, bgType: 'solid', transparent: false })
    setLayer({ fg: contrastFor(hex) })
  }

  return (
    <>
      {/* FONDO (global) */}
      <div className="subsection">
        <div className="subhead-row">
          <span className="subhead">Fondo</span>
          <button
            className="swap-corner"
            title="Intercambiar fondo y color de la capa activa"
            aria-label="Intercambiar fondo y color de la capa activa"
            onClick={onSwap}
          >
            ⇅
          </button>
        </div>
        <Segmented
          options={BG_OPTIONS}
          value={state.bgType}
          onChange={(t) => setGlobal({ bgType: t, transparent: t === 'transparent' })}
          ariaLabel="Tipo de fondo"
        />
        {state.bgType === 'solid' && (
          <div style={{ marginTop: 12 }}>
            <div className="solid-row">
              <ColorField id="bg" label="Color" value={state.bg} onChange={(v) => setGlobal({ bg: v })} />
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
              onStopsChange={(s) => setGlobal({ bgGradStops: s })}
              angle={state.bgGradAngle}
              onAngleChange={(a) => setGlobal({ bgGradAngle: a })}
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

      {/* TEXTO (capa activa) */}
      <div className="subsection">
        <span className="subhead">Texto de la capa</span>
        <Segmented
          options={FILL_OPTIONS}
          value={layer.fillType}
          onChange={(t) => setLayer({ fillType: t })}
          ariaLabel="Tipo de relleno"
        />
        {layer.fillType === 'solid' && (
          <div style={{ marginTop: 12 }}>
            <div className="solid-row">
              <ColorField id="fg" label="Color" value={layer.fg} onChange={(v) => setLayer({ fg: v })} />
            </div>
          </div>
        )}
        {layer.fillType === 'gradient' && (
          <div style={{ marginTop: 12 }}>
            <GradientEditor
              stops={layer.gradStops}
              onStopsChange={(s) => setLayer({ gradStops: s })}
              angle={layer.gradAngle}
              onAngleChange={(a) => setLayer({ gradAngle: a })}
              dirLabel="Dirección del degradado"
            />
          </div>
        )}
        {layer.fillType === 'transparent' && (
          <p className="hint">
            Texto calado: se ve a través de las letras (efecto recorte). Necesita un fondo sólido o degradado para
            notarse.
          </p>
        )}
      </div>

      {/* ESTILOS (capa activa) */}
      <div className="subsection">
        <span className="subhead">Estilos</span>
        <div className="toggle-row">
          <label className="chk">
            <input type="checkbox" checked={layer.shadow} onChange={(e) => setLayer({ shadow: e.target.checked })} /> Sombra
          </label>
          <label className="chk">
            <input type="checkbox" checked={layer.stroke} onChange={(e) => setLayer({ stroke: e.target.checked })} /> Contorno
          </label>
        </div>

        {layer.shadow && (
          <div className="group" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 150 }}>
                <ColorField
                  id="shadowColor"
                  label="Color de sombra"
                  value={layer.shadowColor}
                  onChange={(v) => setLayer({ shadowColor: v })}
                  maxWidth={200}
                />
                <RangeField
                  id="shadowDist"
                  label={<span style={{ textTransform: 'none', fontWeight: 500 }}>Distancia</span>}
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
                  Dirección
                </span>
                <DirPad
                  value={layer.shadowAngle}
                  onChange={(a) => setLayer({ shadowAngle: a })}
                  ariaLabel="Dirección de la sombra"
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
                label="Color de contorno"
                value={layer.strokeColor}
                onChange={(v) => setLayer({ strokeColor: v })}
                maxWidth={170}
              />
              <div style={{ flex: 1, minWidth: 120 }}>
                <RangeField
                  id="strokeW"
                  label={<span style={{ textTransform: 'none', fontWeight: 500 }}>Grosor</span>}
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
