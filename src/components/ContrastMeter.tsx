import { useI18n } from '../i18n'
import type { ContrastResult } from '../lib/color'

export function ContrastMeter({ result }: { result: ContrastResult }) {
  const { t } = useI18n()
  return (
    <div className="contrast" data-level={result.level}>
      <div className="contrast-head">
        <span className="contrast-title">{t('contrast.title')}</span>
        <span className="contrast-ratio">{result.ratioText}</span>
      </div>
      <div className="contrast-bar">
        <div className="contrast-fill" style={{ width: result.fillPct + '%' }} />
        <span className="contrast-tick" style={{ left: '33.3%' }} title="3:1" />
        <span className="contrast-tick" style={{ left: '58.3%' }} title="4.5:1" />
      </div>
      <p className="contrast-msg">{result.msg}</p>
    </div>
  )
}
