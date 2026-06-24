// Bakes the server-rendered app markup into dist/index.html so the page ships
// real HTML content (crawlers, social unfurls, first paint) instead of an empty
// root. The client still does a normal render on load, replacing this markup.
import { readFileSync, writeFileSync } from 'node:fs'
import { render } from '../dist-ssr/entry-server.js'

const file = 'dist/index.html'
const html = render()
const tpl = readFileSync(file, 'utf8')

if (!tpl.includes('<div id="root"></div>')) {
  throw new Error('prerender: could not find empty <div id="root"></div> in dist/index.html')
}
writeFileSync(file, tpl.replace('<div id="root"></div>', `<div id="root">${html}</div>`))
console.log(`prerender: injected ${html.length} chars of static markup into ${file}`)
