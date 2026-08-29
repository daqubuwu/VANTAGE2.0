import { Link } from 'react-router-dom'
import type { PlayerMatch } from '@/shared/api/types'
import { EmptyState } from '@/shared/ui/States'
import { ago, duration } from '@/shared/lib/format'

export function CommonMatchesList({ matches }: { matches: PlayerMatch[] }) {
  if (matches.length === 0) {
    return <EmptyState title="Общих матчей не нашли" hint="Сравнение смотрит последние 500 игр каждого." />
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {matches.slice(0, 20).map((match) => (
        <Link
          key={match.match_id}
          to={`/match/${match.match_id}`}
          className="flex items-center justify-between gap-3 py-2 text-[13px] transition-colors hover:bg-surface-2"
        >
          <span className="num text-ink">{match.match_id}</span>
          <span className="num text-ink-3">{duration(match.duration)}</span>
          <span className="text-ink-3">{ago(match.start_time)}</span>
        </Link>
      ))}
    </div>
  )
}
