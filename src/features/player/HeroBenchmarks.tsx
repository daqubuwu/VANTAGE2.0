import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { openDota } from '@/shared/api/opendota'
import { freshness } from '@/shared/cache/freshness'
import type { Hero, HeroBenchmarkResponse, PlayerHeroRow, PlayerTotalsField } from '@/shared/api/types'
import { totalsMean } from './totals'
import { deltaShare, medianValue } from './benchmark'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/States'
import { Tooltip } from '@/shared/ui/Tooltip'
import { num, signedPct } from '@/shared/lib/format'

const LIMIT = 4
const MIN_GAMES = 5

interface HeroBenchmarksProps {
  playerHeroes: PlayerHeroRow[]
  accountId: number | undefined
  heroes: Map<number, Hero> | undefined
  loading: boolean
}

export function HeroBenchmarks({ playerHeroes, accountId, heroes, loading }: HeroBenchmarksProps) {
  const top = useMemo(
    () =>
      [...playerHeroes]
        .filter((row) => row.games >= MIN_GAMES)
        .sort((a, b) => b.games - a.games)
        .slice(0, LIMIT),
    [playerHeroes],
  )

  const heroIds = top.map((row) => Number(row.hero_id))

  const benchmarkQueries = useQueries({
    queries: heroIds.map((heroId) => ({
      queryKey: ['heroBenchmark', heroId],
      queryFn: () => openDota.benchmarks(heroId) as Promise<HeroBenchmarkResponse>,
      staleTime: freshness.meta.staleTime,
      gcTime: freshness.meta.gcTime,
      meta: { persist: freshness.meta.persist },
    })),
  })

  const ownTotalsQueries = useQueries({
    queries: heroIds.map((heroId) => ({
      queryKey: ['player', accountId, 'totals', null, heroId],
      queryFn: () =>
        openDota.playerTotals(accountId as number, { hero_id: heroId }) as Promise<PlayerTotalsField[]>,
      enabled: accountId !== undefined && Number.isFinite(accountId),
      staleTime: freshness.playerMatches.staleTime,
      gcTime: freshness.playerMatches.gcTime,
      meta: { persist: freshness.playerMatches.persist },
    })),
  })

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-panel" />
        ))}
      </div>
    )
  }

  if (top.length === 0) {
    return (
      <EmptyState
        title="Недостаточно игр для сравнения"
        hint={`Нужно от ${MIN_GAMES} матчей на герое.`}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {top.map((row, index) => {
        const heroId = heroIds[index]
        const hero = heroId === undefined ? undefined : heroes?.get(heroId)
        const benchmark = benchmarkQueries[index]
        const ownTotals = ownTotalsQueries[index]
        const pending = (benchmark?.isPending ?? true) || (ownTotals?.isPending ?? true)
        const gpmMedian = medianValue(benchmark?.data?.result.gold_per_min)
        const xpmMedian = medianValue(benchmark?.data?.result.xp_per_min)
        const ownGpm = totalsMean(ownTotals?.data, 'gold_per_min')
        const ownXpm = totalsMean(ownTotals?.data, 'xp_per_min')

        return (
          <div key={row.hero_id} className="surface-panel surface-interactive flex aspect-square flex-col justify-between gap-2 p-3.5">
            <span className="flex items-center gap-2">
              <HeroIcon hero={hero} size={26} />
              <span className="min-w-0 truncate text-[12px] text-ink">{hero?.localized_name ?? '—'}</span>
            </span>

            <div className="flex flex-col gap-1.5">
              <BenchmarkCell label="GPM" own={ownGpm} median={gpmMedian} pending={pending} />
              <BenchmarkCell label="XPM" own={ownXpm} median={xpmMedian} pending={pending} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface BenchmarkCellProps {
  label: string
  own: number | null
  median: number | null
  pending: boolean
}

function BenchmarkCell({ label, own, median, pending }: BenchmarkCellProps) {
  const delta = deltaShare(own, median)

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-baseline gap-1.5">
        <span className="text-[11px] text-ink-3">{label}</span>
        <span className="num text-[13px] text-ink">{num(own)}</span>
      </span>
      {pending ? (
        <span className="text-[11px] text-ink-3">считаем</span>
      ) : median === null ? (
        <span className="text-[11px] text-ink-3">нет медианы</span>
      ) : (
        <Tooltip content={`Медиана по герою: ${num(median)}. OpenDota, все бракеты`} variant="hint">
          <span
            className={`num cursor-help text-[11px] ${(delta ?? 0) >= 0 ? 'text-win' : 'text-loss'}`}
          >
            {signedPct(delta)}
          </span>
        </Tooltip>
      )}
    </div>
  )
}
