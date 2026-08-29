import { useEffect, useRef } from 'react'
import type { Hero, PlayerMatch } from '@/shared/api/types'
import { MatchRow } from './MatchRow'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/States'

interface MatchListProps {
  matches: PlayerMatch[]
  heroes: Map<number, Hero> | undefined
  loading?: boolean
}

export function MatchList({ matches, heroes, loading }: MatchListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[52px] w-full rounded-block" />
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return <EmptyState title="Матчей за период нет" hint="Выберите другой период." />
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {matches.map((match) => (
        <MatchRow key={match.match_id} match={match} hero={heroes?.get(match.hero_id)} />
      ))}
    </div>
  )
}

interface LoadMoreProps {
  hasMore: boolean
  loading: boolean
  onLoad: () => void
}

export function LoadMore({ hasMore, loading, onLoad }: LoadMoreProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || !hasMore || loading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoad()
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, onLoad])

  if (!hasMore) {
    return <p className="py-4 text-center text-[12px] text-ink-3">Вся доступная история загружена</p>
  }

  return (
    <div ref={ref} className="flex flex-col gap-1.5 py-2">
      {loading &&
        Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-[52px] w-full rounded-block" />
        ))}
    </div>
  )
}
