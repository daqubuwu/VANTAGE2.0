import { useMemo, useState } from 'react'
import type { Hero } from '@/shared/api/types'
import type { HeroRow } from './heroAggregate'
import type { PlayerAggregate } from './aggregate'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { Bar } from '@/shared/ui/Stat'
import { EmptyState } from '@/shared/ui/States'
import { compact, dec, num, pct } from '@/shared/lib/format'
import { CaretUp, CaretDown } from '@phosphor-icons/react'

interface PlayerHeroesTableProps {
  rows: HeroRow[]
  summary: PlayerAggregate
  heroes: Map<number, Hero> | undefined
  onSelectHero: (heroId: number) => void
}

type SortKey = 'name' | 'games' | 'winrate' | 'avgKda' | 'avgGpm' | 'avgHeroDamage'

const HEADERS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Герой' },
  { key: 'games', label: 'Игры' },
  { key: 'winrate', label: 'WR' },
  { key: 'avgKda', label: 'KDA' },
  { key: 'avgGpm', label: 'GPM' },
  { key: 'avgHeroDamage', label: 'Урон' },
]

export function PlayerHeroesTable({ rows, summary, heroes, onSelectHero }: PlayerHeroesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('games')
  const [desc, setDesc] = useState(true)

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      let diff = 0
      if (sortKey === 'name') {
        const nameA = heroes?.get(a.heroId)?.localized_name ?? ''
        const nameB = heroes?.get(b.heroId)?.localized_name ?? ''
        diff = nameA.localeCompare(nameB)
      } else {
        diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
      }
      return desc ? -diff : diff
    })
    return copy
  }, [rows, sortKey, desc, heroes])

  if (rows.length === 0) {
    return <EmptyState title="Нет матчей под эти фильтры" hint="Попробуйте другой период или роль." />
  }

  const maxGames = Math.max(...rows.map((row) => row.games))

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDesc((v) => !v)
    } else {
      setSortKey(key)
      setDesc(true)
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col min-w-[560px]">
        <div className="grid grid-cols-[minmax(0,1fr)_100px_64px_64px_64px_72px] items-center gap-3 border-b border-line px-3 pb-2 text-[11px] text-ink-3">
          {HEADERS.map((header) => (
            <button
              key={header.key}
              type="button"
              onClick={() => toggleSort(header.key)}
              className={`inline-flex items-center gap-1 transition-colors hover:text-ink ${
                header.key === 'name' ? 'justify-start' : 'justify-end'
              } ${sortKey === header.key ? 'text-ink' : ''}`}
            >
              {header.key !== 'name' && sortKey === header.key && (desc ? <CaretDown size={11} /> : <CaretUp size={11} />)}
              {header.label}
              {header.key === 'name' && sortKey === header.key && (desc ? <CaretDown size={11} /> : <CaretUp size={11} />)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_100px_64px_64px_64px_72px] items-center gap-3 border-b border-line-2 bg-surface-2/40 px-3 py-2.5">
          <span className="text-[13px] font-semibold text-ink">Итого по фильтру</span>
          <span className="num text-right text-[13px] text-ink">{num(summary.games)}</span>
          <span
            className={`num text-right text-[13px] font-medium ${(summary.winrate ?? 0) >= 0.5 ? 'text-win' : 'text-loss'}`}
          >
            {pct(summary.winrate, 0)}
          </span>
          <span className="num text-right text-[13px] text-ink">{dec(summary.avgKda, 2)}</span>
          <span className="num text-right text-[13px] text-gold">{num(summary.avgGpm)}</span>
          <span className="num text-right text-[13px] text-dmg">{compact(summary.avgHeroDamage)}</span>
        </div>

        <div className="flex flex-col divide-y divide-line">
          {sorted.map((row) => {
            const hero = heroes?.get(row.heroId)
            return (
              <button
                key={row.heroId}
                type="button"
                onClick={() => onSelectHero(row.heroId)}
                className="grid grid-cols-[minmax(0,1fr)_100px_64px_64px_64px_72px] items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <HeroIcon hero={hero} size={26} link={false} />
                  <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
                </span>
                <span className="flex items-center justify-end gap-2">
                  <span className="w-14">
                    <Bar value={row.games} max={maxGames} tone="var(--color-accent-mark)" />
                  </span>
                  <span className="num w-6 shrink-0 text-right text-[12px] text-ink-3">{row.games}</span>
                </span>
                <span
                  className={`num text-right text-[13px] font-medium ${(row.winrate ?? 0) >= 0.5 ? 'text-win' : 'text-loss'}`}
                >
                  {pct(row.winrate, 0)}
                </span>
                <span className="num text-right text-[13px] text-ink">{dec(row.avgKda, 2)}</span>
                <span className="num text-right text-[13px] text-gold">{num(row.avgGpm)}</span>
                <span className="num text-right text-[13px] text-dmg">{compact(row.avgHeroDamage)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
