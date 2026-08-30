import type { PlayerMatch } from '@/shared/api/types'
import { aggregate } from './aggregate'
import type { PlayerAggregate } from './aggregate'
import { withinPeriod } from './period'
import type { PeriodKey } from './period'
import type { MatchPosition } from './matchPositions'
import type { RoleKey } from './roles'

export interface HeroRow extends PlayerAggregate {
  heroId: number
}

export function scopeMatches(
  matches: PlayerMatch[],
  period: PeriodKey,
  role: RoleKey | null,
  positions: Map<number, MatchPosition>,
): PlayerMatch[] {
  const byPeriod = withinPeriod(matches, period)
  if (role === null) return byPeriod
  return byPeriod.filter((match) => positions.get(match.match_id)?.role === role)
}

export function buildHeroRows(scoped: PlayerMatch[]): HeroRow[] {
  const byHero = new Map<number, PlayerMatch[]>()
  for (const match of scoped) {
    const list = byHero.get(match.hero_id) ?? []
    list.push(match)
    byHero.set(match.hero_id, list)
  }

  const rows: HeroRow[] = []
  for (const [heroId, list] of byHero) {
    rows.push({ heroId, ...aggregate(list) })
  }
  return rows.sort((a, b) => b.games - a.games)
}
