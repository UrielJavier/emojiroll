import { useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useI18n } from '../i18n'
import { Fill } from '../lib/types'
import type { StylePreset } from '../lib/types'

type PresetMap = Record<string, StylePreset>

function presetSwatchCss(p: StylePreset): string {
  if (p.bgType === Fill.Gradient && p.bgGradStops && p.bgGradStops.length >= 2) {
    return (
      'linear-gradient(135deg,' +
      [...p.bgGradStops]
        .sort((a, b) => a.pos - b.pos)
        .map((s) => `${s.color} ${Math.round(s.pos * 100)}%`)
        .join(',') +
      ')'
    )
  }
  if (p.bgType === Fill.Transparent) return 'repeating-conic-gradient(#d8d2c4 0% 25%, #f1ecdf 0% 50%) 50% / 12px 12px'
  return p.bg
}

interface Props {
  presets: PresetMap
  canPersist: boolean
  onSave: (name: string) => void
  onApply: (preset: StylePreset) => void
  onDelete: (name: string) => void
  onImport: (presets: PresetMap) => void
}

export function PresetsPanel({ presets, canPersist, onSave, onApply, onDelete, onImport }: Props) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [ioMsg, setIoMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const names = Object.keys(presets)

  const save = () => {
    const n = name.trim()
    if (!n) return
    onSave(n)
    setName('')
  }

  const exportPresets = () => {
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'slack-emoji-presets.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!data || typeof data !== 'object') throw new Error('formato')
      const clean: PresetMap = {}
      for (const [k, v] of Object.entries(data)) {
        if (v && typeof v === 'object') clean[k] = v as StylePreset
      }
      const count = Object.keys(clean).length
      if (!count) throw new Error('vacío')
      onImport(clean)
      setIoMsg(`${t('presets.imported')} ${count} ${count === 1 ? t('presets.styleOne') : t('presets.styleMany')}.`)
    } catch {
      setIoMsg(t('presets.importError'))
    }
  }

  return (
    <div className="panel">
      <div className="subhead" style={{ marginBottom: 12 }}>
        {t('presets.title')}
      </div>
      <div className="preset-save">
        <input
          type="text"
          id="presetName"
          placeholder={t('presets.namePlaceholder')}
          autoComplete="off"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              save()
            }
          }}
        />
        <button type="button" className="preset-save-btn" onClick={save}>
          {t('presets.save')}
        </button>
      </div>
      <p className="hint" style={{ marginTop: 8 }}>
        {canPersist ? t('presets.persistYes') : t('presets.persistNo')}
      </p>

      <div className="preset-list">
        {names.length === 0 ? (
          <p className="preset-empty">{t('presets.empty')}</p>
        ) : (
          names.map((n) => {
            const p = presets[n]
            return (
              <div className="preset-item" key={n}>
                <div className="preset-swatch" style={{ background: presetSwatchCss(p) }} />
                <button className="preset-name" title={`${t('presets.apply')} “${n}”`} onClick={() => onApply(p)}>
                  {n}
                </button>
                <button className="preset-apply" onClick={() => onApply(p)}>
                  {t('presets.apply')}
                </button>
                <button className="preset-del" title={t('presets.delete')} onClick={() => onDelete(n)}>
                  ×
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className="preset-io">
        <button type="button" className="preset-io-btn" onClick={exportPresets} disabled={names.length === 0}>
          {t('presets.export')}
        </button>
        <button type="button" className="preset-io-btn" onClick={() => fileRef.current?.click()}>
          {t('presets.import')}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
      </div>
      {ioMsg && (
        <p className="hint" style={{ marginTop: 8 }}>
          {ioMsg}
        </p>
      )}
    </div>
  )
}
