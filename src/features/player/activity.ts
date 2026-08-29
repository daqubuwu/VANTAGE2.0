export const ACTIVITY_WEEKS = 53

export interface ActivityCell {
  date: Date
  key: string
  count: number
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

export function buildActivity(timestamps: number[], now = new Date()): ActivityGrid {
  const today = startOfDay(now)
  const gridStart = mondayOf(new Date(today.getTime() - (ACTIVITY_WEEKS * 7 - 1) * 86400000))

  const counts = new Map<string, number>()
  for (const ts of timestamps) {
    const day = startOfDay(new Date(ts * 1000))
    if (day < gridStart || day > today) continue
    const key = dateKey(day)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const weeks: ActivityCell[][] = []
  const monthMarks: { index: number; label: string }[] = []
  let lastMonth = -1

  for (let w = 0; w < ACTIVITY_WEEKS; w += 1) {
    const cells: ActivityCell[] = []
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(gridStart.getTime() + (w * 7 + d) * 86400000)
      const key = dateKey(date)
      cells.push({
        date,
        key,
        count: counts.get(key) ?? 0,
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
  for (const count of counts.values()) {
    total += count
    if (count > 0) activeDays += 1
    if (count > max) max = count
  }

  return { weeks, monthMarks, total, activeDays, max: Math.max(1, max) }
}

export function activityLevel(count: number, max: number) {
  if (count === 0) return 0
  const ratio = count / max
  if (ratio > 0.66) return 4
  if (ratio > 0.33) return 3
  if (ratio > 0.15) return 2
  return 1
}
