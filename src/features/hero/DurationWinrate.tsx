import { useState } from 'react'
import type { DurationRow } from './durations'
import { winrateColor } from '@/features/player/chartColor'
import { EmptyState } from '@/shared/ui/States'
import { Tooltip } from '@/shared/ui/Tooltip'
import { pct } from '@/shared/lib/format'

const HEIGHT = 160
const PAD_Y = 8
const BAR_GAP = 6

function label(bin: number) {
  return `${Math.round(bin / 60)}м`
}

export function DurationWinrate({ rows }: { rows: DurationRow[] }) {
  const [width, setWidth] = useState(0)

  if (rows.length === 0) {
    return (
      <EmptyState title="Нет данных по длительности матчей" hint="OpenDota пока не отдал бины по этому герою." />
    )
  }

  const innerHeight = HEIGHT - PAD_Y * 2
  const chartWidth = Math.max(width, 1)
  const barWidth = rows.length > 0 ? Math.max(0, (chartWidth - BAR_GAP * (rows.length - 1)) / rows.length) : 0
  const zeroY = PAD_Y + innerHeight
  const midY = PAD_Y + innerHeight / 2

  return (
    <div ref={(node) => setWidth(node?.getBoundingClientRect().width ?? 0)} className="surface-panel flex flex-col gap-2 p-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[11px] text-ink-3">100%</span>
        <span className="text-[11px] text-ink-3">50%</span>
        <span className="text-[11px] text-ink-3">0%</span>
      </div>

      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${chartWidth} ${HEIGHT}`} preserveAspectRatio="none">
        <line x1={0} y1={midY} x2={chartWidth} y2={midY} stroke="var(--color-line)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={0} y1={zeroY} x2={chartWidth} y2={zeroY} stroke="var(--color-line)" strokeWidth={1} />

        {rows.map((row, i) => {
          const x = i * (barWidth + BAR_GAP)
          const barHeight = Math.max(1, innerHeight * row.winrate)
          const y = zeroY - barHeight
          const color = winrateColor(row.winrate)
          return (
            <Tooltip
              key={row.bin}
              content={
                <span>
                  {label(row.bin)}: {pct(row.winrate, 0)}, {row.games} игр
                </span>
              }
            >
              <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx={2} tabIndex={0} className="cursor-help" />
            </Tooltip>
          )
        })}
      </svg>

      <div className="flex" style={{ gap: BAR_GAP }}>
        {rows.map((row) => (
          <span key={row.bin} className="num flex-1 text-center text-[11px] text-ink-3" style={{ minWidth: 0 }}>
            {label(row.bin)}
          </span>
        ))}
      </div>
    </div>
  )
}
