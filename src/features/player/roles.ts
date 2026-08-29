import type { StratzPosition, StratzRoleMatch } from '@/shared/api/types'

export type RoleKey = 'safe' | 'mid' | 'off' | 'support'

export const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'safe', label: 'Сейф-лейн' },
  { key: 'mid', label: 'Мид' },
  { key: 'off', label: 'Оффлейн' },
  { key: 'support', label: 'Поддержка' },
]

export interface RoleAggregate {
  games: number
  wins: number
  winrate: number | null
  avgKda: number | null
  avgGpm: number | null
  avgXpm: number | null
  avgHeroDamage: number | null
}

function mean(values: (number | null | undefined)[]) {
  const defined = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (defined.length === 0) return null
  return defined.reduce((sum, v) => sum + v, 0) / defined.length
}

export function positionToRole(position: StratzPosition): RoleKey | null {
  switch (position) {
    case 'POSITION_1':
      return 'safe'
    case 'POSITION_2':
      return 'mid'
    case 'POSITION_3':
      return 'off'
    case 'POSITION_4':
    case 'POSITION_5':
      return 'support'
    default:
      return null
  }
}

function aggregateOne(rows: StratzRoleMatch[]): RoleAggregate {
  const games = rows.length
  if (games === 0) {
    return { games: 0, wins: 0, winrate: null, avgKda: null, avgGpm: null, avgXpm: null, avgHeroDamage: null }
  }
  const decided = rows.filter((row) => row.isVictory !== null)
  const wins = decided.filter((row) => row.isVictory === true).length
  const totalKills = rows.reduce((sum, row) => sum + (row.kills ?? 0), 0)
  const totalDeaths = rows.reduce((sum, row) => sum + (row.deaths ?? 0), 0)
  const totalAssists = rows.reduce((sum, row) => sum + (row.assists ?? 0), 0)

  return {
    games,
    wins,
    winrate: decided.length > 0 ? wins / decided.length : null,
    avgKda: (totalKills + totalAssists) / Math.max(1, totalDeaths),
    avgGpm: mean(rows.map((row) => row.goldPerMinute)),
    avgXpm: mean(rows.map((row) => row.experiencePerMinute)),
    avgHeroDamage: mean(rows.map((row) => row.heroDamage)),
  }
}

export function aggregateByRole(rows: StratzRoleMatch[]): Record<RoleKey, RoleAggregate> {
  const buckets: Record<RoleKey, StratzRoleMatch[]> = { safe: [], mid: [], off: [], support: [] }
  for (const row of rows) {
    const role = positionToRole(row.position)
    if (role) buckets[role].push(row)
  }
  return {
    safe: aggregateOne(buckets.safe),
    mid: aggregateOne(buckets.mid),
    off: aggregateOne(buckets.off),
    support: aggregateOne(buckets.support),
  }
}
