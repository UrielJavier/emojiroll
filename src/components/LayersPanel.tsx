import type { TextLayer } from '../lib/types'

function layerSwatch(l: TextLayer): string {
  if (l.fillType === 'gradient' && l.gradStops.length >= 2) {
    return (
      'linear-gradient(135deg,' +
      [...l.gradStops].sort((a, b) => a.pos - b.pos).map((s) => `${s.color} ${Math.round(s.pos * 100)}%`).join(',') +
      ')'
    )
  }
  if (l.fillType === 'transparent') return 'repeating-conic-gradient(#d8d2c4 0% 25%, #f1ecdf 0% 50%) 50% / 10px 10px'
  return l.fg
}

interface Props {
  layers: TextLayer[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
}

export function LayersPanel({ layers, activeId, onSelect, onAdd, onRemove, onMove }: Props) {
  return (
    <div className="panel">
      <div className="subhead-row">
        <span className="subhead">Capas</span>
        <button type="button" className="layer-add" onClick={onAdd} title="Añadir capa">
          + Capa
        </button>
      </div>
      <div className="layer-list">
        {layers.map((l, i) => (
          <div
            key={l.id}
            className={`layer-item${l.id === activeId ? ' active' : ''}`}
            onClick={() => onSelect(l.id)}
          >
            <span className="layer-swatch" style={{ background: layerSwatch(l) }} />
            <span className="layer-name">{l.text || '(vacío)'}</span>
            <button
              type="button"
              className="layer-btn"
              title="Subir"
              disabled={i === 0}
              onClick={(e) => {
                e.stopPropagation()
                onMove(l.id, -1)
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="layer-btn"
              title="Bajar"
              disabled={i === layers.length - 1}
              onClick={(e) => {
                e.stopPropagation()
                onMove(l.id, 1)
              }}
            >
              ↓
            </button>
            <button
              type="button"
              className="layer-btn del"
              title="Borrar capa"
              disabled={layers.length <= 1}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(l.id)
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 10 }}>
        El orden es la profundidad: las de arriba se dibujan detrás. Cada capa tiene su velocidad y ángulo → parallax.
      </p>
    </div>
  )
}
