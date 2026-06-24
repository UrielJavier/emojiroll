interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxWidth?: number | string
}

export function ColorField({ id, label, value, onChange, maxWidth }: Props) {
  return (
    <div className="color-cell" style={maxWidth ? { maxWidth } : undefined}>
      <label htmlFor={id}>{label}</label>
      <div className="ci">
        <input type="color" id={id} value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="hexout">{value.toUpperCase()}</span>
      </div>
    </div>
  )
}
