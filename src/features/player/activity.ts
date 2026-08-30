export const ACTIVITY_WEEKS = 53

export interface ActivityMatch {
  time: number
  win: boolean | null
}

export interface ActivityCell {
  date: Date
  key: string
  count: number
  wins: number
  losses: number
  future: boolean
}

export interface ActivityGrid {
  weeks: ActivityCell[][]
  monthMarks: { index: number; label: string }[]
  total: number
  activeDays: number
  max: number
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function mondayOf(date: Date) {
  const day = startOfDay(date)
  const shift = (day.getDay() + 6) % 7
  day.setDate(day.getDate() - shift)
  return day
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function buildActivity(matches: ActivityMatch[], now = new Date()): ActivityGrid {
  const today = startOfDay(now)
  const gridStart = mondayOf(new Date(today.getTime() - (ACTIVITY_WEEKS * 7 - 1) * 86400000))

  const counts = new Map<string, { count: number; wins: number; losses: number }>()
  for (const match of matches) {
    const day = startOfDay(new Date(match.time * 1000))
    if (day < gridStart || day > today) continue
    const key = dateKey(day)
    const entry = counts.get(key) ?? { count: 0, wins: 0, losses: 0 }
    entry.count += 1
    if (match.win === true) entry.wins += 1
    else if (match.win === false) entry.losses += 1
    counts.set(key, entry)
  }

  const weeks: ActivityCell[][] = []
  const monthMarks: { index: number; label: string }[] = []
  let lastMonth = -1

  for (let w = 0; w < ACTIVITY_WEEKS; w += 1) {
    const cells: ActivityCell[] = []
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(gridStart.getTime() + (w * 7 + d) * 86400000)
      const key = dateKey(date)
      const entry = counts.get(key)
      cells.push({
        date,
        key,
        count: entry?.count ?? 0,
        wins: entry?.wins ?? 0,
        losses: entry?.losses ?? 0,
        future: date > today,
      })
    }
    const first = cells[0]
    if (first && first.date.getMonth() !== lastMonth) {
      lastMonth = first.date.getMonth()
      monthMarks.push({ index: w, label: MONTHS[lastMonth] ?? '' })
    }
    weeks.push(cells)
  }

  let total = 0
  let activeDays = 0
  let max = 0
  for (const entry of counts.values()) {
    total += entry.count
    if (entry.count > 0) activeDays += 1
    if (entry.count > max) max = entry.count
  }

  return { weeks, monthMarks, total, activeDays, max: Math.max(1, max) }
}

export function activityIntensity(count: number, max: number) {
  if (count === 0) return 0
  const ratio = count / max
  if (ratio > 0.66) return 1
  if (ratio > 0.33) return 0.75
  if (ratio > 0.15) return 0.55
  return 0.35
}
