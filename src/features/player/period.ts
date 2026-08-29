import type { PlayerMatch } from '@/shared/api/types'

export const PERIODS = [
  { key: 'week', label: 'Неделя', days: 7 },
  { key: 'month', label: 'Месяц', days: 30 },
  { key: 'quarter', label: '3 месяца', days: 90 },
  { key: 'year', label: 'Год', days: 365 },
  { key: 'all', label: 'Всё время', days: null },
] as const

export type PeriodKey = (typeof PERIODS)[number]['key']

export function periodDays(key: PeriodKey) {
  return PERIODS.find((period) => period.key === key)?.days ?? null
}

export function withinPeriod(matches: PlayerMatch[], key: PeriodKey, now = Date.now()) {
  const days = periodDays(key)
  if (days === null) return matches
  const from = now / 1000 - days * 86400
  return matches.filter((match) => match.start_time >= from)
}

export function periodLabel(key: PeriodKey) {
  switch (key) {
    case 'week':
      return 'за неделю'
    case 'month':
      return 'за месяц'
    case 'quarter':
      return 'за 3 месяца'
    case 'year':
      return 'за год'
    default:
      return 'за всё время'
  }
}
