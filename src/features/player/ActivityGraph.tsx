import { useMemo, useState } from 'react'
import { buildActivity, activityIntensity } from './activity'
import type { ActivityMatch } from './activity'
import { winrateColor } from './chartColor'
import { Tooltip } from '@/shared/ui/Tooltip'
import { plural } from '@/shared/lib/format'

const CELL = 11
const GAP = 3
const MIN_WEEKS = 8
const NEUTRAL = '97, 106, 115'

interface ActivityGraphProps {
  matches: ActivityMatch[]
}

function cellColor(count: number, wins: number, losses: number, max: number) {
  if (count === 0) return 'rgba(255,255,255,.05)'
  const intensity = activityIntensity(count, max)
  const decided = wins + losses
  if (decided === 0) return `rgba(${NEUTRAL}, ${intensity})`
  return winrateColor(wins / decided).replace('rgb(', 'rgba(').replace(')', `, ${intensity})`)
}

export function ActivityGraph({ matches }: ActivityGraphProps) {
  const grid = useMemo(() => buildActivity(matches), [matches])
  const [width, setWidth] = useState(0)

  const weeksToShow = Math.max(MIN_WEEKS, Math.min(grid.weeks.length, Math.floor(width / (CELL + GAP))))
  const visibleWeeks = grid.weeks.slice(grid.weeks.length - weeksToShow)
  const dropped = grid.weeks.length - visibleWeeks.length
  const visibleMonthMarks = grid.monthMarks
    .map((mark) => ({ ...mark, index: mark.index - dropped }))
    .filter((mark) => mark.index >= 0)

  return (
    <div
      ref={(node) => setWidth(node?.getBoundingClientRect().width ?? 0)}
      className="surface-panel flex flex-col gap-3 p-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[13px] font-semibold text-ink">Активность</h3>
        <span className="text-[11px] text-ink-3">цвет ячейки - винрейт дня</span>
      </div>

      <p className="text-[13px] text-ink-2">
        <span className="font-semibold text-ink">
          {grid.total} {plural(grid.total, 'матч', 'матча', 'матчей')}
        </span>{' '}
        за год · {grid.activeDays} {plural(grid.activeDays, 'день', 'дня', 'дней')} с играми
      </p>

      <div>
        <div className="relative mb-1.5 h-4">
          {visibleMonthMarks.map((mark) => (
            <span
              key={`${mark.index}-${mark.label}`}
              className="absolute top-0 text-[11px] text-ink-3"
              style={{ left: mark.index * (CELL + GAP) }}
            >
              {mark.label}
            </span>
          ))}
        </div>

        <div className="flex" style={{ gap: GAP }}>
          {visibleWeeks.map((week, w) => (
            <div key={w} className="flex flex-col" style={{ gap: GAP }}>
              {week.map((cell) =>
                cell.future ? (
                  <span key={cell.key} style={{ width: CELL, height: CELL }} />
                ) : (
                  <Tooltip
                    key={cell.key}
                    content={
                      <span>
                        {cell.date.toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {': '}
                        {cell.count === 0
                          ? 'игр нет'
                          : `${cell.count} ${plural(cell.count, 'матч', 'матча', 'матчей')}, ${cell.wins}-${cell.losses}`}
                      </span>
                    }
                  >
                    <span
                      tabIndex={cell.count > 0 ? 0 : -1}
                      className="block rounded-[2px]"
                      style={{
                        width: CELL,
                        height: CELL,
                        background: cellColor(cell.count, cell.wins, cell.losses, grid.max),
                      }}
                    />
                  </Tooltip>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
