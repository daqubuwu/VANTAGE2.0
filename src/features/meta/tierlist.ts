import type { HeroStat } from '@/shared/api/types'

export type BracketKey = 'pro' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const BRACKETS: { key: BracketKey; label: string }[] = [
  { key: 'pro', label: 'Про-сцена' },
  { key: 1, label: 'Рекрут' },
  { key: 2, label: 'Страж' },
  { key: 3, label: 'Рыцарь' },
  { key: 4, label: 'Герой' },
  { key: 5, label: 'Легенда' },
  { key: 6, label: 'Властелин' },
  { key: 7, label: 'Божество' },
  { key: 8, label: 'Титан' },
]

function pickWin(stat: HeroStat, bracket: BracketKey) {
  switch (bracket) {
    case 'pro':
      return { pick: stat.pro_pick, win: stat.pro_win }
    case 1:
      return { pick: stat['1_pick'], win: stat['1_win'] }
    case 2:
      return { pick: stat['2_pick'], win: stat['2_win'] }
    case 3:
      return { pick: stat['3_pick'], win: stat['3_win'] }
    case 4:
      return { pick: stat['4_pick'], win: stat['4_win'] }
    case 5:
      return { pick: stat['5_pick'], win: stat['5_win'] }
    case 6:
      return { pick: stat['6_pick'], win: stat['6_win'] }
    case 7:
      return { pick: stat['7_pick'], win: stat['7_win'] }
    case 8:
      return { pick: stat['8_pick'], win: stat['8_win'] }
  }
}

export interface TierRow {
  heroId: number
  games: number
  winrate: number
}

export function buildTierRows(stats: HeroStat[] | undefined, bracket: BracketKey): TierRow[] {
  if (!stats) return []

  const rows: TierRow[] = []
  for (const stat of stats) {
    const { pick, win } = pickWin(stat, bracket)
    if (pick && pick > 0) rows.push({ heroId: stat.id, games: pick, winrate: win / pick })
  }

  return rows.sort((a, b) => b.winrate - a.winrate)
}
