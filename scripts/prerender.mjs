// Bakes server-rendered markup into static HTML, one page per language:
//   dist/index.html       → Spanish  (…/emojiroll/)
//   dist/<code>/index.html → other    (…/emojiroll/<code>/)
// Each page ships real content + a language-correct <head> (lang, canonical,
// og:url/locale, title, descriptions, JSON-LD). hreflang is shared. The client
// still renders normally over it.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { render } from '../dist-ssr/entry-server.js'

const FILE = 'dist/index.html'
const ROOT = '<div id="root"></div>'
const tpl = readFileSync(FILE, 'utf8')
if (!tpl.includes(ROOT)) throw new Error('prerender: empty <div id="root"></div> not found')

// ---- Spanish (root) ----
const esHtml = render('es')
writeFileSync(FILE, tpl.replace(ROOT, `<div id="root">${esHtml}</div>`))
console.log(`prerender: es → ${FILE} (${esHtml.length} chars)`)

// ---- Spanish source strings shared by every other page ----
const FROM = {
  htmlLang: '<html lang="es">',
  title: '<title>Emojiroll · crea emojis animados para Slack</title>',
  canonical: '<link rel="canonical" href="https://urieljavier.github.io/emojiroll/" />',
  ogUrl: '<meta property="og:url" content="https://urieljavier.github.io/emojiroll/" />',
  ogLocale: '<meta property="og:locale" content="es_ES" />',
  desc: 'content="Emojiroll: crea emojis animados para Slack. GIF 128×128 con texto en marquesina, parallax, diagonal, tipografías, degradados, sombra y contorno — gratis y desde el navegador."',
  keywords:
    'content="emoji Slack, crear emoji animado, GIF emoji, emoji marquesina, emoji parallax, emoji maker, Slack emoji generator"',
  titleMeta: 'content="Emojiroll · crea emojis animados para Slack"', // og:title + twitter:title
  ogDesc: 'content="GIF 128×128 con texto en marquesina, parallax y diagonal. Gratis y desde el navegador."', // og + twitter
  jsonUrl: '"url": "https://urieljavier.github.io/emojiroll/",',
  jsonLang: '"inLanguage": "es",',
  jsonDesc:
    '"description": "Creador de emojis animados para Slack: GIF 128×128 con texto en marquesina, parallax y diagonal, en el navegador."',
}

const PAGES = [
  {
    code: 'en',
    htmlLang: 'en',
    ogLocale: 'en_US',
    title: 'Emojiroll · create animated emoji for Slack',
    desc: 'Emojiroll: create animated emoji for Slack. 128×128 GIF with marquee text, parallax, diagonal, fonts, gradients, shadow and outline — free, right in the browser.',
    keywords: 'Slack emoji, animated emoji maker, GIF emoji, marquee emoji, parallax emoji, Slack emoji generator',
    titleMeta: 'Emojiroll · create animated emoji for Slack',
    ogDesc: '128×128 GIF with marquee, parallax and diagonal text. Free, in the browser.',
    jsonDesc: 'Animated emoji maker for Slack: 128×128 GIF with marquee, parallax and diagonal text, in the browser.',
  },
  {
    code: 'pt',
    htmlLang: 'pt',
    ogLocale: 'pt_BR',
    title: 'Emojiroll · crie emojis animados para o Slack',
    desc: 'Emojiroll: crie emojis animados para o Slack. GIF 128×128 com texto em marquee, parallax, diagonal, fontes, gradientes, sombra e contorno — grátis e direto no navegador.',
    keywords: 'emoji Slack, criar emoji animado, GIF emoji, emoji animado, gerador de emoji Slack',
    titleMeta: 'Emojiroll · crie emojis animados para o Slack',
    ogDesc: 'GIF 128×128 com texto em marquee, parallax e diagonal. Grátis, no navegador.',
    jsonDesc: 'Criador de emojis animados para o Slack: GIF 128×128 com texto em marquee, parallax e diagonal, no navegador.',
  },
  {
    code: 'ja',
    htmlLang: 'ja',
    ogLocale: 'ja_JP',
    title: 'Emojiroll · Slack用アニメ絵文字を作成',
    desc: 'Emojiroll：Slack用のアニメ絵文字を作成。流れるテキスト、視差、斜め、フォント、グラデーション、影、縁取りに対応した128×128のGIF — 無料・ブラウザだけで。',
    keywords: 'Slack 絵文字, アニメ絵文字 作成, GIF 絵文字, 動く絵文字, Slack カスタム絵文字',
    titleMeta: 'Emojiroll · Slack用アニメ絵文字を作成',
    ogDesc: '流れるテキスト・視差・斜めの128×128 GIF。無料・ブラウザだけで。',
    jsonDesc: 'Slack用アニメ絵文字メーカー：流れるテキスト・視差・斜めの128×128 GIFをブラウザで作成。',
  },
  {
    code: 'ko',
    htmlLang: 'ko',
    ogLocale: 'ko_KR',
    title: 'Emojiroll · Slack용 애니메이션 이모지 만들기',
    desc: 'Emojiroll: Slack용 애니메이션 이모지를 만드세요. 흐르는 텍스트, 패럴랙스, 대각선, 글꼴, 그라데이션, 그림자, 외곽선을 지원하는 128×128 GIF — 무료, 브라우저에서.',
    keywords: 'Slack 이모지, 애니메이션 이모지 제작, GIF 이모지, 움직이는 이모지, Slack 커스텀 이모지',
    titleMeta: 'Emojiroll · Slack용 애니메이션 이모지 만들기',
    ogDesc: '흐르는 텍스트·패럴랙스·대각선의 128×128 GIF. 무료, 브라우저에서.',
    jsonDesc: 'Slack용 애니메이션 이모지 메이커: 흐르는 텍스트·패럴랙스·대각선의 128×128 GIF를 브라우저에서 제작.',
  },
]

const U = 'https://urieljavier.github.io/emojiroll'

for (const p of PAGES) {
  const reps = [
    [FROM.htmlLang, `<html lang="${p.htmlLang}">`],
    [FROM.title, `<title>${p.title}</title>`],
    [FROM.canonical, `<link rel="canonical" href="${U}/${p.code}/" />`],
    [FROM.ogUrl, `<meta property="og:url" content="${U}/${p.code}/" />`],
    [FROM.ogLocale, `<meta property="og:locale" content="${p.ogLocale}" />`],
    [FROM.desc, `content="${p.desc}"`],
    [FROM.keywords, `content="${p.keywords}"`],
    [FROM.titleMeta, `content="${p.titleMeta}"`],
    [FROM.ogDesc, `content="${p.ogDesc}"`],
    [FROM.jsonUrl, `"url": "${U}/${p.code}/",`],
    [FROM.jsonLang, `"inLanguage": "${p.code}",`],
    [FROM.jsonDesc, `"description": "${p.jsonDesc}"`],
  ]
  let html = tpl
  for (const [from, to] of reps) {
    if (!html.includes(from)) throw new Error(`prerender(${p.code}): expected string not found: ${from.slice(0, 70)}…`)
    html = html.split(from).join(to)
  }
  const markup = render(p.code)
  mkdirSync(`dist/${p.code}`, { recursive: true })
  writeFileSync(`dist/${p.code}/index.html`, html.replace(ROOT, `<div id="root">${markup}</div>`))
  console.log(`prerender: ${p.code} → dist/${p.code}/index.html (${markup.length} chars)`)
}
