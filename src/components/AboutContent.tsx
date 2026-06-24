import { useI18n } from '../i18n'

const FAQ: [string, string][] = [
  ['about.q1', 'about.a1'],
  ['about.q2', 'about.a2'],
  ['about.q3', 'about.a3'],
]

/** Crawlable, keyword-rich content + FAQ (with FAQPage JSON-LD), localized and prerendered. */
export function AboutContent() {
  const { t } = useI18n()

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({
      '@type': 'Question',
      name: t(q),
      acceptedAnswer: { '@type': 'Answer', text: t(a) },
    })),
  }

  return (
    <section className="about">
      <h2>{t('about.h2')}</h2>
      <p>{t('about.intro')}</p>

      <h3>{t('about.howTitle')}</h3>
      <ol>
        <li>{t('about.step1')}</li>
        <li>{t('about.step2')}</li>
        <li>{t('about.step3')}</li>
      </ol>

      <h3>{t('about.faqTitle')}</h3>
      <dl>
        {FAQ.map(([q, a]) => (
          <div key={q}>
            <dt>{t(q)}</dt>
            <dd>{t(a)}</dd>
          </div>
        ))}
      </dl>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </section>
  )
}
