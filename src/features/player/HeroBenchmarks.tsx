import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { openDota } from '@/shared/api/opendota'
import { freshness } from '@/shared/cache/freshness'
import type { Hero, HeroBenchmarkResponse, PlayerHeroRow, PlayerMatch } from '@/shared/api/types'
import { aggregate } from './aggregate'
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
  matches: PlayerMatch[]
  heroes: Map<number, Hero> | undefined
  loading: boolean
}

export function HeroBenchmarks({ playerHeroes, matches, heroes, loading }: HeroBenchmarksProps) {
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

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-block" />
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
    <div className="flex flex-col divide-y divide-line">
      {top.map((row, index) => {
        const heroId = heroIds[index]
        const hero = heroId === undefined ? undefined : heroes?.get(heroId)
        const own = aggregate(matches.filter((match) => match.hero_id === heroId))
        const benchmark = benchmarkQueries[index]
        const pending = benchmark?.isPending ?? true
        const gpmMedian = medianValue(benchmark?.data?.result.gold_per_min)
        const xpmMedian = medianValue(benchmark?.data?.result.xp_per_min)

        return (
          <div key={row.hero_id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
            <span className="flex min-w-[160px] items-center gap-2.5">
              <HeroIcon hero={hero} size={28} />
              <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? '—'}</span>
            </span>

            <BenchmarkCell label="GPM" own={own.avgGpm} median={gpmMedian} pending={pending} />
            <BenchmarkCell label="XPM" own={own.avgXpm} median={xpmMedian} pending={pending} />
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
    <span className="flex min-w-[136px] items-center gap-2">
      <span className="text-[11px] text-ink-3">{label}</span>
      <span className="num text-[13px] text-ink">{num(own)}</span>
      {pending ? (
        <span className="text-[11px] text-ink-3">считаем</span>
      ) : median === null ? (
        <span className="text-[11px] text-ink-3">нет медианы</span>
      ) : (
        <Tooltip content={`Медиана по герою: ${num(median)}. OpenDota, все бракеты`} variant="hint">
          <span
            className={`num cursor-help text-[11px] ${(delta ?? 0) >= 0 ? 'text-win' : 'text-loss'}`}
          >
            {signedPct(delta)} к медиане
          </span>
        </Tooltip>
      )}
    </span>
  )
}
