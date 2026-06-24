import type { ContrastResult } from '../lib/color'

export function ContrastMeter({ result }: { result: ContrastResult }) {
  return (
    <div className="contrast" data-level={result.level}>
      <div className="contrast-head">
        <span className="contrast-title">Contraste texto / fondo</span>
        <span className="contrast-ratio">{result.ratioText}</span>
      </div>
      <div className="contrast-bar">
        <div className="contrast-fill" style={{ width: result.fillPct + '%' }} />
        <span className="contrast-tick" style={{ left: '33.3%' }} title="3:1 (mínimo texto grande)" />
        <span className="contrast-tick" style={{ left: '58.3%' }} title="4.5:1 (recomendado)" />
      </div>
      <p className="contrast-msg">{result.msg}</p>
    </div>
  )
}
