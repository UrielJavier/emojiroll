// Bakes server-rendered markup into static HTML, one page per language:
//   dist/index.html      → Spanish  (https://…/emojiroll/)
//   dist/en/index.html   → English  (https://…/emojiroll/en/)
// Each ships real content + a language-correct <head> (lang, canonical, og, hreflang
// stays shared). The client still renders normally over it.
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

// ---- English (/en/): rewrite the language-specific head bits ----
const EN_REPLACEMENTS = [
  ['<html lang="es">', '<html lang="en">'],
  [
    '<title>Emojiroll · crea emojis animados para Slack</title>',
    '<title>Emojiroll · create animated emoji for Slack</title>',
  ],
  [
    '<link rel="canonical" href="https://urieljavier.github.io/emojiroll/" />',
    '<link rel="canonical" href="https://urieljavier.github.io/emojiroll/en/" />',
  ],
  [
    '<meta property="og:url" content="https://urieljavier.github.io/emojiroll/" />',
    '<meta property="og:url" content="https://urieljavier.github.io/emojiroll/en/" />',
  ],
  ['<meta property="og:locale" content="es_ES" />', '<meta property="og:locale" content="en_US" />'],
  [
    'content="Emojiroll: crea emojis animados para Slack. GIF 128×128 con texto en marquesina, parallax, diagonal, tipografías, degradados, sombra y contorno — gratis y desde el navegador."',
    'content="Emojiroll: create animated emoji for Slack. 128×128 GIF with marquee text, parallax, diagonal, fonts, gradients, shadow and outline — free, right in the browser."',
  ],
  [
    'content="emoji Slack, crear emoji animado, GIF emoji, emoji marquesina, emoji parallax, emoji maker, Slack emoji generator"',
    'content="Slack emoji, animated emoji maker, GIF emoji, marquee emoji, parallax emoji, Slack emoji generator"',
  ],
  // og:title + twitter:title (both occurrences)
  ['content="Emojiroll · crea emojis animados para Slack"', 'content="Emojiroll · create animated emoji for Slack"'],
  // og:description + twitter:description (both occurrences)
  [
    'content="GIF 128×128 con texto en marquesina, parallax y diagonal. Gratis y desde el navegador."',
    'content="128×128 GIF with marquee, parallax and diagonal text. Free, in the browser."',
  ],
  // JSON-LD
  ['"url": "https://urieljavier.github.io/emojiroll/",', '"url": "https://urieljavier.github.io/emojiroll/en/",'],
  ['"inLanguage": "es",', '"inLanguage": "en",'],
  [
    '"description": "Creador de emojis animados para Slack: GIF 128×128 con texto en marquesina, parallax y diagonal, en el navegador."',
    '"description": "Animated emoji maker for Slack: 128×128 GIF with marquee, parallax and diagonal text, in the browser."',
  ],
]

let enTpl = tpl
for (const [from, to] of EN_REPLACEMENTS) {
  if (!enTpl.includes(from)) throw new Error(`prerender(en): expected string not found: ${from.slice(0, 70)}…`)
  enTpl = enTpl.split(from).join(to) // replace every occurrence
}
const enHtml = render('en')
mkdirSync('dist/en', { recursive: true })
writeFileSync('dist/en/index.html', enTpl.replace(ROOT, `<div id="root">${enHtml}</div>`))
console.log(`prerender: en → dist/en/index.html (${enHtml.length} chars)`)
