import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'es' | 'en'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

const LANG_KEY = 'emojirollLang_v1'

type Dict = Record<string, string>

// Spanish is the source/reference language and must be complete. Any key missing
// from another language falls back to Spanish, so partial translations are safe.
const es: Dict = {
  'app.eyebrow': 'Emojis animados para Slack',
  'app.reset': '↺ Reiniciar',
  'app.resetConfirm':
    '¿Empezar una composición nueva? Se perderá el diseño actual. Tus presets guardados se conservan.',
  'tabs.text': 'Texto',
  'tabs.motion': 'Movimiento',
  'tabs.color': 'Color',
  'layers.title': 'Capas',
  'layers.add': '+ Capa',
  'layers.empty': '(vacío)',
  'layers.move.up': 'Subir',
  'layers.move.down': 'Bajar',
  'layers.delete': 'Borrar capa',
  'layers.drag': 'Arrastra para reordenar',
  'layers.hint':
    'Arrastra para reordenar (o usa ↑↓). El orden es la profundidad: las de arriba se dibujan detrás. Cada capa tiene su velocidad y ángulo → parallax.',
  'lang.label': 'Idioma',
}

const en: Dict = {
  'app.eyebrow': 'Animated emoji for Slack',
  'app.reset': '↺ Reset',
  'app.resetConfirm': 'Start a new composition? The current design will be lost. Your saved presets are kept.',
  'tabs.text': 'Text',
  'tabs.motion': 'Motion',
  'tabs.color': 'Color',
  'layers.title': 'Layers',
  'layers.add': '+ Layer',
  'layers.empty': '(empty)',
  'layers.move.up': 'Move up',
  'layers.move.down': 'Move down',
  'layers.delete': 'Delete layer',
  'layers.drag': 'Drag to reorder',
  'layers.hint':
    'Drag to reorder (or use ↑↓). Order is depth: those on top are drawn behind. Each layer has its own speed and angle → parallax.',
  'lang.label': 'Language',
}

const DICT: Record<Lang, Dict> = { es, en }

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'
  }
  return 'es'
}

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
  langs: typeof LANGS
}

const I18nContext = createContext<I18nValue>({
  lang: 'es',
  setLang: () => {},
  t: (k) => es[k] ?? k,
  langs: LANGS,
})

export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? detectLang)

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      /* ignore */
    }
  }

  const t = useMemo(() => (key: string) => DICT[lang][key] ?? es[key] ?? key, [lang])

  return <I18nContext.Provider value={{ lang, setLang, t, langs: LANGS }}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nValue {
  return useContext(I18nContext)
}
