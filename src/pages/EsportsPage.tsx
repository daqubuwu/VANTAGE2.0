import { Link } from 'react-router-dom'
import { useProMatches, useLiveMatches } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState, EmptyState } from '@/shared/ui/States'
import { TeamBadge } from '@/shared/ui/TeamBadge'
import { ago, duration } from '@/shared/lib/format'
import { Broadcast, Trophy, Eye, Clock, CaretRight } from '@phosphor-icons/react'

export function EsportsPage() {
  useDocumentTitle('Киберспорт')

  const live = useLiveMatches()
  const pro = useProMatches()

  return (
    <div className="flex flex-col gap-8">
      <Section title="Сейчас в эфире" aside="без оценки победителя - формула не согласована, честнее не гадать">
        {live.isPending ? (
          <SkeletonRows rows={4} height={64} />
        ) : live.isError ? (
          <ErrorState
            message={live.error instanceof Error ? live.error.message : 'Неизвестная ошибка'}
            onRetry={() => void live.refetch()}
          />
        ) : (live.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Broadcast size={28} />}
            title="Сейчас нет отслеживаемых матчей"
            hint="OpenDota показывает только часть про-трансляций."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {(live.data ?? []).slice(0, 12).map((m) => (
              <div key={m.match_id} className="surface-panel flex items-center gap-3 py-3">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-loss">
                  <Broadcast size={13} weight="fill" />
                  live
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <TeamBadge name={m.team_name_radiant} />
                  <span className="truncate text-[13px] text-ink-2">
                    {m.team_name_radiant ?? 'Radiant'}
                  </span>
                  <span className="num shrink-0 text-[13px] font-semibold text-ink">
                    {m.radiant_score ?? 0}:{m.dire_score ?? 0}
                  </span>
                  <span className="truncate text-[13px] text-ink-2">{m.team_name_dire ?? 'Dire'}</span>
                  <TeamBadge name={m.team_name_dire} />
                </span>
                <span className="hidden items-center gap-1 text-[11px] text-ink-3 sm:flex">
                  <Clock size={13} />
                  {m.duration !== null ? duration(m.duration) : '-'}
                </span>
                {m.spectators !== null && (
                  <span className="hidden items-center gap-1 text-[11px] text-ink-3 md:flex">
                    <Eye size={13} />
                    {m.spectators}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Последние про-матчи">
        {pro.isPending ? (
          <SkeletonRows rows={8} height={64} />
        ) : pro.isError ? (
          <ErrorState
            message={pro.error instanceof Error ? pro.error.message : 'Неизвестная ошибка'}
            onRetry={() => void pro.refetch()}
          />
        ) : (pro.data ?? []).length === 0 ? (
          <EmptyState icon={<Trophy size={28} />} title="Нет данных о про-матчах" />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {(pro.data ?? []).slice(0, 30).map((m) => {
              const radiantWon = m.radiant_win === true
              const direWon = m.radiant_win === false
              return (
                <Link
                  key={m.match_id}
                  to={`/match/${m.match_id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-2"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {m.league_name && (
                      <span className="flex items-center gap-1 truncate text-[11px] text-ink-3">
                        <Trophy size={12} />
                        {m.league_name}
                      </span>
                    )}
                    <span className="flex min-w-0 items-center gap-2">
                      <TeamBadge name={m.radiant_name} />
                      <span className={`truncate text-[13px] ${radiantWon ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                        {m.radiant_name ?? 'Radiant'}
                      </span>
                      <span className="num shrink-0 text-[13px] font-semibold text-ink">
                        {m.radiant_score ?? 0}:{m.dire_score ?? 0}
                      </span>
                      <span className={`truncate text-[13px] ${direWon ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                        {m.dire_name ?? 'Dire'}
                      </span>
                      <TeamBadge name={m.dire_name} />
                    </span>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1 text-[11px] text-ink-3 sm:flex">
                    <Clock size={13} />
                    {duration(m.duration)}
                  </span>
                  <span className="hidden shrink-0 text-[11px] text-ink-3 md:block">{ago(m.start_time)}</span>
                  <CaretRight size={14} className="shrink-0 text-ink-3" />
                </Link>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
