import { useId, useMemo, useState } from 'react'
import { rollingWinrate } from './aggregate'
import { winrateColor } from './chartColor'
import { Tooltip, MathTooltip } from '@/shared/ui/Tooltip'
import { EmptyState } from '@/shared/ui/States'
import { Skeleton } from '@/shared/ui/Skeleton'
import { pct } from '@/shared/lib/format'
import type { PlayerMatch } from '@/shared/api/types'

const WINDOW = 10
const HEIGHT = 120
const PAD_X = 4
const PAD_Y = 10
const MIN_POINTS = 3

interface WinrateTrendProps {
  matches: PlayerMatch[]
  loading: boolean
}

export function WinrateTrend({ matches, loading }: WinrateTrendProps) {
  const gradientId = useId().replace(/:/g, '')
  const fillId = useId().replace(/:/g, '')
  const [width, setWidth] = useState(0)

  const points = useMemo(() => rollingWinrate(matches, WINDOW), [matches])

  if (loading) {
    return <Skeleton className="h-[120px] w-full rounded-panel" />
  }

  if (points.length < MIN_POINTS) {
    return (
      <EmptyState
        title="Пока рано считать тренд"
        hint={`Нужно от ${MIN_POINTS} матчей с известным исходом за период.`}
      />
    )
  }

  const innerHeight = HEIGHT - PAD_Y * 2
  const chartWidth = Math.max(width, 1)
  const step = points.length > 1 ? (chartWidth - PAD_X * 2) / (points.length - 1) : 0
  const coords = points.map((point, i) => ({
    x: PAD_X + step * i,
    y: PAD_Y + innerHeight * (1 - point.value),
    point,
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x.toFixed(2)} ${HEIGHT - PAD_Y} L ${coords[0]?.x.toFixed(2)} ${HEIGHT - PAD_Y} Z`

  return (
    <div
      ref={(node) => setWidth(node?.getBoundingClientRect().width ?? 0)}
      className="surface-panel flex flex-col gap-2 p-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <Tooltip
          variant="math"
          content={
            <MathTooltip
              formula={`побед / матчей с исходом в скользящем окне из ${WINDOW} игр`}
              inputs={[{ label: 'Размер окна', value: String(WINDOW) }]}
              note="Первые точки считаются по неполному окну, помечены полым маркером."
            />
          }
        >
          <h3 className="w-fit cursor-help border-b border-dashed border-line-2 pb-0.5 text-[13px] font-semibold text-ink">
            Тренд формы
          </h3>
        </Tooltip>
        <span className="text-[11px] text-ink-3">скользящее среднее по {WINDOW} матчам</span>
      </div>

      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${chartWidth} ${HEIGHT}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            {coords.map((c, i) => (
              <stop
                key={i}
                offset={points.length > 1 ? i / (points.length - 1) : 0}
                stopColor={winrateColor(c.point.value)}
              />
            ))}
          </linearGradient>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-hi)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-accent-hi)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={PAD_X} y1={PAD_Y + innerHeight / 2} x2={chartWidth - PAD_X} y2={PAD_Y + innerHeight / 2} stroke="var(--color-line)" strokeWidth={1} />

        <path d={areaPath} fill={`url(#${fillId})`} stroke="none" />
        <path d={linePath} fill="none" stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => (
          <TrendPoint key={i} x={c.x} y={c.y} point={c.point} />
        ))}
      </svg>

      <div className="flex justify-between text-[11px] text-ink-3">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>
    </div>
  )
}

interface TrendPointProps {
  x: number
  y: number
  point: { time: number; value: number; games: number; fullWindow: boolean }
}

function TrendPoint({ x, y, point }: TrendPointProps) {
  const color = winrateColor(point.value)
  const date = new Date(point.time * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

  return (
    <Tooltip
      content={
        <span>
          {date}: {pct(point.value, 0)}, окно {point.games} {point.fullWindow ? '' : '(неполное)'}
        </span>
      }
    >
      <circle
        cx={x}
        cy={y}
        r={3}
        fill={point.fullWindow ? color : 'var(--color-surface)'}
        stroke={color}
        strokeWidth={point.fullWindow ? 0 : 1.5}
        tabIndex={0}
        className="cursor-help"
      />
    </Tooltip>
  )
}
