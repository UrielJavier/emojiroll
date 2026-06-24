import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import { I18nProvider } from './i18n.tsx'
import type { Lang } from './i18n.tsx'

/** Renders the app to static HTML so crawlers and first paint get real content. */
export function render(lang: Lang = 'es'): string {
  return renderToString(
    <StrictMode>
      <I18nProvider initialLang={lang}>
        <App />
      </I18nProvider>
    </StrictMode>,
  )
}
