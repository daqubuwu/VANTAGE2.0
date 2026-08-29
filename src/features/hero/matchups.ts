import type { HeroMatchup } from '@/shared/api/types'

export const MIN_MATCHUP_GAMES = 20
const TOP_N = 5

export interface RankedMatchup {
  heroId: number
  games: number
  winrate: number
}

export interface RankedMatchups {
  best: RankedMatchup[]
  worst: RankedMatchup[]
}

export function rankMatchups(rows: HeroMatchup[] | undefined): RankedMatchups {
  const ranked: RankedMatchup[] = (rows ?? [])
    .filter((row) => row.games_played >= MIN_MATCHUP_GAMES)
    .map((row) => ({ heroId: row.hero_id, games: row.games_played, winrate: row.wins / row.games_played }))

  const best = [...ranked].sort((a, b) => b.winrate - a.winrate).slice(0, TOP_N)
  const worst = [...ranked].sort((a, b) => a.winrate - b.winrate).slice(0, TOP_N)

  return { best, worst }
}
