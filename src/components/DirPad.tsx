import { DIR_CELLS } from '../lib/constants'

interface Props {
  value: number
  onChange: (angle: number) => void
  ariaLabel: string
}

export function DirPad({ value, onChange, ariaLabel }: Props) {
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
            aria-label={cell.label}
            onClick={() => onChange(cell.angle)}
          >
            {cell.arrow}
          </button>
        ),
      )}
    </div>
  )
}
