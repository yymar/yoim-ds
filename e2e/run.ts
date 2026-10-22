/**
 * Loopt elke draaiende yoim-app af en meet hover-, gekozen- en focusvlakken
 * (zie `page.ts`). Logt in via de dev-login tegen de lokale database, volgt
 * alle interne links vanaf de start en meet op telefoon en desktop.
 *
 *   npm run e2e            alle apps die lokaal draaien
 *   npm run e2e -- mone    alleen apps waarvan de naam dit bevat
 */
import { chromium, type Page } from 'playwright-core'

import * as geometry from './geometry.ts'
import * as page from './page.ts'

const APPS = [
  { name: 'weekl.yoim', url: 'http://localhost:3001' },
  { name: 'energ.yoim', url: 'http://localhost:3002' },
  { name: 'home.yoim', url: 'http://localhost:3003' },
  { name: 'yoim', url: 'http://localhost:3004' },
  { name: 'mone.yymar', url: 'http://localhost:3005' },
  { name: 'mone.yoim', url: 'http://localhost:3006' },
]

const VIEWPORTS = [
  { name: 'telefoon', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

const MAX_PAGES = 40
const MAX_TABS = 300
const MAX_DIALOGS = 6
const SKIP = /^\/(auth|api)\b|uitloggen|logout/

const prelude = Object.entries({ ...geometry, ...page })
  .map(([name, value]) => `const ${name} = ${typeof value === 'function' ? value.toString() : JSON.stringify(value)};`)
  .join('\n')
const script = (call: string) => `(() => { ${prelude}\n return ${call} })()`

/** Een id in een pad (uuid of getal) telt als één pagina: `/recepten/12` en `/recepten/13` zijn hetzelfde scherm. */
const pattern = (path: string) => path.replace(/\/[0-9a-f-]{8,}|\/\d+/gi, '/:id')

async function login(p: Page, url: string) {
  await p.goto(`${url}/auth/dev`, { waitUntil: 'networkidle' })
  // mone vraagt na het inloggen om een passkey.
  await p.getByRole('button', { name: 'Later' }).click({ timeout: 1500 }).catch(() => {})
}

async function settle(p: Page) {
  await p.waitForLoadState('networkidle').catch(() => {})
  await p.evaluate(() => document.fonts.ready).catch(() => {})
  await p.waitForTimeout(600)
}

/** Wacht tot smooth scroll en snappen klaar zijn: drie frames zonder beweging, hooguit een seconde. */
async function settleScroll(p: Page) {
  await p.evaluate(
    () =>
      new Promise<void>((done) => {
        const position = () => {
          let sum = window.scrollY
          for (let a = document.activeElement?.parentElement; a; a = a.parentElement) sum += a.scrollLeft + a.scrollTop
          return sum
        }
        let last = position()
        let still = 0
        const start = performance.now()
        const tick = () => {
          const now = position()
          still = now === last ? still + 1 : 0
          last = now
          if (still >= 3 || performance.now() - start > 1000) done()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
}

async function focusPass(p: Page) {
  const found: page.Problem[] = []
  await p.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  let first: string | null = null
  for (let i = 0; i < MAX_TABS; i++) {
    await p.keyboard.press('Tab')
    const id = await p.evaluate(() => {
      const el = document.activeElement as HTMLElement & { __tab?: string }
      if (!el || el === document.body) return null
      el.__tab ??= Math.random().toString(36).slice(2)
      return el.__tab
    })
    if (!id || id === first) break
    first ??= id
    await settleScroll(p)
    found.push(...(await p.evaluate(script('focusProblems()')) as page.Problem[]))
  }
  return found
}

/**
 * Elke soort sheet of dialoog op de pagina: openen, meten, sluiten. Een soort is
 * een trigger met dezelfde klassen, zodat een lijst van twintig rijen er één is.
 * Openen is veilig; alleen wat erin staat zou iets doen, en daar klikken we niet.
 */
async function dialogs(p: Page, path: string) {
  const found: page.Problem[] = []
  const triggers = await p.evaluate(() => {
    const seen = new Set<string>()
    return [...document.querySelectorAll('[aria-haspopup="dialog"]')]
      .map((el, i) => ({ i, kind: `${el.tagName}.${typeof el.className === 'string' ? el.className : ''}`, shown: el.getBoundingClientRect().width > 0 }))
      .filter((t) => t.shown && !seen.has(t.kind) && seen.add(t.kind))
      .map((t) => t.i)
  })
  for (const i of triggers.slice(0, MAX_DIALOGS)) {
    const trigger = p.locator('[aria-haspopup="dialog"]').nth(i)
    if (!(await trigger.click({ timeout: 2000 }).then(() => true, () => false))) continue
    await settle(p)
    if (new URL(p.url()).pathname !== new URL(path, 'http://x').pathname) {
      await p.goBack().catch(() => {})
      await settle(p)
      continue
    }
    found.push(...(await p.evaluate(script('staticProblems()')) as page.Problem[]), ...(await focusPass(p)))
    await p.keyboard.press('Escape')
    await settle(p)
  }
  return found
}

async function crawl(app: (typeof APPS)[number], viewport: (typeof VIEWPORTS)[number], browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const context = await browser.newContext({ viewport })
  const p = await context.newPage()
  await login(p, app.url)
  const seen = new Set<string>()
  const queue = ['/']
  const report: string[] = []
  const known = new Set<string>()
  while (queue.length && seen.size < MAX_PAGES) {
    const path = queue.shift()!
    if (seen.has(pattern(path))) continue
    seen.add(pattern(path))
    await p.goto(app.url + path).catch(() => {})
    await settle(p)
    if (new URL(p.url()).pathname.startsWith('/auth')) {
      report.push(`  ${path}: niet ingelogd, overgeslagen`)
      continue
    }
    const links = await p.evaluate(() => [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')!.split('#')[0]))
    for (const l of links) if (!SKIP.test(l) && !seen.has(pattern(l.split('?')[0]))) queue.push(l.split('?')[0])
    const problems = [...(await p.evaluate(script('staticProblems()')) as page.Problem[]), ...(await focusPass(p)), ...(await dialogs(p, path))]
    for (const x of problems) {
      const key = `${x.rule}|${x.target}|${x.other}`
      if (known.has(key)) continue
      known.add(key)
      report.push(`  ${path}  ${x.rule} (${x.px}px)\n      ${x.target}\n      ${x.rule.includes('raken') ? 'naast' : 'in'} ${x.other}`.trimEnd())
    }
  }
  await context.close()
  return { pages: seen.size, report }
}

const filter = process.argv[2]
const browser = await chromium.launch()
const exact = APPS.some((a) => a.name === filter)

/** Eén app op beide breedtes; de apps lopen naast elkaar, het rapport komt per app. */
async function check(app: (typeof APPS)[number]) {
  const up = await fetch(`${app.url}/auth/login`, { redirect: 'manual' }).then(() => true, () => false)
  if (!up) return { count: 0, lines: [`${app.name}: draait niet op ${app.url}, overgeslagen`] }
  let count = 0
  const lines: string[] = []
  for (const viewport of VIEWPORTS) {
    const { pages, report } = await crawl(app, viewport, browser)
    const found = report.filter((r) => !r.includes('overgeslagen')).length
    count += found
    lines.push(`${app.name} ${viewport.name}: ${pages} pagina's, ${found} problemen`, ...report)
  }
  return { count, lines }
}

const results = await Promise.all(APPS.filter((a) => !filter || (exact ? a.name === filter : a.name.includes(filter))).map(check))
for (const r of results) console.log(r.lines.join('\n'))
await browser.close()
process.exit(results.some((r) => r.count) ? 1 : 0)
