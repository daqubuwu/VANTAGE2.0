import { PERIODS } from './period'
import type { PeriodKey } from './period'

interface PeriodFilterProps {
  value: PeriodKey
  onChange: (value: PeriodKey) => void
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Период"
      className="flex w-fit gap-1 rounded-full border border-line-2 bg-surface p-1"
    >
      {PERIODS.map((period) => {
        const active = period.key === value
        return (
          <button
            key={period.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(period.key)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors active:translate-y-px ${
              active
                ? 'bg-accent font-medium text-[#04171a]'
                : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {period.label}
          </button>
        )
      })}
    </div>
  )
}
