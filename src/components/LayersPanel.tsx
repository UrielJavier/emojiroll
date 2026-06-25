import { useState } from 'react'
import type { DragEvent } from 'react'
import { useI18n } from '../i18n'
import { Fill } from '../lib/types'
import type { TextLayer } from '../lib/types'

function layerSwatch(l: TextLayer): string {
  if (l.fillType === Fill.Gradient && l.gradStops.length >= 2) {
    return (
      'linear-gradient(135deg,' +
      [...l.gradStops].sort((a, b) => a.pos - b.pos).map((s) => `${s.color} ${Math.round(s.pos * 100)}%`).join(',') +
      ')'
    )
  }
  if (l.fillType === Fill.Transparent) return 'repeating-conic-gradient(#d8d2c4 0% 25%, #f1ecdf 0% 50%) 50% / 10px 10px'
  return l.fg
}

interface Props {
  layers: TextLayer[]
  activeId: string
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
  /** move `id` to just before `beforeId` (null = end of list) */
  onReorder: (id: string, beforeId: string | null) => void
}

export function LayersPanel({ layers, activeId, onSelect, onRemove, onMove, onReorder }: Props) {
  const { t } = useI18n()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const clear = () => {
    setDragId(null)
    setOverId(null)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault()
    if (!dragId || dragId === targetId) {
      clear()
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const after = e.clientY - rect.top > rect.height / 2
    const order = layers.map((l) => l.id)
    const ti = order.indexOf(targetId)
    const beforeId = after ? (order[ti + 1] ?? null) : targetId
    onReorder(dragId, beforeId)
    clear()
  }

  return (
    <>
      <div className="layer-list">
        {layers.map((l, i) => (
          <div
            key={l.id}
            className={`layer-item${l.id === activeId ? ' active' : ''}${l.id === dragId ? ' dragging' : ''}${
              l.id === overId && dragId && l.id !== dragId ? ' over' : ''
            }`}
            draggable
            onDragStart={(e) => {
              setDragId(l.id)
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', l.id)
            }}
            onDragOver={(e) => {
              if (!dragId) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (overId !== l.id) setOverId(l.id)
            }}
            onDrop={(e) => onDrop(e, l.id)}
            onDragEnd={clear}
            onClick={() => onSelect(l.id)}
          >
            <span className="layer-grip" aria-hidden="true" title={t('layers.drag')}>
              ⠿
            </span>
            <span className="layer-swatch" style={{ background: layerSwatch(l) }} />
            <span className="layer-name">{l.text || t('layers.empty')}</span>
            <button
              type="button"
              className="layer-btn"
              title={t('layers.move.up')}
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
              title={t('layers.move.down')}
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
              title={t('layers.delete')}
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
        {t('layers.hint')}
      </p>
    </>
  )
}
