import type { Hero } from '@/shared/api/types'
import type { TierRow } from './tierlist'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { pct } from '@/shared/lib/format'

interface HeroGridProps {
  rows: TierRow[]
  heroes: Map<number, Hero> | undefined
}

export function HeroGrid({ rows, heroes }: HeroGridProps) {
  if (rows.length === 0) {
    return <EmptyState title="Нет данных за этот бракет" hint="Попробуйте другой бракет или про-сцену." />
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {rows.map((row) => {
        const hero = heroes?.get(row.heroId)
        return (
          <div key={row.heroId} className="surface-panel flex items-center gap-2.5">
            <HeroIcon hero={hero} size={32} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
              <span className="num text-[11px] text-ink-3">{row.games} игр</span>
            </div>
            <span
              className="num ml-auto shrink-0 text-[13px] font-semibold"
              style={{ color: winrateColor(row.winrate) }}
            >
              {pct(row.winrate, 0)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
