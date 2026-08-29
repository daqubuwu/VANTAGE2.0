import type { TimingRow } from './timingWindows'
import { winrateColor } from '@/features/player/chartColor'
import { Bar } from '@/shared/ui/Stat'
import { EmptyState } from '@/shared/ui/States'
import { pct } from '@/shared/lib/format'

function label(bin: number) {
  return `${Math.round(bin / 60)} мин`
}

export function TimingWindows({ rows }: { rows: TimingRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Соберите хотя бы по одному пику на сторону"
        hint="Тайминги считаются по средним данным выбранных героев."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.bin} className="flex items-center gap-3">
          <span className="num w-[52px] shrink-0 text-[12px] text-ink-3">{label(row.bin)}</span>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[11px] text-ink-3">Radiant</span>
              {row.radiantWinrate === null ? (
                <span className="text-[11px] text-ink-3">нет данных</span>
              ) : (
                <>
                  <Bar value={row.radiantWinrate} tone={winrateColor(row.radiantWinrate)} />
                  <span
                    className="num w-[40px] text-right text-[11px] font-medium"
                    style={{ color: winrateColor(row.radiantWinrate) }}
                  >
                    {pct(row.radiantWinrate, 0)}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[11px] text-ink-3">Dire</span>
              {row.direWinrate === null ? (
                <span className="text-[11px] text-ink-3">нет данных</span>
              ) : (
                <>
                  <Bar value={row.direWinrate} tone={winrateColor(row.direWinrate)} />
                  <span
                    className="num w-[40px] text-right text-[11px] font-medium"
                    style={{ color: winrateColor(row.direWinrate) }}
                  >
                    {pct(row.direWinrate, 0)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
