import type { Hero } from '@/shared/api/types'
import type { TierRow } from '@/features/meta/tierlist'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { pct } from '@/shared/lib/format'

interface BanSuggestionsProps {
  rows: TierRow[]
  heroes: Map<number, Hero> | undefined
  onPick: (heroId: number) => void
}

export function BanSuggestions({ rows, heroes, onPick }: BanSuggestionsProps) {
  if (rows.length === 0) {
    return <EmptyState title="Нет данных меты" hint="Подождите загрузку heroStats." />
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((row) => {
        const hero = heroes?.get(row.heroId)
        return (
          <button
            key={row.heroId}
            type="button"
            onClick={() => onPick(row.heroId)}
            className="flex items-center gap-2.5 py-2 text-left transition-colors hover:bg-surface-2"
          >
            <HeroIcon hero={hero} size={24} link={false} />
            <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
            <span className="num ml-auto text-[13px] font-medium" style={{ color: winrateColor(row.winrate) }}>
              {pct(row.winrate, 0)}
            </span>
            <span className="num w-[56px] shrink-0 text-right text-[11px] text-ink-3">{row.games} игр</span>
          </button>
        )
      })}
    </div>
  )
}
