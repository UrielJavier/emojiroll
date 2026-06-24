import { useI18n } from '../i18n'

export function LanguageSwitcher() {
  const { lang, setLang, langs, t } = useI18n()
  return (
    <div className="lang-seg" role="group" aria-label={t('lang.label')}>
      {langs.map((l) => (
        <button
          key={l.code}
          type="button"
          aria-pressed={lang === l.code}
          className={lang === l.code ? 'active' : undefined}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
