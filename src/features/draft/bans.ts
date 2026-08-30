import type { Hero } from '@/shared/api/types'
import type { TierRow } from '@/features/meta/tierlist'

export interface BanFilters {
  role: string | null
  minGames: number
}

export function suggestBans(
  tierRows: TierRow[],
  excludeIds: Set<number>,
  heroes: Map<number, Hero> | undefined,
  filters: BanFilters,
  limit: number,
): TierRow[] {
  return tierRows
    .filter((row) => !excludeIds.has(row.heroId))
    .filter((row) => row.games >= filters.minGames)
    .filter((row) => filters.role === null || (heroes?.get(row.heroId)?.roles.includes(filters.role) ?? false))
    .slice(0, limit)
}
