import { Link } from 'react-router-dom'
import { useProMatches, useLiveMatches } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState, EmptyState } from '@/shared/ui/States'
import { ago, duration } from '@/shared/lib/format'

export function EsportsPage() {
  useDocumentTitle('Киберспорт')

  const live = useLiveMatches()
  const pro = useProMatches()

  return (
    <div className="flex flex-col gap-8">
      <Section title="Сейчас в эфире" aside="без оценки победителя - формула не согласована, честнее не гадать">
        {live.isPending ? (
          <SkeletonRows rows={4} height={44} />
        ) : live.isError ? (
          <ErrorState
            message={live.error instanceof Error ? live.error.message : 'Неизвестная ошибка'}
            onRetry={() => void live.refetch()}
          />
        ) : (live.data ?? []).length === 0 ? (
          <EmptyState title="Сейчас нет отслеживаемых матчей" hint="OpenDota показывает только часть про-трансляций." />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {(live.data ?? []).slice(0, 12).map((m) => (
              <div key={m.match_id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <span className="min-w-0 flex-1 truncate text-ink-2">
                  {m.team_name_radiant ?? 'Radiant'} vs {m.team_name_dire ?? 'Dire'}
                </span>
                <span className="num text-ink">
                  {m.radiant_score ?? 0}:{m.dire_score ?? 0}
                </span>
                <span className="num text-ink-3">{m.duration !== null ? duration(m.duration) : '-'}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Последние про-матчи">
        {pro.isPending ? (
          <SkeletonRows rows={8} height={44} />
        ) : pro.isError ? (
          <ErrorState
            message={pro.error instanceof Error ? pro.error.message : 'Неизвестная ошибка'}
            onRetry={() => void pro.refetch()}
          />
        ) : (pro.data ?? []).length === 0 ? (
          <EmptyState title="Нет данных о про-матчах" />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {(pro.data ?? []).slice(0, 30).map((m) => (
              <Link
                key={m.match_id}
                to={`/match/${m.match_id}`}
                className="flex items-center justify-between gap-3 py-2.5 text-[13px] transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1 truncate text-ink">
                  {m.radiant_name ?? 'Radiant'} vs {m.dire_name ?? 'Dire'}
                </span>
                <span className="num text-ink-3">
                  {m.radiant_score ?? 0}:{m.dire_score ?? 0}
                </span>
                <span className="num text-ink-3">{duration(m.duration)}</span>
                <span className="text-ink-3">{ago(m.start_time)}</span>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
