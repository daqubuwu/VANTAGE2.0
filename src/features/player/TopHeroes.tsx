import { useMemo } from 'react'
import type { Hero } from '@/shared/api/types'
import type { HeroRow } from './heroAggregate'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { Bar } from '@/shared/ui/Stat'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/States'
import { pct } from '@/shared/lib/format'

interface TopHeroesProps {
  rows: HeroRow[]
  heroes: Map<number, Hero> | undefined
  loading: boolean
  limit?: number
  minGames?: number
}

export function TopHeroes({ rows, heroes, loading, limit = 8, minGames = 3 }: TopHeroesProps) {
  const top = useMemo(
    () =>
      [...rows]
        .filter((row) => row.games >= minGames)
        .sort((a, b) => b.games - a.games)
        .slice(0, limit),
    [rows, limit, minGames],
  )

  if (loading) {
    return (
      <div className="grid gap-2 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-block" />
        ))}
      </div>
    )
  }

  if (top.length === 0) {
    return <EmptyState title="Нет героев с достаточным числом игр" hint={`Нужно от ${minGames} матчей на герое.`} />
  }

  const maxGames = Math.max(...top.map((row) => row.games))

  return (
    <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">
      {top.map((row) => {
        const hero = heroes?.get(row.heroId)
        const winrate = row.winrate ?? 0
        return (
          <div key={row.heroId} className="flex items-center gap-3 py-1.5">
            <HeroIcon hero={hero} size={26} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
              {hero?.localized_name ?? '—'}
            </span>
            <span className="w-28">
              <Bar
                value={row.games}
                max={maxGames}
                tone="var(--color-accent-mark)"
                label={String(row.games)}
              />
            </span>
            <span className={`num w-14 text-right text-[13px] ${winrate >= 0.5 ? 'text-win' : 'text-loss'}`}>
              {pct(winrate, 0)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
