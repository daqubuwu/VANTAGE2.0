import type { Hero } from '@/shared/api/types'
import type { DraftMode } from './state'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { X } from '@phosphor-icons/react'

interface SlotProps {
  heroId: number | undefined
  heroes: Map<number, Hero> | undefined
  onRemove?: () => void
}

function Slot({ heroId, heroes, onRemove }: SlotProps) {
  const hero = heroId !== undefined ? heroes?.get(heroId) : undefined
  return (
    <div className="flex items-center gap-2 rounded-ctl border border-line-2 bg-surface px-2 py-1.5">
      <HeroIcon hero={hero} size={26} link={false} />
      <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{hero?.localized_name ?? 'пусто'}</span>
      {hero && onRemove && (
        <button type="button" onClick={onRemove} className="text-ink-3 transition-colors hover:text-loss">
          <X size={13} />
        </button>
      )}
    </div>
  )
}

interface DraftBoardProps {
  radiant: number[]
  dire: number[]
  bans: number[]
  heroes: Map<number, Hero> | undefined
  onRemove: (mode: DraftMode, heroId: number) => void
}

export function DraftBoard({ radiant, dire, bans, heroes, onRemove }: DraftBoardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-win">Radiant</span>
          {Array.from({ length: 5 }, (_, i) => {
            const heroId = radiant[i]
            return (
              <Slot
                key={i}
                heroId={heroId}
                heroes={heroes}
                onRemove={heroId !== undefined ? () => onRemove('radiant', heroId) : undefined}
              />
            )
          })}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-loss">Dire</span>
          {Array.from({ length: 5 }, (_, i) => {
            const heroId = dire[i]
            return (
              <Slot
                key={i}
                heroId={heroId}
                heroes={heroes}
                onRemove={heroId !== undefined ? () => onRemove('dire', heroId) : undefined}
              />
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-ink-2">Баны</span>
        {bans.length === 0 ? (
          <span className="text-[12px] text-ink-3">пусто</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {bans.map((heroId) => (
              <div key={heroId} className="w-[160px]">
                <Slot heroId={heroId} heroes={heroes} onRemove={() => onRemove('ban', heroId)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
