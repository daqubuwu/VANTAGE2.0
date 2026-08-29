import type { CompareMetric } from './compare'
import { compact, num } from '@/shared/lib/format'

const TONE_CLASS: Record<string, string> = {
  gold: 'text-gold',
  xp: 'text-xp',
  dmg: 'text-dmg',
}

function formatMetric(value: number | null, tone?: string) {
  return tone === 'dmg' ? compact(value) : num(value)
}

export function CompareMetricRow({ metric }: { metric: CompareMetric }) {
  const aHigher = metric.a !== null && metric.b !== null && metric.a > metric.b
  const bHigher = metric.a !== null && metric.b !== null && metric.b > metric.a
  const tone = metric.tone ? TONE_CLASS[metric.tone] : 'text-ink'

  return (
    <div className="grid grid-cols-[1fr_120px_1fr] items-center gap-3 py-2">
      <span className={`num text-right text-[14px] ${aHigher ? `${tone} font-semibold` : 'text-ink-2'}`}>
        {formatMetric(metric.a, metric.tone)}
      </span>
      <span className="text-center text-[11px] text-ink-3">{metric.label}</span>
      <span className={`num text-left text-[14px] ${bHigher ? `${tone} font-semibold` : 'text-ink-2'}`}>
        {formatMetric(metric.b, metric.tone)}
      </span>
    </div>
  )
}
