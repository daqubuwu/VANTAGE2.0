import type { Match } from '@/shared/api/types'

export interface PickBanEntry {
  isPick: boolean
  heroId: number
  radiant: boolean
  order: number
}

export function buildDraftOrder(match: Match): PickBanEntry[] {
  const raw = match.picks_bans ?? []
  return raw
    .map((entry) => ({
      isPick: entry.is_pick,
      heroId: entry.hero_id,
      radiant: entry.team === 0,
      order: entry.order,
    }))
    .sort((a, b) => a.order - b.order)
}
