import type { ChangeEvent } from 'react'
import { FontCombo } from './FontCombo'
import { RangeField } from './RangeField'
import { Segmented } from './Segmented'
import { useI18n } from '../i18n'
import { LayerKind } from '../lib/types'
import type { FontKey, TextLayer } from '../lib/types'

interface Props {
  layer: TextLayer
  setLayer: (patch: Partial<TextLayer>) => void
  onTextChange: (value: string) => void
  onPreviewFont: (font: FontKey | null) => void
  ensureFontKey: (font: FontKey) => void
  ensureAllFonts: () => void
}

export function TextPanel({
  layer,
  setLayer,
  onTextChange,
  onPreviewFont,
  ensureFontKey,
  ensureAllFonts,
}: Props) {
  const { t } = useI18n()
  const isImage = layer.kind === LayerKind.Image

  const kindOptions = [
    { value: LayerKind.Text, label: t('text.kindMessage') },
    { value: LayerKind.Image, label: t('text.image') },
  ]

  // read an uploaded image, downscale to <=256px to keep the data URL small, store on the layer
  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 256
        const s = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * s))
        const h = Math.max(1, Math.round(img.height * s))
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const cx = c.getContext('2d')
        if (!cx) return
        cx.drawImage(img, 0, 0, w, h)
        setLayer({ image: c.toDataURL('image/png') })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div className="group">
        <label className="field-label">{t('text.kind')}</label>
        <Segmented
          options={kindOptions}
          value={layer.kind}
          onChange={(k) => setLayer({ kind: k })}
          ariaLabel={t('text.kind')}
        />
      </div>

      {isImage ? (
        <>
          <div className="group">
            <label className="field-label">{t('text.image')}</label>
            <div className="img-row">
              <label className="img-btn">
                {t('text.uploadImage')}
                <input type="file" accept="image/*" hidden onChange={onUpload} />
              </label>
              {layer.image && (
                <button type="button" className="img-btn" onClick={() => setLayer({ image: undefined })}>
                  {t('text.removeImage')}
                </button>
              )}
            </div>
            <p className="hint">{layer.image ? t('text.imageHint') : t('text.imageEmpty')}</p>
          </div>

          <RangeField
            id="size"
            label={t('text.imageSize')}
            valueText={`${layer.size} px`}
            min={24}
            max={92}
            value={layer.size}
            onChange={(v) => setLayer({ size: v })}
          />
        </>
      ) : (
        <>
          <div className="group">
            <label className="field-label" htmlFor="text">
              {t('text.layerText')}
            </label>
            <input
              type="text"
              id="text"
              value={layer.text}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => onTextChange(e.target.value)}
            />
            <p className="hint">{t('text.shortHint')}</p>
          </div>

          <div className="group">
            <label className="field-label">
              {t('text.font')} <span className="val">{t('text.fontHint')}</span>
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
            label={t('text.size')}
            valueText={`${layer.size} px`}
            min={24}
            max={92}
            value={layer.size}
            onChange={(v) => setLayer({ size: v })}
          />
          <RangeField
            id="track"
            label={t('text.tracking')}
            valueText={`${layer.track} px`}
            min={0}
            max={24}
            value={layer.track}
            onChange={(v) => setLayer({ track: v })}
          />

          <div className="group">
            <label className="chk">
              <input type="checkbox" checked={layer.bold} onChange={(e) => setLayer({ bold: e.target.checked })} />{' '}
              {t('text.bold')}
            </label>
          </div>
        </>
      )}
    </>
  )
}
