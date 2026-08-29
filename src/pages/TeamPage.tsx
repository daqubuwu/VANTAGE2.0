import { useParams, Link } from 'react-router-dom'
import { useTeam, useTeamMatches, useTeamPlayers, useTeamHeroes, useHeroes } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { Skeleton, SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState, EmptyState } from '@/shared/ui/States'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { ago, duration, pct } from '@/shared/lib/format'
import { UsersThree } from '@phosphor-icons/react'

export function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const teamId = Number(id)
  const valid = Number.isFinite(teamId) && teamId > 0

  const team = useTeam(valid ? teamId : undefined)
  const matches = useTeamMatches(valid ? teamId : undefined)
  const players = useTeamPlayers(valid ? teamId : undefined)
  const heroPicks = useTeamHeroes(valid ? teamId : undefined)
  const heroes = useHeroes()

  useDocumentTitle(team.data?.name ?? 'Команда')

  if (!valid) {
    return <EmptyState icon={<UsersThree size={28} />} title="Команда не найдена" hint="Проверьте ссылку." />
  }

  if (team.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[72px] w-full rounded-panel" />
        <SkeletonRows rows={5} height={48} />
      </div>
    )
  }

  if (team.isError) {
    return (
      <ErrorState
        message={team.error instanceof Error ? team.error.message : 'Неизвестная ошибка'}
        onRetry={() => void team.refetch()}
      />
    )
  }

  if (!team.data) {
    return <EmptyState icon={<UsersThree size={28} />} title="Команда не найдена" />
  }

  const totalGames = team.data.wins + team.data.losses
  const winrate = totalGames > 0 ? team.data.wins / totalGames : null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-ctl bg-surface-2">
          {team.data.logo_url && (
            <img src={team.data.logo_url} alt={team.data.name} className="h-full w-full object-cover" loading="lazy" />
          )}
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] font-semibold text-ink">{team.data.name}</h1>
          <span className="num text-[12px] text-ink-3">
            {team.data.wins} побед, {team.data.losses} поражений
            {winrate !== null ? `, ${pct(winrate, 0)}` : ''}
          </span>
        </div>
      </div>

      <Section title="Состав">
        {players.isPending ? (
          <SkeletonRows rows={5} height={40} />
        ) : players.isError ? (
          <ErrorState
            message={players.error instanceof Error ? players.error.message : 'Неизвестная ошибка'}
            onRetry={() => void players.refetch()}
          />
        ) : (players.data ?? []).filter((p) => p.is_current_team_member).length === 0 ? (
          <EmptyState title="Текущий состав не размечен" hint="OpenDota не пометил активных игроков этой команды." />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {(players.data ?? [])
              .filter((p) => p.is_current_team_member)
              .map((p) => (
                <Link
                  key={p.account_id}
                  to={`/player/${p.account_id}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-surface-2"
                >
                  <span className="text-[13px] text-ink">{p.name ?? `Аккаунт ${p.account_id}`}</span>
                  <span className="num text-[12px] text-ink-3">
                    {p.games_played} игр, {pct(p.games_played > 0 ? p.wins / p.games_played : 0, 0)}
                  </span>
                </Link>
              ))}
          </div>
        )}
      </Section>

      <Section title="Пул героев">
        {heroPicks.isPending ? (
          <SkeletonRows rows={5} height={32} />
        ) : heroPicks.isError ? (
          <ErrorState
            message={heroPicks.error instanceof Error ? heroPicks.error.message : 'Неизвестная ошибка'}
            onRetry={() => void heroPicks.refetch()}
          />
        ) : (heroPicks.data ?? []).length === 0 ? (
          <EmptyState title="Нет данных по пулу героев" />
        ) : (
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
            {[...(heroPicks.data ?? [])]
              .sort((rowA, rowB) => rowB.games_played - rowA.games_played)
              .slice(0, 12)
              .map((row) => (
                <div key={row.hero_id} className="flex items-center gap-2 rounded-ctl px-2 py-1.5">
                  <HeroIcon hero={heroes.data?.get(row.hero_id)} size={24} link={false} />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-ink-2">
                    {heroes.data?.get(row.hero_id)?.localized_name ?? row.hero_id}
                  </span>
                  <span className="num text-[11px] text-ink-3">{row.games_played}</span>
                </div>
              ))}
          </div>
        )}
      </Section>

      <Section title="Последние матчи">
        {matches.isPending ? (
          <SkeletonRows rows={6} height={36} />
        ) : matches.isError ? (
          <ErrorState
            message={matches.error instanceof Error ? matches.error.message : 'Неизвестная ошибка'}
            onRetry={() => void matches.refetch()}
          />
        ) : (matches.data ?? []).length === 0 ? (
          <EmptyState title="Нет истории матчей" />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {(matches.data ?? []).slice(0, 20).map((m) => {
              const won = m.radiant === m.radiant_win
              return (
                <Link
                  key={m.match_id}
                  to={`/match/${m.match_id}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-surface-2"
                >
                  <span className={`text-[12px] font-medium ${won ? 'text-win' : 'text-loss'}`}>
                    {won ? 'Победа' : 'Поражение'}
                  </span>
                  <span className="truncate text-[13px] text-ink-2">{m.opposing_team_name ?? 'соперник неизвестен'}</span>
                  <span className="num text-[12px] text-ink-3">{duration(m.duration)}</span>
                  <span className="text-[12px] text-ink-3">{ago(m.start_time)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
