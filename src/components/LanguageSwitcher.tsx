import { Select } from './Select'
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
    <Select
      value={lang}
      options={langs.map((l) => ({ value: l.code, label: l.label }))}
      onChange={go}
      ariaLabel={t('lang.label')}
      compact
    />
  )
}
