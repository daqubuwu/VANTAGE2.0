import type { Hero } from '@/shared/api/types'
import type { RankedMatchup } from './matchups'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { pct } from '@/shared/lib/format'

interface HeroMatchupsProps {
  best: RankedMatchup[]
  worst: RankedMatchup[]
  heroes: Map<number, Hero> | undefined
}

export function HeroMatchups({ best, worst, heroes }: HeroMatchupsProps) {
  if (best.length === 0 && worst.length === 0) {
    return (
      <EmptyState
        title="Недостаточно данных по матчапам"
        hint={`Нужно минимум ${20} игр против героя, чтобы попасть в список.`}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <MatchupColumn title="Сильнее против" rows={best} heroes={heroes} />
      <MatchupColumn title="Слабее против" rows={worst} heroes={heroes} />
    </div>
  )
}

interface MatchupColumnProps {
  title: string
  rows: RankedMatchup[]
  heroes: Map<number, Hero> | undefined
}

function MatchupColumn({ title, rows, heroes }: MatchupColumnProps) {
  return (
    <div className="surface-panel flex flex-col gap-2">
      <span className="text-[12px] font-medium text-ink-2">{title}</span>
      {rows.length === 0 ? (
        <span className="text-[12px] text-ink-3">недостаточно игр</span>
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {rows.map((row) => {
            const hero = heroes?.get(row.heroId)
            return (
              <div key={row.heroId} className="flex items-center gap-2.5 py-2">
                <HeroIcon hero={hero} size={24} />
                <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
                <span className="num ml-auto text-[13px] font-medium" style={{ color: winrateColor(row.winrate) }}>
                  {pct(row.winrate, 0)}
                </span>
                <span className="num w-[56px] shrink-0 text-right text-[11px] text-ink-3">{row.games} игр</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
