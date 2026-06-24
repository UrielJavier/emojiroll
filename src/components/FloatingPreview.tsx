import type { RefObject } from 'react'
import { useI18n } from '../i18n'

interface Props {
  miniRef: RefObject<HTMLCanvasElement | null>
  onOpen: () => void
  hidden: boolean
}

/** Mobile-only: a always-visible live thumbnail in the corner that opens the preview modal. */
export function FloatingPreview({ miniRef, onOpen, hidden }: Props) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      className={`mini-preview${hidden ? ' hidden' : ''}`}
      onClick={onOpen}
      aria-label={t('preview.title')}
    >
      <span className="mini-label">{t('preview.openMe')}</span>
      <canvas ref={miniRef} width={128} height={128} />
    </button>
  )
}
