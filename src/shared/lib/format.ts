const PLURAL_RULES = new Intl.PluralRules('ru-RU')

export function plural(count: number, one: string, few: string, many: string) {
  const form = PLURAL_RULES.select(count)
  if (form === 'one') return one
  if (form === 'few') return few
  return many
}

export function num(value: number | null | undefined, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return new Intl.NumberFormat('ru-RU').format(Math.round(value))
}

export function dec(value: number | null | undefined, digits = 1, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return value.toFixed(digits).replace('.', ',')
}

export function pct(value: number | null | undefined, digits = 1, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return `${(value * 100).toFixed(digits).replace('.', ',')}%`
}

export function compact(value: number | null | undefined, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  if (Math.abs(value) < 1000) return String(Math.round(value))
  return `${(value / 1000).toFixed(1).replace('.', ',')}k`
}

export function signed(value: number | null | undefined, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return value > 0 ? `+${num(value)}` : num(value)
}

export function mmss(seconds: number | null | undefined, fallback = '—') {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return fallback
  const sign = seconds < 0 ? '-' : ''
  const abs = Math.abs(Math.round(seconds))
  const m = Math.floor(abs / 60)
  const s = abs % 60
  return `${sign}${m}:${String(s).padStart(2, '0')}`
}

export function duration(seconds: number | null | undefined, fallback = '—') {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return fallback
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

const AGO_STEPS: [number, string, string, string][] = [
  [60, 'секунду', 'секунды', 'секунд'],
  [3600, 'минуту', 'минуты', 'минут'],
  [86400, 'час', 'часа', 'часов'],
  [2592000, 'день', 'дня', 'дней'],
  [31536000, 'месяц', 'месяца', 'месяцев'],
]

export function ago(unixSeconds: number | null | undefined, now = Date.now(), fallback = '—') {
  if (!unixSeconds) return fallback
  const diff = Math.max(0, Math.floor(now / 1000 - unixSeconds))
  if (diff < 45) return 'только что'

  const divisors = [1, 60, 3600, 86400, 2592000]
  for (let i = 1; i < AGO_STEPS.length; i += 1) {
    const step = AGO_STEPS[i]
    const divisor = divisors[i]
    if (step === undefined || divisor === undefined) break
    if (diff < step[0]) {
      const value = Math.floor(diff / divisor)
      return `${value} ${plural(value, step[1], step[2], step[3])} назад`
    }
  }
  const years = Math.floor(diff / 31536000)
  return `${years} ${plural(years, 'год', 'года', 'лет')} назад`
}

export function kda(kills: number, deaths: number, assists: number) {
  return (kills + assists) / Math.max(1, deaths)
}
