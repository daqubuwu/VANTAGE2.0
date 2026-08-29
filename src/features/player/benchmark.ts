import type { HeroBenchmarkPoint } from '@/shared/api/types'

export function medianValue(points: HeroBenchmarkPoint[] | undefined) {
  if (!points || points.length === 0) return null
  let closest = points[0]
  if (!closest) return null
  let bestDistance = Math.abs(closest.percentile - 0.5)
  for (const point of points) {
    const distance = Math.abs(point.percentile - 0.5)
    if (distance < bestDistance) {
      closest = point
      bestDistance = distance
    }
  }
  return closest.value
}

export function deltaShare(own: number | null, median: number | null) {
  if (own === null || median === null || median === 0) return null
  return (own - median) / median
}
