import type { TierRow } from '@/features/meta/tierlist'

export function suggestBans(tierRows: TierRow[], excludeIds: Set<number>, limit = 8): TierRow[] {
  return tierRows.filter((row) => !excludeIds.has(row.heroId)).slice(0, limit)
}
