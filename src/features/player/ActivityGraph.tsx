import { useMemo } from 'react'
import { buildActivity, activityLevel } from './activity'
import { Tooltip } from '@/shared/ui/Tooltip'
import { plural } from '@/shared/lib/format'

const CELL = 11
const GAP = 3

const LEVEL_COLOR = [
  'rgba(255,255,255,.05)',
  'rgba(0,207,227,.22)',
  'rgba(0,207,227,.42)',
  'rgba(0,207,227,.68)',
  'rgba(55,234,255,.95)',
]

interface ActivityGraphProps {
  timestamps: number[]
}

export function ActivityGraph({ timestamps }: ActivityGraphProps) {
  const grid = useMemo(() => buildActivity(timestamps), [timestamps])

  return (
    <div className="surface-panel flex flex-col gap-3 p-4">
      <p className="text-[13px] text-ink-2">
        <span className="font-semibold text-ink">
          {grid.total} {plural(grid.total, 'матч', 'матча', 'матчей')}
        </span>{' '}
        за год · {grid.activeDays} {plural(grid.activeDays, 'день', 'дня', 'дней')} с играми
      </p>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-max">
          <div className="relative mb-1.5 h-4">
            {grid.monthMarks.map((mark) => (
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
            {grid.weeks.map((week, w) => (
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
                            : `${cell.count} ${plural(cell.count, 'матч', 'матча', 'матчей')}`}
                        </span>
                      }
                    >
                      <span
                        tabIndex={cell.count > 0 ? 0 : -1}
                        className="block rounded-[2px]"
                        style={{
                          width: CELL,
                          height: CELL,
                          background: LEVEL_COLOR[activityLevel(cell.count, grid.max)],
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
    </div>
  )
}
