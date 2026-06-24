import { useI18n } from '../i18n'
import type { Lang } from '../i18n'

export function LanguageSwitcher() {
  const { lang, setLang, langs, t } = useI18n()

  const go = (code: Lang) => {
    if (code === lang) return
    setLang(code) // persist the choice
    const base = import.meta.env.BASE_URL // "/emojiroll/"
    window.location.assign(code === 'es' ? base : base + code + '/')
  }

  return (
    <div className="lang-seg" role="group" aria-label={t('lang.label')}>
      {langs.map((l) => (
        <button
          key={l.code}
          type="button"
          aria-pressed={lang === l.code}
          className={lang === l.code ? 'active' : undefined}
          onClick={() => go(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
