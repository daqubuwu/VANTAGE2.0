import type { PlayerHeroRow, PlayerMatch, PlayerTotalsField } from '@/shared/api/types'
import { totalsMean } from '@/features/player/totals'

export interface CompareMetric {
  key: string
  label: string
  a: number | null
  b: number | null
  tone?: 'gold' | 'xp' | 'dmg'
}

const FIELDS: { key: string; label: string; tone?: CompareMetric['tone'] }[] = [
  { key: 'gold_per_min', label: 'GPM', tone: 'gold' },
  { key: 'xp_per_min', label: 'XPM', tone: 'xp' },
  { key: 'hero_damage', label: 'Урон по героям', tone: 'dmg' },
  { key: 'last_hits', label: 'Ластхиты' },
  { key: 'kills', label: 'Килы' },
  { key: 'deaths', label: 'Смерти' },
  { key: 'assists', label: 'Ассисты' },
]

export function buildMetrics(
  totalsA: PlayerTotalsField[] | undefined,
  totalsB: PlayerTotalsField[] | undefined,
): CompareMetric[] {
  return FIELDS.map((field) => ({
    key: field.key,
    label: field.label,
    tone: field.tone,
    a: totalsMean(totalsA, field.key),
    b: totalsMean(totalsB, field.key),
  }))
}

export interface CommonHeroRow {
  heroId: number
  a: PlayerHeroRow
  b: PlayerHeroRow
}

export function commonHeroes(
  a: PlayerHeroRow[] | undefined,
  b: PlayerHeroRow[] | undefined,
  minGames = 2,
): CommonHeroRow[] {
  if (!a || !b) return []
  const byIdB = new Map(b.map((row) => [row.hero_id, row]))
  const rows: CommonHeroRow[] = []
  for (const rowA of a) {
    const rowB = byIdB.get(rowA.hero_id)
    if (rowB && rowA.games >= minGames && rowB.games >= minGames) {
      rows.push({ heroId: Number(rowA.hero_id), a: rowA, b: rowB })
    }
  }
  return rows.sort((x, y) => y.a.games + y.b.games - (x.a.games + x.b.games)).slice(0, 12)
}

export function commonMatches(a: PlayerMatch[] | undefined, b: PlayerMatch[] | undefined): PlayerMatch[] {
  if (!a || !b) return []
  const idsB = new Set(b.map((match) => match.match_id))
  return a.filter((match) => idsB.has(match.match_id)).sort((x, y) => y.start_time - x.start_time)
}
