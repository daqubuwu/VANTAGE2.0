import { chromium } from 'playwright'
import { heroes, player, matches, playerHeroes, peers } from './fixtures.mjs'

const path = process.argv[2] ?? '/player/898936527'
const out = process.argv[3] ?? '/tmp/shot.png'
const height = Number(process.argv[4] ?? 1150)

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1440, height }, deviceScaleFactor: 1 })

const errors = []
page.on('pageerror', (err) => errors.push(String(err)))
page.on('console', (msg) => {
  if (msg.type() === 'error' && !msg.text().includes('ERR_')) errors.push(msg.text())
})

await page.route('**://www.opendota.com/assets/**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="28" fill="#22303c" stroke="#3d5566" stroke-width="3"/></svg>',
  }),
)

await page.route('**://cdn.cloudflare.steamstatic.com/**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="72"><rect width="128" height="72" fill="#1b2530"/><circle cx="64" cy="36" r="16" fill="#2b3a48"/></svg>',
  }),
)

await page.route('**://api.opendota.com/api/**', (route) => {
  const url = new URL(route.request().url())
  const p = url.pathname.replace('/api', '')
  const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })

  if (p === '/heroes') return json(heroes)
  if (p === '/players/898936527') return json(player)
  if (p === '/players/898936527/heroes') return json(playerHeroes)
  if (p === '/players/898936527/peers') return json(peers)
  if (p === '/players/898936527/matches') {
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const limit = Number(url.searchParams.get('limit') ?? 20)
    if (limit > 100) return json(matches(300, 0))
    return json(offset >= 60 ? [] : matches(limit, offset))
  }
  if (p === '/search') return json([])
  return json([])
})

await page.goto('http://127.0.0.1:4173' + path, { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(2200)
await page.screenshot({ path: out })

console.log('url:', page.url())
console.log('title:', await page.title())
console.log(errors.length ? 'errors:\n' + errors.join('\n') : 'errors: none')

await browser.close()
