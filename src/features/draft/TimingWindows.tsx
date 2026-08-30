import { useState } from 'react'
import type { TimingRow } from './timing'
import { EmptyState } from '@/shared/ui/States'
import { Tooltip } from '@/shared/ui/Tooltip'
import { pct } from '@/shared/lib/format'

const HEIGHT = 180
const PAD_Y = 8
const PAD_X = 4

function label(bin: number) {
  return `${Math.round(bin / 60)}м`
}

function points(rows: TimingRow[], key: 'radiantWinrate' | 'direWinrate', chartWidth: number, innerHeight: number) {
  const zeroY = PAD_Y + innerHeight
  const step = rows.length > 1 ? (chartWidth - PAD_X * 2) / (rows.length - 1) : 0
  return rows.map((row, i) => {
    const value = row[key]
    if (value === null) return null
    const x = PAD_X + i * step
    const y = zeroY - innerHeight * value
    return { x, y, value, bin: row.bin }
  })
}

function linePath(pts: ({ x: number; y: number } | null)[]) {
  let d = ''
  let started = false
  for (const p of pts) {
    if (!p) {
      started = false
      continue
    }
    d += started ? ` L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`
    started = true
  }
  return d
}

export function TimingWindows({ rows }: { rows: TimingRow[] }) {
  const [width, setWidth] = useState(0)

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Соберите хотя бы по одному пику на сторону"
        hint="Тайминги считаются по средним данным выбранных героев."
      />
    )
  }

  const innerHeight = HEIGHT - PAD_Y * 2
  const chartWidth = Math.max(width, 1)
  const zeroY = PAD_Y + innerHeight
  const midY = PAD_Y + innerHeight / 2

  const radiantPts = points(rows, 'radiantWinrate', chartWidth, innerHeight)
  const direPts = points(rows, 'direWinrate', chartWidth, innerHeight)

  return (
    <div ref={(node) => setWidth(node?.getBoundingClientRect().width ?? 0)} className="surface-panel flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-radiant)' }} aria-hidden />
            Radiant
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-dire)' }} aria-hidden />
            Dire
          </span>
        </div>
        <span className="text-[11px] text-ink-3">winrate по минуте матча</span>
      </div>

      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${chartWidth} ${HEIGHT}`} preserveAspectRatio="none">
        <line x1={0} y1={PAD_Y} x2={chartWidth} y2={PAD_Y} stroke="var(--color-line)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={0} y1={midY} x2={chartWidth} y2={midY} stroke="var(--color-line)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={0} y1={zeroY} x2={chartWidth} y2={zeroY} stroke="var(--color-line)" strokeWidth={1} />

        <path d={linePath(radiantPts)} fill="none" stroke="var(--color-radiant)" strokeWidth={2} />
        <path d={linePath(direPts)} fill="none" stroke="var(--color-dire)" strokeWidth={2} />

        {radiantPts.map((p, i) =>
          p ? (
            <Tooltip key={`r-${i}`} content={<span>{label(p.bin)}: Radiant {pct(p.value, 0)}</span>}>
              <circle cx={p.x} cy={p.y} r={3.5} fill="var(--color-radiant)" tabIndex={0} className="cursor-help" />
            </Tooltip>
          ) : null,
        )}
        {direPts.map((p, i) =>
          p ? (
            <Tooltip key={`d-${i}`} content={<span>{label(p.bin)}: Dire {pct(p.value, 0)}</span>}>
              <circle cx={p.x} cy={p.y} r={3.5} fill="var(--color-dire)" tabIndex={0} className="cursor-help" />
            </Tooltip>
          ) : null,
        )}
      </svg>

      <div className="flex justify-between text-[11px] text-ink-3">
        {rows.map((row) => (
          <span key={row.bin} className="num">
            {label(row.bin)}
          </span>
        ))}
      </div>
    </div>
  )
}
