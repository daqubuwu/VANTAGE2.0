import type { Hero, HeroMatchup } from '@/shared/api/types'
import { MIN_MATCHUP_GAMES } from '@/features/hero/matchups'

export interface CounterSuggestion {
  heroId: number
  avgEnemyWinrate: number
  samples: number
}

const TOP_N = 8

export function suggestCounters(
  enemyHeroIds: number[],
  matchupsByHero: Map<number, HeroMatchup[]> | undefined,
  excludeIds: Set<number>,
  allHeroes: Map<number, Hero> | undefined,
): CounterSuggestion[] {
  if (!matchupsByHero || !allHeroes || enemyHeroIds.length === 0) return []

  const totals = new Map<number, { sum: number; n: number }>()

  for (const enemyId of enemyHeroIds) {
    const rows = matchupsByHero.get(enemyId)
    if (!rows) continue
    for (const row of rows) {
      if (row.games_played < MIN_MATCHUP_GAMES) continue
      if (excludeIds.has(row.hero_id) || row.hero_id === enemyId) continue
      const enemyWinrate = row.wins / row.games_played
      const entry = totals.get(row.hero_id) ?? { sum: 0, n: 0 }
      entry.sum += enemyWinrate
      entry.n += 1
      totals.set(row.hero_id, entry)
    }
  }

  const rows: CounterSuggestion[] = []
  for (const [heroId, entry] of totals) {
    if (entry.n === 0 || !allHeroes.has(heroId)) continue
    rows.push({ heroId, avgEnemyWinrate: entry.sum / entry.n, samples: entry.n })
  }

  return rows.sort((a, b) => a.avgEnemyWinrate - b.avgEnemyWinrate).slice(0, TOP_N)
}
