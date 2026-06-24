import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { FONT_OPTIONS } from '../lib/constants'
import type { FontKey } from '../lib/types'

interface Props {
  value: FontKey
  onChange: (font: FontKey) => void
  onPreview: (font: FontKey | null) => void
  ensureFontKey: (font: FontKey) => void
  ensureAllFonts: () => void
}

export function FontCombo({ value, onChange, onPreview, ensureFontKey, ensureAllFonts }: Props) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(() => FONT_OPTIONS.findIndex((o) => o.val === value))
  const comboRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const label = FONT_OPTIONS.find((o) => o.val === value)?.label ?? value

  const setActive = (idx: number, preview: boolean) => {
    setActiveIdx(idx)
    const opt = FONT_OPTIONS[idx]
    if (preview && opt) {
      onPreview(opt.val === value ? null : opt.val)
      if (opt.val !== value) ensureFontKey(opt.val)
      itemRefs.current[idx]?.scrollIntoView({ block: 'nearest' })
    }
  }

  const commit = (v: FontKey) => {
    onChange(v)
    onPreview(null)
    ensureFontKey(v)
    setOpen(false)
    btnRef.current?.focus()
  }

  const openList = () => {
    setOpen(true)
    ensureAllFonts()
    setActiveIdx(FONT_OPTIONS.findIndex((o) => o.val === value))
  }
  const closeList = () => {
    setOpen(false)
    onPreview(null)
  }

  // focus the listbox when it opens
  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  // click outside closes the list
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setOpen(false)
        onPreview(null)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open, onPreview])

  const onListKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(Math.min(FONT_OPTIONS.length - 1, activeIdx + 1), true)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(0, activeIdx - 1), true)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (FONT_OPTIONS[activeIdx]) commit(FONT_OPTIONS[activeIdx].val)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeList()
      btnRef.current?.focus()
    }
  }

  const onBtnKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !open) {
      e.preventDefault()
      openList()
    }
  }

  return (
    <div className="combo" ref={comboRef} data-open={open}>
      <button
        type="button"
        className="combo-btn"
        ref={btnRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onBtnKeyDown}
      >
        <span>{label}</span>
        <span className="combo-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      <ul
        className="combo-list"
        ref={listRef}
        role="listbox"
        aria-label="Tipografía"
        tabIndex={-1}
        hidden={!open}
        onKeyDown={onListKeyDown}
        onMouseLeave={() => {
          if (open) {
            onPreview(null)
            setActiveIdx(-1)
          }
        }}
      >
        {FONT_OPTIONS.map((o, i) => (
          <li
            key={o.val}
            role="option"
            aria-selected={o.val === value}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            className={i === activeIdx ? 'active' : undefined}
            style={{ fontFamily: o.family, fontSize: o.fontSize }}
            onMouseEnter={() => setActive(i, true)}
            onClick={() => commit(o.val)}
          >
            {o.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
