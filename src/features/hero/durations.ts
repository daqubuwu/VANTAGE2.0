import type { HeroDurationBucket } from '@/shared/api/types'

export interface DurationRow {
  bin: number
  games: number
  winrate: number
}

export function buildDurationRows(rows: HeroDurationBucket[] | undefined): DurationRow[] {
  return (rows ?? [])
    .filter((row) => row.games_played > 0)
    .map((row) => ({ bin: row.duration_bin, games: row.games_played, winrate: row.wins / row.games_played }))
    .sort((a, b) => a.bin - b.bin)
}
