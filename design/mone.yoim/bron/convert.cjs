// Zet een Claude Design .dc.html-template om naar statische HTML per thema.
// Gebruik: node convert.cjs <template.dc.html> <props-json> > fragment.html
const fs = require('fs')
const { createRequire } = require('module')
const req = createRequire(__filename)
const React = req('react')
const { renderToStaticMarkup } = req('react-dom/server')
const L = req('lucide-react')

const [, , file, propsJson] = process.argv
const props = JSON.parse(propsJson || '{}')
const src = fs.readFileSync(file, 'utf8')

const body = src.slice(src.indexOf('</helmet>') + '</helmet>'.length, src.indexOf('</x-dc>'))
const script = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1]

class DCLogic { constructor(p) { this.props = p } }
const Component = new Function('DCLogic', 'React', script + '\nreturn Component;')(DCLogic, React)
const vals = new Component(props).renderVals()

const pascal = (n) => n.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('')
const num = (s) => Number(s.replace(/[{}\s]/g, ''))
const missing = new Set()

let out = body.replace(/<sc-if value="\{\{ (\w+) \}\}"[^>]*>([\s\S]*?)<\/sc-if>/g, (_, k, inner) => {
  if (!(k in vals)) missing.add(k)
  return vals[k] ? inner : ''
})

out = out.replace(/<x-import component-from-global-scope="YoimDesignSystem_c2e02d\.Icoon"([^>]*)><\/x-import>/g, (_, attrs) => {
  const naam = attrs.match(/naam="([^"]+)"/)[1]
  const grootte = num(attrs.match(/grootte="([^"]+)"/)[1])
  const dikte = num(attrs.match(/dikte="([^"]+)"/)[1])
  const Icon = L[pascal(naam)] || L[pascal(naam) + 'Icon']
  if (!Icon) { missing.add('icoon:' + naam); return '' }
  return renderToStaticMarkup(React.createElement(Icon, { size: grootte, strokeWidth: dikte, 'aria-hidden': 'true', style: { flex: '0 0 auto' } }))
})

if (/<x-import/.test(out)) missing.add('andere x-import')

out = out.replace(/\{\{ ([^}]+?) \}\}/g, (_, k) => {
  if (/^-?[\d.]+$/.test(k)) return k
  if (!(k in vals)) { missing.add(k); return '' }
  const v = vals[k]
  if (React.isValidElement(v)) return renderToStaticMarkup(v)
  return String(v)
})

if (missing.size) { console.error('ONBEKEND: ' + [...missing].join(', ')); process.exit(1) }
process.stdout.write(out.trim())
