import type { DurationRow } from './durations'
import { winrateColor } from '@/features/player/chartColor'
import { Bar } from '@/shared/ui/Stat'
import { EmptyState } from '@/shared/ui/States'
import { pct } from '@/shared/lib/format'

function label(bin: number) {
  const minutes = Math.round(bin / 60)
  return `${minutes} мин`
}

export function DurationWinrate({ rows }: { rows: DurationRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState title="Нет данных по длительности матчей" hint="OpenDota пока не отдал бины по этому герою." />
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.bin} className="flex items-center gap-3">
          <span className="num w-[52px] shrink-0 text-[12px] text-ink-3">{label(row.bin)}</span>
          <Bar value={row.winrate} tone={winrateColor(row.winrate)} />
          <span
            className="num w-[44px] shrink-0 text-right text-[12px] font-medium"
            style={{ color: winrateColor(row.winrate) }}
          >
            {pct(row.winrate, 0)}
          </span>
          <span className="num w-[48px] shrink-0 text-right text-[11px] text-ink-3">{row.games} игр</span>
        </div>
      ))}
    </div>
  )
}
