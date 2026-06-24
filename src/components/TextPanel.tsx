import { FontCombo } from './FontCombo'
import { RangeField } from './RangeField'
import type { EmojiState, FontKey } from '../lib/types'

interface Props {
  state: EmojiState
  set: (patch: Partial<EmojiState>) => void
  onTextChange: (value: string) => void
  showGuide: boolean
  onShowGuide: (value: boolean) => void
  ensureFontKey: (font: FontKey) => void
  ensureAllFonts: () => void
}

export function TextPanel({ state, set, onTextChange, showGuide, onShowGuide, ensureFontKey, ensureAllFonts }: Props) {
  return (
    <div className="panel">
      <div className="group">
        <label className="field-label" htmlFor="text">
          Texto
        </label>
        <input
          type="text"
          id="text"
          value={state.text}
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
          value={state.font}
          onChange={(f) => set({ font: f })}
          onPreview={(f) => set({ previewFont: f })}
          ensureFontKey={ensureFontKey}
          ensureAllFonts={ensureAllFonts}
        />
      </div>

      <RangeField
        id="size"
        label="Tamaño de letra"
        valueText={`${state.size} px`}
        min={24}
        max={92}
        value={state.size}
        onChange={(v) => set({ size: v })}
      />
      <RangeField
        id="track"
        label="Espaciado entre letras"
        valueText={`${state.track} px`}
        min={0}
        max={24}
        value={state.track}
        onChange={(v) => set({ track: v })}
      />
      <RangeField
        id="pad"
        label="Margen"
        valueText={`${state.padding} px`}
        min={0}
        max={28}
        value={state.padding}
        onChange={(v) => set({ padding: v })}
        hint="Aire alrededor del texto. Si hace falta, la letra se reduce sola para no tocar el borde."
      >
        <label className="chk" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={showGuide} onChange={(e) => onShowGuide(e.target.checked)} /> Ver guía en la vista
          previa
        </label>
      </RangeField>
    </div>
  )
}
