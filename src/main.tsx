import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.tsx'
import { I18nProvider, maybeRedirectToLang } from './i18n.tsx'

// language is URL-based (/ = es, /en/ = en); this may bounce the root to /en/
maybeRedirectToLang()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
