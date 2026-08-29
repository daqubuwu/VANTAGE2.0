const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const freshness = {
  liveMatches: { staleTime: 30 * SECOND, gcTime: 5 * MINUTE, persist: false },
  playerProfile: { staleTime: 2 * MINUTE, gcTime: 7 * DAY, persist: true },
  playerMatches: { staleTime: 2 * MINUTE, gcTime: 7 * DAY, persist: true },
  matchParsed: { staleTime: Infinity, gcTime: 30 * DAY, persist: true },
  matchUnparsed: { staleTime: 5 * MINUTE, gcTime: 1 * DAY, persist: true },
  meta: { staleTime: 12 * HOUR, gcTime: 3 * DAY, persist: true },
  constants: { staleTime: 7 * DAY, gcTime: 30 * DAY, persist: true },
  proScene: { staleTime: 30 * MINUTE, gcTime: 3 * DAY, persist: true },
} as const

export type FreshnessKey = keyof typeof freshness
