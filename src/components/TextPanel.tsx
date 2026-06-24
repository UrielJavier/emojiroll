import { FontCombo } from './FontCombo'
import { RangeField } from './RangeField'
import type { FontKey, TextLayer } from '../lib/types'

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  onTextChange: (value: string) => void
  onPreviewFont: (font: FontKey | null) => void
  showGuide: boolean
  onShowGuide: (value: boolean) => void
  ensureFontKey: (font: FontKey) => void
  ensureAllFonts: () => void
}

export function TextPanel({
  layer,
  setLayer,
  onTextChange,
  onPreviewFont,
  showGuide,
  onShowGuide,
  ensureFontKey,
  ensureAllFonts,
}: Props) {
  return (
    <>
      <div className="group">
        <label className="field-label" htmlFor="text">
          Texto de la capa
        </label>
        <input
          type="text"
          id="text"
          value={layer.text}
          maxLength={40}
          autoComplete="off"
          onChange={(e) => onTextChange(e.target.value)}
        />
        <p className="hint">Palabras cortas se leen mejor a tamaño emoji.</p>
      </div>

      <div className="group">
        <label className="field-label">
          Tipografía <span className="val">pasa el ratón para previsualizar</span>
        </label>
        <FontCombo
          value={layer.font}
          onChange={(f) => setLayer({ font: f })}
          onPreview={onPreviewFont}
          ensureFontKey={ensureFontKey}
          ensureAllFonts={ensureAllFonts}
        />
      </div>

      <RangeField
        id="size"
        label="Tamaño de letra"
        valueText={`${layer.size} px`}
        min={24}
        max={92}
        value={layer.size}
        onChange={(v) => setLayer({ size: v })}
      />
      <RangeField
        id="track"
        label="Espaciado entre letras"
        valueText={`${layer.track} px`}
        min={0}
        max={24}
        value={layer.track}
        onChange={(v) => setLayer({ track: v })}
      />
      <RangeField
        id="angle"
        label="Ángulo (diagonal)"
        valueText={`${layer.angle}°`}
        min={-45}
        max={45}
        step={5}
        value={layer.angle}
        onChange={(v) => setLayer({ angle: v })}
      />
      <RangeField
        id="offsetY"
        label="Posición vertical"
        valueText={`${layer.offsetY > 0 ? '+' : ''}${layer.offsetY} px`}
        min={-48}
        max={48}
        value={layer.offsetY}
        onChange={(v) => setLayer({ offsetY: v })}
        hint="Sube o baja esta capa para apilar varias palabras."
      >
        <label className="chk" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={layer.bold} onChange={(e) => setLayer({ bold: e.target.checked })} /> Negrita
        </label>
        <label className="chk" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={showGuide} onChange={(e) => onShowGuide(e.target.checked)} /> Ver guía en la
          vista previa
        </label>
      </RangeField>
    </>
  )
}
