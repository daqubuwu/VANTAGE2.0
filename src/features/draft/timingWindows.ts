import type { HeroDurationBucket } from '@/shared/api/types'

export interface TimingRow {
  bin: number
  radiantWinrate: number | null
  direWinrate: number | null
}

function avgWinrateAt(bin: number, heroIds: number[], byHero: Map<number, HeroDurationBucket[]> | undefined) {
  if (!byHero) return null
  let sum = 0
  let n = 0
  for (const heroId of heroIds) {
    const rows = byHero.get(heroId)
    const row = rows?.find((r) => r.duration_bin === bin)
    if (row && row.games_played > 0) {
      sum += row.wins / row.games_played
      n += 1
    }
  }
  return n > 0 ? sum / n : null
}

export function buildTimingRows(
  radiantIds: number[],
  direIds: number[],
  byHero: Map<number, HeroDurationBucket[]> | undefined,
): TimingRow[] {
  if (!byHero) return []

  const bins = new Set<number>()
  for (const rows of byHero.values()) {
    for (const row of rows) bins.add(row.duration_bin)
  }

  return [...bins]
    .sort((a, b) => a - b)
    .map((bin) => ({
      bin,
      radiantWinrate: avgWinrateAt(bin, radiantIds, byHero),
      direWinrate: avgWinrateAt(bin, direIds, byHero),
    }))
    .filter((row) => row.radiantWinrate !== null || row.direWinrate !== null)
}
