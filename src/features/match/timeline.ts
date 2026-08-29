import type { MatchPlayer } from '@/shared/api/types'

export function purchasedByMinute(player: MatchPlayer, minute: number) {
  const log = player.purchase_log ?? []
  const cutoff = minute * 60
  return log.filter((entry) => entry.time <= cutoff).map((entry) => entry.key)
}

export function valueAtMinute(series: number[] | null, minute: number) {
  if (!series || series.length === 0) return null
  const index = Math.min(minute, series.length - 1)
  return series[index] ?? null
}

const BIG_SWING_GOLD = 3000

export interface TurningPoint {
  minute: number
  advantage: number
  kind: 'flip' | 'swing'
}

export function findTurningPoints(radiantGoldAdv: number[] | null): TurningPoint[] {
  if (!radiantGoldAdv || radiantGoldAdv.length < 2) return []

  const points: TurningPoint[] = []
  for (let i = 1; i < radiantGoldAdv.length; i += 1) {
    const prev = radiantGoldAdv[i - 1] ?? 0
    const curr = radiantGoldAdv[i] ?? 0
    const flipped = prev !== 0 && curr !== 0 && Math.sign(prev) !== Math.sign(curr)
    const swung = Math.abs(curr - prev) >= BIG_SWING_GOLD

    if (flipped) {
      points.push({ minute: i, advantage: curr, kind: 'flip' })
    } else if (swung) {
      points.push({ minute: i, advantage: curr, kind: 'swing' })
    }
  }
  return points
}
