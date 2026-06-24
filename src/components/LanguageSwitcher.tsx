import { useI18n } from '../i18n'
import type { Lang } from '../i18n'

export function LanguageSwitcher() {
  const { lang, setLang, langs, t } = useI18n()

  const go = (code: Lang) => {
    if (code === lang) return
    setLang(code) // persist the choice
    const base = import.meta.env.BASE_URL // "/emojiroll/"
    window.location.assign(base + code + '/')
  }

  return (
    <select
      className="lang-select"
      value={lang}
      aria-label={t('lang.label')}
      onChange={(e) => go(e.target.value as Lang)}
    >
      {langs.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  )
}
