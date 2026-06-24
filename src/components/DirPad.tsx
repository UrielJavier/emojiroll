import { DIR_CELLS } from '../lib/constants'
import { useI18n } from '../i18n'

interface Props {
  value: number
  onChange: (angle: number) => void
  ariaLabel: string
}

export function DirPad({ value, onChange, ariaLabel }: Props) {
  const { t } = useI18n()
  return (
    <div className="dirpad" role="group" aria-label={ariaLabel}>
      {DIR_CELLS.map((cell, i) =>
        cell === null ? (
          <span key={i} className="dirpad-mid">
            ＋
          </span>
        ) : (
          <button
            key={i}
            type="button"
            aria-pressed={cell.angle === value}
            aria-label={t(cell.key)}
            onClick={() => onChange(cell.angle)}
          >
            {cell.arrow}
          </button>
        ),
      )}
    </div>
  )
}
