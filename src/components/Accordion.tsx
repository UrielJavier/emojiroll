import { useState } from 'react'
import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  defaultOpen?: boolean
  /** optional control shown on the right of the header (e.g. an "add" button) */
  action?: ReactNode
  /** lighter styling (no panel box, thin divider) — for nesting inside another panel */
  minimal?: boolean
  children: ReactNode
}

/** A collapsible panel. The header toggles; an optional action sits beside the title. */
export function Accordion({ title, defaultOpen = true, action, minimal = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`accordion${minimal ? ' minimal' : ' panel'}${open ? ' open' : ''}`}>
      <div className="acc-head">
        <button type="button" className="acc-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="acc-caret" aria-hidden="true">
            ▾
          </span>
          <span className="acc-title">{title}</span>
        </button>
        {action && <div className="acc-action">{action}</div>}
      </div>
      {open && <div className="acc-body">{children}</div>}
    </div>
  )
}
