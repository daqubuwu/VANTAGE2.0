import type { Hero } from '@/shared/api/types'
import type { BestPickRow } from './bestPick'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { roleLabel } from '@/features/meta/heroRoles'
import { pct } from '@/shared/lib/format'

interface BestPickPanelProps {
  rows: BestPickRow[]
  heroes: Map<number, Hero> | undefined
  onPick: (heroId: number) => void
}

export function BestPickPanel({ rows, heroes, onPick }: BestPickPanelProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Пока не из чего считать"
        hint="Нужны данные меты или хотя бы один вражеский пик."
      />
    )
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((row, i) => {
        const hero = heroes?.get(row.heroId)
        return (
          <button
            key={row.heroId}
            type="button"
            onClick={() => onPick(row.heroId)}
            className="flex items-center gap-3 py-2.5 text-left transition-colors hover:bg-surface-2"
          >
            <span className="num w-4 shrink-0 text-[11px] text-ink-3">{i + 1}</span>
            <HeroIcon hero={hero} size={28} link={false} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
              <span className="truncate text-[11px] text-ink-3">
                {row.counterWinrate !== null && `контрпик ${pct(row.counterWinrate, 0)}`}
                {row.counterWinrate !== null && row.metaWinrate !== null && ' · '}
                {row.metaWinrate !== null && `мета ${pct(row.metaWinrate, 0)}`}
                {row.novelRoles.length > 0 && ` · закрывает ${row.novelRoles.map(roleLabel).join('/')}`}
              </span>
            </span>
            <span className="num shrink-0 text-[13px] font-semibold" style={{ color: winrateColor(row.score) }}>
              {pct(row.score, 0)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
