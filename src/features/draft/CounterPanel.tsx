import type { Hero } from '@/shared/api/types'
import type { CounterSuggestion } from './counters'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { pct } from '@/shared/lib/format'

interface CounterPanelProps {
  title: string
  rows: CounterSuggestion[]
  heroes: Map<number, Hero> | undefined
  onPick: (heroId: number) => void
}

export function CounterPanel({ title, rows, heroes, onPick }: CounterPanelProps) {
  return (
    <div className="surface-panel flex flex-col gap-2 p-4">
      <span className="text-[12px] font-medium text-ink-2">{title}</span>
      {rows.length === 0 ? (
        <EmptyState title="Пока нет вражеских пиков" hint="Добавьте героя в соперника, появятся рекомендации." />
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {rows.map((row) => {
            const hero = heroes?.get(row.heroId)
            const impliedWinrate = 1 - row.avgEnemyWinrate
            return (
              <button
                key={row.heroId}
                type="button"
                onClick={() => onPick(row.heroId)}
                className="flex items-center gap-2.5 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <HeroIcon hero={hero} size={24} link={false} />
                <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
                <span
                  className="num ml-auto text-[13px] font-medium"
                  style={{ color: winrateColor(impliedWinrate) }}
                >
                  {pct(impliedWinrate, 0)}
                </span>
                <span className="num w-[76px] shrink-0 text-right text-[11px] text-ink-3">{row.samples} матчапов</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
