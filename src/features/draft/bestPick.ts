import type { Hero, HeroMatchup } from '@/shared/api/types'
import type { TierRow } from '@/features/meta/tierlist'
import { MIN_MATCHUP_GAMES } from '@/features/hero/matchups'

export interface BestPickRow {
  heroId: number
  score: number
  counterWinrate: number | null
  metaWinrate: number | null
  novelRoles: string[]
}

const LIMIT = 8

function roleCounts(allyIds: number[], heroes: Map<number, Hero>) {
  const counts = new Map<string, number>()
  for (const id of allyIds) {
    const hero = heroes.get(id)
    if (!hero) continue
    for (const role of hero.roles) counts.set(role, (counts.get(role) ?? 0) + 1)
  }
  return counts
}

export function suggestBestPicks(
  allyIds: number[],
  enemyIds: number[],
  matchupsByHero: Map<number, HeroMatchup[]> | undefined,
  tierRows: TierRow[],
  excludeIds: Set<number>,
  heroes: Map<number, Hero> | undefined,
): BestPickRow[] {
  if (!heroes) return []

  const metaByHero = new Map(tierRows.map((row) => [row.heroId, row.winrate]))

  const counterSum = new Map<number, { sum: number; n: number }>()
  if (matchupsByHero) {
    for (const enemyId of enemyIds) {
      const rows = matchupsByHero.get(enemyId)
      if (!rows) continue
      for (const row of rows) {
        if (row.games_played < MIN_MATCHUP_GAMES) continue
        if (excludeIds.has(row.hero_id) || row.hero_id === enemyId) continue
        const entry = counterSum.get(row.hero_id) ?? { sum: 0, n: 0 }
        entry.sum += row.wins / row.games_played
        entry.n += 1
        counterSum.set(row.hero_id, entry)
      }
    }
  }

  const allyRoles = roleCounts(allyIds, heroes)
  const candidates = new Set<number>([...metaByHero.keys(), ...counterSum.keys()])
  const rows: BestPickRow[] = []

  for (const heroId of candidates) {
    if (excludeIds.has(heroId)) continue
    const hero = heroes.get(heroId)
    if (!hero) continue

    const counterEntry = counterSum.get(heroId)
    const counterWinrate = counterEntry ? 1 - counterEntry.sum / counterEntry.n : null
    const metaWinrate = metaByHero.get(heroId) ?? null

    const novelRoles = hero.roles.filter((role) => (allyRoles.get(role) ?? 0) === 0)
    const noveltyScore = hero.roles.length > 0 ? novelRoles.length / hero.roles.length : 0

    let score: number
    if (counterWinrate !== null && metaWinrate !== null) {
      score = counterWinrate * 0.55 + metaWinrate * 0.3 + noveltyScore * 0.15
    } else if (counterWinrate !== null) {
      score = counterWinrate * 0.8 + noveltyScore * 0.2
    } else if (metaWinrate !== null) {
      score = metaWinrate * 0.85 + noveltyScore * 0.15
    } else {
      continue
    }

    rows.push({ heroId, score, counterWinrate, metaWinrate, novelRoles })
  }

  return rows.sort((a, b) => b.score - a.score).slice(0, LIMIT)
}
