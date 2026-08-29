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

export const openDota = {
  player: (id: number) => getJson<unknown>(url(`/players/${id}`)),
  playerWinLoss: (id: number, params?: Record<string, string | number>) =>
    getJson<unknown>(url(`/players/${id}/wl`, params)),
  playerMatches: (id: number, limit: number, offset: number) =>
    getJson<unknown[]>(url(`/players/${id}/matches`, { limit, offset })),
  playerHistory: (id: number, limit: number) =>
    getJson<unknown[]>(url(`/players/${id}/matches`, { limit })),
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
  team: (id: number) => getJson<unknown>(url(`/teams/${id}`)),
  teamMatches: (id: number) => getJson<unknown[]>(url(`/teams/${id}/matches`)),
  teamPlayers: (id: number) => getJson<unknown[]>(url(`/teams/${id}/players`)),

  search: (q: string) => getJson<unknown[]>(url('/search', { q })),
  constants: (resource: string) => getJson<unknown>(url(`/constants/${resource}`)),
}
