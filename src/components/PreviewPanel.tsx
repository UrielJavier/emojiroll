import { useState } from 'react'
import type { RefObject } from 'react'
import { Segmented } from './Segmented'
import { PLAN } from '../lib/constants'
import { encodeGif } from '../lib/encode'
import { anyMoving } from '../lib/draw'
import { useI18n } from '../i18n'
import { Plan } from '../lib/types'
import type { EmojiState, GifResult } from '../lib/types'

interface Props {
  state: EmojiState
  set: (patch: Partial<EmojiState>) => void
  playing: boolean
  onTogglePlay: () => void
  showGuide: boolean
  bigRef: RefObject<HTMLCanvasElement | null>
  inlineRef: RefObject<HTMLCanvasElement | null>
  ensureFont: (s: EmojiState) => Promise<unknown>
  onEmojiNameChange: (value: string) => void
  buildShareUrl: () => string
}

export function PreviewPanel({
  state,
  set,
  playing,
  onTogglePlay,
  showGuide,
  bigRef,
  inlineRef,
  ensureFont,
  onEmojiNameChange,
  buildShareUrl,
}: Props) {
  const { t } = useI18n()
  const [dark, setDark] = useState(false)
  const [result, setResult] = useState<GifResult | null>(null)
  const [building, setBuilding] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  const shareDesign = async () => {
    const url = buildShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setShareMsg(t('presets.linkCopied'))
    } catch {
      setShareMsg(url) // clipboard blocked — show the URL so it can be copied manually
    }
  }

  const demoText = t('preview.demo')
  const idx = demoText.indexOf('{emoji}')
  const before = idx === -1 ? demoText + ' ' : demoText.slice(0, idx)
  const after = idx === -1 ? '' : demoText.slice(idx + 7)

  const emojiCode = ':' + (state.emojiName || 'emoji') + ':'
  const isPaid = state.planLimit === PLAN.paid

  const planOptions: { value: Plan; label: string }[] = [
    { value: Plan.Free, label: t('plan.free') },
    { value: Plan.Paid, label: t('plan.paid') },
  ]

  const limit = state.planLimit
  const over = result ? result.bytes > limit : false
  const sizeText = result ? `${(result.bytes / 1024).toFixed(1)} KB / ${Math.round(limit / 1024)} KB` : '—'
  const meterPct = result ? Math.min(100, (result.bytes / limit) * 100) : 0

  const onBuild = async () => {
    setErr(null)
    if (!state.layers.some((l) => l.text.trim())) {
      setErr(t('preview.errEmpty'))
      return
    }
    setBuilding(true)
    try {
      await Promise.all([ensureFont(state), document.fonts.ready])
      // brief yield so the button repaint is visible before the (sync) encode
      await new Promise((r) => setTimeout(r, 20))
      setResult(encodeGif(state))
    } catch (e) {
      setErr(t('preview.errBuild') + (e instanceof Error ? e.message : String(e)))
    } finally {
      setBuilding(false)
    }
  }

  return (
    <div className="panel">
      <div className="preview-head">
        <h2>{t('preview.title')}</h2>
        <button className="play-btn" aria-pressed={playing} onClick={onTogglePlay}>
          {playing ? t('preview.pause') : t('preview.play')}
        </button>
      </div>

      <div className="stage">
        <div className="sample">
          <span className="reg2 reg-tr" />
          <span className="reg2 reg-bl" />
          <div className="checker">
            <canvas id="previewBig" ref={bigRef} width={128} height={128} />
            <div
              className={`margin-guide${anyMoving(state) ? ' scroll' : ''}`}
              style={{ inset: state.padding }}
              hidden={!showGuide}
            />
          </div>
        </div>
      </div>
      <p className="scale-note">{t('preview.realSize')}</p>

      <div className={`slack-mock${dark ? ' dark' : ''}`}>
        <div className="mlabel-row">
          <span className="mlabel">{t('preview.inMessage')}</span>
          <div className="theme-seg" role="group" aria-label={t('preview.themeAria')}>
            <button type="button" aria-pressed={!dark} onClick={() => setDark(false)}>
              {t('preview.light')}
            </button>
            <button type="button" aria-pressed={dark} onClick={() => setDark(true)}>
              {t('preview.dark')}
            </button>
          </div>
        </div>
        <div className="msg">
          <div className="avatar">U</div>
          <div className="mbody">
            <div>
              <span className="mname">{t('preview.you')}</span>
              <span className="mtime">10:24</span>
            </div>
            <div className="mtext">
              {before}
              <span className="emoji-inline">
                <canvas ref={inlineRef} width={128} height={128} />
              </span>
              {after}
            </div>
          </div>
        </div>
      </div>

      <div className="group" style={{ marginTop: 18 }}>
        <label className="field-label" htmlFor="emojiName">
          {t('preview.name')} <span className="val">{emojiCode}</span>
        </label>
        <div className="name-row">
          <input
            type="text"
            id="emojiName"
            placeholder={t('preview.namePlaceholder')}
            autoComplete="off"
            spellCheck={false}
            value={state.emojiName}
            onChange={(e) => onEmojiNameChange(e.target.value)}
          />
        </div>
        <p className="hint">{t('preview.nameHint')}</p>
      </div>

      <div className="group" style={{ marginTop: 18 }}>
        <label className="field-label">
          {t('preview.plan')} <span className="val">{`${t('preview.max')} ${isPaid ? '1 MB' : '128 KB'}`}</span>
        </label>
        <Segmented
          options={planOptions}
          value={isPaid ? Plan.Paid : Plan.Free}
          onChange={(p) => set({ planLimit: PLAN[p] })}
          ariaLabel={t('preview.planAria')}
        />
      </div>

      <button className="build-btn" onClick={onBuild} disabled={building}>
        {building ? t('preview.building') : t('preview.build')}
      </button>
      {err && <div className="err">{err}</div>}

      <button type="button" className="share-btn" onClick={shareDesign}>
        {t('presets.share')}
      </button>
      <p className="hint">{shareMsg ?? t('presets.shareHint')}</p>

      {result && (
        <div className="result show">
          <div className="result-preview">
            <div className="rp-tile">
              <img src={result.url} alt={t('result.title')} />
            </div>
            <div className="rp-meta">
              {t('result.title')}
              <br />
              {t('result.loop')}
            </div>
          </div>
          <div className="verify">
            <div className="v-row">
              <span>{t('result.dims')}</span>
              <b>128 × 128</b>
            </div>
            <div className="v-row">
              <span>{t('result.frames')}</span>
              <b>
                {result.frames} {result.frames === 1 ? t('result.frameOne') : t('result.frameMany')}
              </b>
            </div>
            <div className="v-row">
              <span>{t('result.weight')}</span>
              <b>{sizeText}</b>
            </div>
            <div className="meter">
              <div className={`meter-fill${over ? ' over' : ''}`} style={{ width: meterPct + '%' }} />
            </div>
            <div className={`status${over ? ' over' : ' ok'}`}>
              {over ? `⚠ ${t('result.over')} ${Math.round(limit / 1024)} KB` : t('result.ok')}
            </div>
            {over && <p className="tip">{t('result.tip')}</p>}
          </div>
          <a className="dl-btn" href={result.url} download={`${state.emojiName || 'emoji'}.gif`}>
            {t('result.download')}
          </a>
        </div>
      )}
    </div>
  )
}
