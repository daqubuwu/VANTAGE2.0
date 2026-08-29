import type { PlayerTotalsField } from '@/shared/api/types'

export function totalsField(totals: PlayerTotalsField[] | undefined, field: string) {
  return totals?.find((item) => item.field === field)
}

export function totalsMean(totals: PlayerTotalsField[] | undefined, field: string): number | null {
  const entry = totalsField(totals, field)
  if (!entry || entry.n === 0) return null
  return entry.sum / entry.n
}

export function totalsCount(totals: PlayerTotalsField[] | undefined, field: string): number {
  return totalsField(totals, field)?.n ?? 0
}
