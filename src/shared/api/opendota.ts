import { getJson } from './http'

const BASE = 'https://api.opendota.com/api'

function url(path: string, params?: Record<string, string | number | undefined>) {
  const u = new URL(BASE + path)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) u.searchParams.set(key, String(value))
    }
  }
  return u.toString()
}

interface MatchProjection {
  match_id: number
  [field: string]: unknown
}

async function fetchProjection(id: number, params: Record<string, string | number>, field: string) {
  const rows = await getJson<MatchProjection[]>(url(`/players/${id}/matches`, { ...params, project: field }))
  return new Map(rows.map((row) => [row.match_id, row[field]]))
}

async function matchesWithExtras(id: number, params: Record<string, string | number>) {
  const [base, gpm, heroDamage] = await Promise.all([
    getJson<MatchProjection[]>(url(`/players/${id}/matches`, params)),
    fetchProjection(id, params, 'gold_per_min'),
    fetchProjection(id, params, 'hero_damage'),
  ])
  return base.map((match) => ({
    ...match,
    gold_per_min: gpm.get(match.match_id) ?? null,
    hero_damage: heroDamage.get(match.match_id) ?? null,
  }))
}

export const openDota = {
  player: (id: number) => getJson<unknown>(url(`/players/${id}`)),
  playerWinLoss: (id: number, params?: Record<string, string | number>) =>
    getJson<unknown>(url(`/players/${id}/wl`, params)),
  playerMatches: (id: number, limit: number, offset: number) =>
    matchesWithExtras(id, { limit, offset }),
  playerHistory: (id: number, limit: number) => matchesWithExtras(id, { limit }),
  playerHeroes: (id: number) => getJson<unknown[]>(url(`/players/${id}/heroes`)),
  playerPeers: (id: number) => getJson<unknown[]>(url(`/players/${id}/peers`)),
  playerTotals: (id: number, params?: Record<string, string | number>) =>
    getJson<unknown[]>(url(`/players/${id}/totals`, params)),
  playerCounts: (id: number) => getJson<unknown>(url(`/players/${id}/counts`)),
  playerHistograms: (id: number, field: string) =>
    getJson<unknown[]>(url(`/players/${id}/histograms/${field}`)),

  match: (id: number) => getJson<unknown>(url(`/matches/${id}`)),
  requestParse: (id: number) =>
    getJson<unknown>(url(`/request/${id}`), { method: 'POST' }),

  heroes: () => getJson<unknown[]>(url('/heroes')),
  heroStats: () => getJson<unknown[]>(url('/heroStats')),
  heroMatchups: (id: number) => getJson<unknown[]>(url(`/heroes/${id}/matchups`)),
  heroItemPopularity: (id: number) => getJson<unknown>(url(`/heroes/${id}/itemPopularity`)),
  heroDurations: (id: number) => getJson<unknown[]>(url(`/heroes/${id}/durations`)),
  benchmarks: (heroId: number) => getJson<unknown>(url('/benchmarks', { hero_id: heroId })),

  proMatches: (lessThanMatchId?: number) =>
    getJson<unknown[]>(url('/proMatches', { less_than_match_id: lessThanMatchId })),
  live: () => getJson<unknown[]>(url('/live')),
  teams: () => getJson<unknown[]>(url('/teams')),
  team: (id: number) => getJson<unknown>(url(`/teams/${id}`)),
  teamMatches: (id: number) => getJson<unknown[]>(url(`/teams/${id}/matches`)),
  teamPlayers: (id: number) => getJson<unknown[]>(url(`/teams/${id}/players`)),
  teamHeroes: (id: number) => getJson<unknown[]>(url(`/teams/${id}/heroes`)),

  search: (q: string) => getJson<unknown[]>(url('/search', { q })),
  constants: (resource: string) => getJson<unknown>(url(`/constants/${resource}`)),
}
