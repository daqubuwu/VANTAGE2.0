import type { PlayerMatch } from '@/shared/api/types'
import { isRadiantSlot } from '@/shared/api/types'

export interface PlayerAggregate {
  games: number
  wins: number
  winrate: number | null
  avgKills: number | null
  avgDeaths: number | null
  avgAssists: number | null
  avgKda: number | null
  avgGpm: number | null
  avgXpm: number | null
  avgLastHits: number | null
  avgHeroDamage: number | null
  avgTowerDamage: number | null
  avgDuration: number | null
  totalDuration: number
  parsedCount: number
  parsedShare: number | null
}

export function isWin(match: PlayerMatch) {
  if (match.radiant_win === null) return null
  return match.radiant_win === isRadiantSlot(match.player_slot)
}

function mean(values: (number | null | undefined)[]) {
  const defined = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (defined.length === 0) return null
  return defined.reduce((sum, v) => sum + v, 0) / defined.length
}

export function aggregate(matches: PlayerMatch[]): PlayerAggregate {
  const games = matches.length
  if (games === 0) {
    return {
      games: 0,
      wins: 0,
      winrate: null,
      avgKills: null,
      avgDeaths: null,
      avgAssists: null,
      avgKda: null,
      avgGpm: null,
      avgXpm: null,
      avgLastHits: null,
      avgHeroDamage: null,
      avgTowerDamage: null,
      avgDuration: null,
      totalDuration: 0,
      parsedCount: 0,
      parsedShare: null,
    }
  }

  const decided = matches.filter((match) => isWin(match) !== null)
  const wins = decided.filter((match) => isWin(match) === true).length
  const totalKills = matches.reduce((sum, m) => sum + m.kills, 0)
  const totalDeaths = matches.reduce((sum, m) => sum + m.deaths, 0)
  const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0)

  return {
    games,
    wins,
    winrate: decided.length > 0 ? wins / decided.length : null,
    avgKills: totalKills / games,
    avgDeaths: totalDeaths / games,
    avgAssists: totalAssists / games,
    avgKda: (totalKills + totalAssists) / Math.max(1, totalDeaths),
    avgGpm: mean(matches.map((m) => m.gold_per_min)),
    avgXpm: mean(matches.map((m) => m.xp_per_min)),
    avgLastHits: mean(matches.map((m) => m.last_hits)),
    avgHeroDamage: mean(matches.map((m) => m.hero_damage)),
    avgTowerDamage: mean(matches.map((m) => m.tower_damage)),
    avgDuration: mean(matches.map((m) => m.duration)),
    totalDuration: matches.reduce((sum, m) => sum + m.duration, 0),
    parsedCount: matches.filter((m) => m.version !== null).length,
    parsedShare: matches.filter((m) => m.version !== null).length / games,
  }
}

export function rollingWinrate(matches: PlayerMatch[], window = 10) {
  const ordered = [...matches].sort((a, b) => a.start_time - b.start_time)
  const points: { time: number; value: number }[] = []
  for (let i = 0; i < ordered.length; i += 1) {
    const slice = ordered.slice(Math.max(0, i - window + 1), i + 1)
    const decided = slice.filter((m) => isWin(m) !== null)
    if (decided.length === 0) continue
    const wins = decided.filter((m) => isWin(m) === true).length
    const match = ordered[i]
    if (!match) continue
    points.push({ time: match.start_time, value: wins / decided.length })
  }
  return points
}
