import type { ReactNode } from 'react'
import { Tooltip } from '@/shared/ui/Tooltip'

export interface StripCell {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: 'neutral' | 'win' | 'loss' | 'gold' | 'xp' | 'dmg'
  explain?: ReactNode
}

const TONE: Record<NonNullable<StripCell['tone']>, string> = {
  neutral: 'text-ink',
  win: 'text-win',
  loss: 'text-loss',
  gold: 'text-gold',
  xp: 'text-xp',
  dmg: 'text-dmg',
}

export function StatStrip({ cells }: { cells: StripCell[] }) {
  return (
    <div className="surface-panel grid grid-cols-2 divide-x divide-y divide-line p-0 sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
      {cells.map((cell) => {
        const value = (
          <span className={`num text-[26px] leading-none font-semibold ${TONE[cell.tone ?? 'neutral']}`}>
            {cell.value}
          </span>
        )
        return (
          <div key={cell.label} className="flex flex-col gap-2 px-5 py-4">
            <span className="text-[10px] tracking-[0.14em] text-ink-3 uppercase">{cell.label}</span>
            {cell.explain ? (
              <Tooltip content={cell.explain} variant="math">
                <span className="w-fit cursor-help border-b border-dashed border-line-2 pb-0.5">
                  {value}
                </span>
              </Tooltip>
            ) : (
              value
            )}
            {cell.sub && <span className="text-[12px] text-ink-3">{cell.sub}</span>}
          </div>
        )
      })}
    </div>
  )
}
