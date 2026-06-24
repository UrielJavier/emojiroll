import { useState } from 'react'
import type { RefObject } from 'react'
import { Segmented } from './Segmented'
import { PLAN } from '../lib/constants'
import { encodeGif } from '../lib/encode'
import { anyMoving } from '../lib/draw'
import type { EmojiState, GifResult, Plan } from '../lib/types'

const PLAN_OPTIONS: { value: Plan; label: string }[] = [
  { value: 'free', label: 'Gratis · máx 128 KB' },
  { value: 'paid', label: 'De pago · máx 1 MB' },
]

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
}: Props) {
  const demoText = '¡buen trabajo equipo {emoji} a por la siguiente!'
  const [dark, setDark] = useState(false)
  const [result, setResult] = useState<GifResult | null>(null)
  const [building, setBuilding] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const idx = demoText.indexOf('{emoji}')
  const before = idx === -1 ? demoText + ' ' : demoText.slice(0, idx)
  const after = idx === -1 ? '' : demoText.slice(idx + 7)

  const emojiCode = ':' + (state.emojiName || 'emoji') + ':'
  const isPaid = state.planLimit === PLAN.paid

  const limit = state.planLimit
  const over = result ? result.bytes > limit : false
  const sizeText = result ? `${(result.bytes / 1024).toFixed(1)} KB / ${Math.round(limit / 1024)} KB` : '—'
  const meterPct = result ? Math.min(100, (result.bytes / limit) * 100) : 0

  const onBuild = async () => {
    setErr(null)
    if (!state.layers.some((l) => l.text.trim())) {
      setErr('Escribe algún texto primero.')
      return
    }
    setBuilding(true)
    try {
      await Promise.all([ensureFont(state), document.fonts.ready])
      // brief yield so the button repaint is visible before the (sync) encode
      await new Promise((r) => setTimeout(r, 20))
      setResult(encodeGif(state))
    } catch (e) {
      setErr('Error al generar el GIF: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setBuilding(false)
    }
  }

  return (
    <div className="panel">
      <div className="preview-head">
        <h2>Vista previa</h2>
        <button className="play-btn" aria-pressed={playing} onClick={onTogglePlay}>
          {playing ? '❚❚ Pausa' : '▶ Reproducir'}
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
      <p className="scale-note">tamaño real · 128×128</p>

      <div className={`slack-mock${dark ? ' dark' : ''}`}>
        <div className="mlabel-row">
          <span className="mlabel">Así se ve en un mensaje</span>
          <div className="theme-seg" role="group" aria-label="Tema de Slack">
            <button type="button" aria-pressed={!dark} onClick={() => setDark(false)}>
              Claro
            </button>
            <button type="button" aria-pressed={dark} onClick={() => setDark(true)}>
              Oscuro
            </button>
          </div>
        </div>
        <div className="msg">
          <div className="avatar">U</div>
          <div className="mbody">
            <div>
              <span className="mname">tú</span>
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
          Nombre del emoji <span className="val">{emojiCode}</span>
        </label>
        <div className="name-row">
          <input
            type="text"
            id="emojiName"
            placeholder="mi-emoji"
            autoComplete="off"
            spellCheck={false}
            value={state.emojiName}
            onChange={(e) => onEmojiNameChange(e.target.value)}
          />
        </div>
        <p className="hint">
          Se usa como nombre del archivo. Al subirlo, Slack lo propone como nombre del emoji por defecto.
        </p>
      </div>

      <div className="group" style={{ marginTop: 18 }}>
        <label className="field-label">
          Plan de Slack <span className="val">{`máx. ${isPaid ? '1 MB' : '128 KB'}`}</span>
        </label>
        <Segmented
          options={PLAN_OPTIONS}
          value={isPaid ? 'paid' : 'free'}
          onChange={(p) => set({ planLimit: PLAN[p] })}
          ariaLabel="Plan de Slack"
        />
      </div>

      <button className="build-btn" onClick={onBuild} disabled={building}>
        {building ? 'Creando…' : 'Crear GIF'}
      </button>
      {err && <div className="err">{err}</div>}

      {result && (
        <div className="result show">
          <div className="result-preview">
            <div className="rp-tile">
              <img src={result.url} alt="GIF generado" />
            </div>
            <div className="rp-meta">
              GIF generado
              <br />
              tamaño real, en bucle
            </div>
          </div>
          <div className="verify">
            <div className="v-row">
              <span>Dimensiones</span>
              <b>128 × 128</b>
            </div>
            <div className="v-row">
              <span>Frames</span>
              <b>
                {result.frames} {result.frames === 1 ? 'frame' : 'frames'}
              </b>
            </div>
            <div className="v-row">
              <span>Peso</span>
              <b>{sizeText}</b>
            </div>
            <div className="meter">
              <div className={`meter-fill${over ? ' over' : ''}`} style={{ width: meterPct + '%' }} />
            </div>
            <div className={`status${over ? ' over' : ' ok'}`}>
              {over ? `⚠ Pasa de ${Math.round(limit / 1024)} KB` : '✓ Listo para Slack'}
            </div>
            {over && (
              <p className="tip">
                No cabe en este plan. Prueba: bajar la suavidad a “Compacto”, acortar el texto, una vuelta más rápida
                (menos frames) o quitar el fondo transparente.
              </p>
            )}
          </div>
          <a className="dl-btn" href={result.url} download={`${state.emojiName || 'emoji'}.gif`}>
            Descargar GIF
          </a>
        </div>
      )}
    </div>
  )
}
