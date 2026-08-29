import { chromium } from 'playwright'
import {
  heroes,
  player,
  matches,
  playerHeroes,
  peers,
  benchmarks,
  totals,
  stratzRoleMatches,
  match,
  items,
  abilityIds,
  abilities,
  heroAbilities,
  heroStats,
  heroMatchups,
  heroDurations,
  heroItemPopularity,
} from './fixtures.mjs'

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
  if (p === '/benchmarks') return json(benchmarks(Number(url.searchParams.get('hero_id') ?? 0)))
  if (p === '/players/898936527/totals') {
    const heroId = url.searchParams.get('hero_id')
    return json(totals(heroId ? Number(heroId) : undefined))
  }
  if (/^\/matches\/\d+$/.test(p)) return json(match(Number(p.split('/')[2])))
  if (p === '/constants/items') return json(items)
  if (p === '/constants/ability_ids') return json(abilityIds)
  if (p === '/constants/abilities') return json(abilities)
  if (p === '/constants/hero_abilities') return json(heroAbilities)
  if (p === '/heroStats') return json(heroStats)
  if (/^\/heroes\/\d+\/matchups$/.test(p)) return json(heroMatchups(Number(p.split('/')[2])))
  if (/^\/heroes\/\d+\/durations$/.test(p)) return json(heroDurations(Number(p.split('/')[2])))
  if (/^\/heroes\/\d+\/itemPopularity$/.test(p)) return json(heroItemPopularity(Number(p.split('/')[2])))
  return json([])
})

await page.route('**/api/stratz', (route) => {
  const body = JSON.parse(route.request().postData() ?? '{}')
  const query = String(body.query ?? '')
  const json = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) })

  if (query.includes('gameVersions')) return json({ constants: { gameVersions: [{ id: 1 }] } })
  if (query.includes('PlayerRoleMatches')) {
    const take = Number(body.variables?.take ?? 60)
    return json({ player: { matches: stratzRoleMatches(Math.min(take, 60)).map((p) => ({ players: [p] })) } })
  }
  return json(null)
})

await page.goto('http://127.0.0.1:4173' + path, { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(2200)
await page.screenshot({ path: out })

console.log('url:', page.url())
console.log('title:', await page.title())
console.log(errors.length ? 'errors:\n' + errors.join('\n') : 'errors: none')

await browser.close()
