import { useId, useState } from 'react'
import { findTurningPoints } from './timeline'
import { Tooltip } from '@/shared/ui/Tooltip'
import { compact } from '@/shared/lib/format'

const HEIGHT = 140
const PAD_X = 4
const PAD_Y = 12

interface GoldTimelineProps {
  radiantGoldAdv: number[] | null
  minute: number | null
  onScrub?: (minute: number) => void
}

export function GoldTimeline({ radiantGoldAdv, minute }: GoldTimelineProps) {
  const gradientId = useId().replace(/:/g, '')
  const [width, setWidth] = useState(0)

  if (!radiantGoldAdv || radiantGoldAdv.length < 2) return null

  const turningPoints = findTurningPoints(radiantGoldAdv)
  const maxAbs = Math.max(1, ...radiantGoldAdv.map((v) => Math.abs(v)))
  const chartWidth = Math.max(width, 1)
  const innerHeight = HEIGHT - PAD_Y * 2
  const step = radiantGoldAdv.length > 1 ? (chartWidth - PAD_X * 2) / (radiantGoldAdv.length - 1) : 0
  const zeroY = PAD_Y + innerHeight / 2

  const coords = radiantGoldAdv.map((value, i) => ({
    x: PAD_X + step * i,
    y: zeroY - (value / maxAbs) * (innerHeight / 2),
    value,
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ')
  const lastX = coords[coords.length - 1]?.x ?? PAD_X
  const firstX = coords[0]?.x ?? PAD_X
  const areaPath = `${linePath} L ${lastX.toFixed(2)} ${zeroY} L ${firstX.toFixed(2)} ${zeroY} Z`

  const cursorX = minute !== null ? PAD_X + step * Math.min(minute, radiantGoldAdv.length - 1) : null

  return (
    <div
      ref={(node) => setWidth(node?.getBoundingClientRect().width ?? 0)}
      className="surface-panel flex flex-col gap-2 p-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[13px] font-semibold text-ink">Золото по минутам</h3>
        <span className="text-[11px] text-ink-3">выше нуля - Radiant, ниже - Dire</span>
      </div>

      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${chartWidth} ${HEIGHT}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-radiant)" stopOpacity="0.28" />
            <stop offset="50%" stopColor="var(--color-radiant)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-dire)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-dire)" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        <line x1={PAD_X} y1={zeroY} x2={chartWidth - PAD_X} y2={zeroY} stroke="var(--color-line)" strokeWidth={1} />
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        {turningPoints.map((point) => {
          const coord = coords[point.minute]
          if (!coord) return null
          return (
            <Tooltip
              key={point.minute}
              content={
                <span>
                  {point.minute} мин: {point.kind === 'flip' ? 'смена лидера' : 'резкий отрыв'},{' '}
                  {compact(Math.abs(point.advantage))} золота у {point.advantage >= 0 ? 'Radiant' : 'Dire'}
                </span>
              }
            >
              <circle cx={coord.x} cy={coord.y} r={3.5} fill="var(--color-warm)" tabIndex={0} className="cursor-help" />
            </Tooltip>
          )
        })}

        {cursorX !== null && (
          <line x1={cursorX} y1={PAD_Y} x2={cursorX} y2={HEIGHT - PAD_Y} stroke="var(--color-ink-3)" strokeWidth={1} strokeDasharray="3 3" />
        )}
      </svg>
    </div>
  )
}
