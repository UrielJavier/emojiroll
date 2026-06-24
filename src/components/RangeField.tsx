import type { ReactNode } from 'react'

interface Props {
  id: string
  label: ReactNode
  valueText: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  hint?: ReactNode
  children?: ReactNode
}

export function RangeField({ id, label, valueText, min, max, step, value, onChange, disabled, hint, children }: Props) {
  return (
    <div className="group">
      <label className="field-label" htmlFor={id}>
        {label} <span className="val">{valueText}</span>
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(+e.target.value)}
      />
      {hint && <p className="hint">{hint}</p>}
      {children}
    </div>
  )
}
