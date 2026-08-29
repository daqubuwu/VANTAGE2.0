import type { ReactNode } from 'react'
import { Tooltip } from './Tooltip'

export interface StripCell {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: 'neutral' | 'win' | 'loss' | 'gold' | 'xp' | 'dmg' | 'heal' | 'vision'
  explain?: ReactNode
}

const TONE: Record<NonNullable<StripCell['tone']>, string> = {
  neutral: 'text-ink',
  win: 'text-win',
  loss: 'text-loss',
  gold: 'text-gold',
  xp: 'text-xp',
  dmg: 'text-dmg',
  heal: 'text-heal',
  vision: 'text-vision',
}

export function Stat({ label, value, sub, tone = 'neutral', explain }: StripCell) {
  const valueNode = (
    <span className={`num text-[22px] leading-none font-semibold ${TONE[tone]}`}>{value}</span>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-ink-3">{label}</span>
      {explain ? (
        <Tooltip content={explain} variant="math">
          <span className="w-fit cursor-help border-b border-dashed border-line-2 pb-0.5">
            {valueNode}
          </span>
        </Tooltip>
      ) : (
        valueNode
      )}
      {sub && <span className="text-[11px] text-ink-3">{sub}</span>}
    </div>
  )
}

interface BarProps {
  value: number
  max?: number
  tone?: string
  label?: ReactNode
}

export function Bar({ value, max = 1, tone = 'var(--color-accent)', label }: BarProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-200"
          style={{ width: `${ratio * 100}%`, background: tone }}
        />
      </div>
      {label && <span className="num shrink-0 text-[12px] text-ink-2">{label}</span>}
    </div>
  )
}
