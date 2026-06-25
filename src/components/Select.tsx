import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

interface Option<T extends string | number> {
  value: T
  label: string
}

interface Props<T extends string | number> {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  disabled?: boolean
  /** auto-width, right-aligned dropdown (for tight spots like the header) */
  compact?: boolean
}

/** Custom dropdown matching the font combobox styling (keyboard + click-outside). */
export function Select<T extends string | number>({ value, options, onChange, ariaLabel, disabled, compact }: Props<T>) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(() => options.findIndex((o) => o.value === value))
  const comboRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const current = options.find((o) => o.value === value)?.label ?? ''

  const openList = () => {
    setActiveIdx(options.findIndex((o) => o.value === value))
    setOpen(true)
  }
  const pick = (v: T) => {
    onChange(v)
    setOpen(false)
    btnRef.current?.focus()
  }

  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])
  useEffect(() => {
    if (open) itemRefs.current[activeIdx]?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open])
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (options[activeIdx]) pick(options[activeIdx].value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      btnRef.current?.focus()
    }
  }
  const onBtnKey = (e: KeyboardEvent) => {
    if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !open) {
      e.preventDefault()
      openList()
    }
  }

  return (
    <div className={`combo select${compact ? ' compact' : ''}`} ref={comboRef} data-open={open}>
      <button
        type="button"
        className="combo-btn"
        ref={btnRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onBtnKey}
      >
        <span>{current}</span>
        <span className="combo-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      <ul
        className="combo-list"
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={-1}
        hidden={!open}
        onKeyDown={onListKey}
      >
        {options.map((o, i) => (
          <li
            key={String(o.value)}
            role="option"
            aria-selected={o.value === value}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            className={i === activeIdx ? 'active' : undefined}
            onMouseEnter={() => setActiveIdx(i)}
            onClick={() => pick(o.value)}
          >
            {o.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
