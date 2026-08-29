import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  usePlayer,
  usePlayerMatches,
  usePlayerHistory,
  useHeroes,
  usePlayerHeroes,
  HISTORY_SIZE,
} from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { PlayerHeader } from '@/features/player/PlayerHeader'
import { PeriodFilter } from '@/features/player/PeriodFilter'
import { StatStrip } from '@/features/player/StatStrip'
import { ActivityGraph } from '@/features/player/ActivityGraph'
import { MatchList, LoadMore } from '@/features/player/MatchList'
import { TopHeroes } from '@/features/player/TopHeroes'
import { Tabs } from '@/features/player/Tabs'
import { aggregate } from '@/features/player/aggregate'
import { withinPeriod, periodLabel } from '@/features/player/period'
import type { PeriodKey } from '@/features/player/period'
import { Section } from '@/shared/ui/Surface'
import { Skeleton } from '@/shared/ui/Skeleton'
import { ErrorState } from '@/shared/ui/States'
import { MathTooltip } from '@/shared/ui/Tooltip'
import { dec, num, pct, plural } from '@/shared/lib/format'

const OVERVIEW_MATCHES = 20

type TabKey = 'overview' | 'matches' | 'heroes'

export function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const accountId = Number(id)
  const valid = Number.isFinite(accountId) && accountId > 0

  const [period, setPeriod] = useState<PeriodKey>('month')
  const [tab, setTab] = useState<TabKey>('overview')

  const profile = usePlayer(valid ? accountId : undefined)
  const history = usePlayerHistory(valid ? accountId : undefined)
  const paged = usePlayerMatches(valid ? accountId : undefined)
  const heroes = useHeroes()
  const playerHeroes = usePlayerHeroes(valid ? accountId : undefined)

  useDocumentTitle(
    profile.data?.profile?.personaname ?? (valid ? `Игрок ${accountId}` : 'Игрок'),
  )

  const all = useMemo(() => history.data ?? [], [history.data])
  const scoped = useMemo(() => withinPeriod(all, period), [all, period])
  const stats = useMemo(() => aggregate(scoped), [scoped])
  const timestamps = useMemo(() => all.map((match) => match.start_time), [all])
  const pagedFlat = useMemo(() => paged.data?.pages.flat() ?? [], [paged.data])

  if (!valid) {
    return <ErrorState message="Некорректный идентификатор игрока в адресе страницы." />
  }

  if (profile.isError) {
    return (
      <ErrorState
        message={profile.error instanceof Error ? profile.error.message : 'Неизвестная ошибка'}
        onRetry={() => void profile.refetch()}
      />
    )
  }

  const hours = stats.totalDuration / 3600
  const deathsPerMatch = stats.avgDeaths

  return (
    <div className="flex flex-col gap-6">
      <PlayerHeader accountId={accountId} profile={profile.data} loading={profile.isPending} />

      <Tabs
        tabs={[
          { key: 'overview' as const, label: 'Обзор' },
          { key: 'matches' as const, label: 'Матчи' },
          { key: 'heroes' as const, label: 'Герои' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="flex flex-col gap-6">
          <PeriodFilter value={period} onChange={setPeriod} />

          {history.isPending ? (
            <Skeleton className="h-[118px] w-full rounded-panel" />
          ) : history.isError ? (
            <ErrorState
              message={history.error instanceof Error ? history.error.message : 'Неизвестная ошибка'}
              onRetry={() => void history.refetch()}
            />
          ) : (
            <StatStrip
              cells={[
                {
                  label: 'Винрейт',
                  value: pct(stats.winrate, 1),
                  sub: `${stats.wins} и ${stats.games - stats.wins}`,
                  tone: (stats.winrate ?? 0) >= 0.5 ? 'win' : 'loss',
                  explain: (
                    <MathTooltip
                      formula="победы / матчи с известным исходом"
                      inputs={[
                        { label: 'Побед', value: String(stats.wins) },
                        { label: 'Поражений', value: String(stats.games - stats.wins) },
                      ]}
                      note={`Период: ${periodLabel(period)}.`}
                    />
                  ),
                },
                {
                  label: 'Матчей',
                  value: num(stats.games),
                  sub: `${num(hours)} ${plural(Math.round(hours), 'час', 'часа', 'часов')}`,
                },
                {
                  label: 'KDA',
                  value: dec(stats.avgKda, 2),
                  sub: `${dec(deathsPerMatch, 1)} смертей за матч`,
                  explain: (
                    <MathTooltip
                      formula="(убийства + помощи) / смерти"
                      inputs={[
                        { label: 'Убийств в среднем', value: dec(stats.avgKills, 2) },
                        { label: 'Смертей в среднем', value: dec(stats.avgDeaths, 2) },
                        { label: 'Помощей в среднем', value: dec(stats.avgAssists, 2) },
                      ]}
                      note="Знаменатель не опускается ниже единицы."
                    />
                  ),
                },
                { label: 'GPM', value: num(stats.avgGpm), sub: 'золото в минуту', tone: 'gold' },
                { label: 'XPM', value: num(stats.avgXpm), sub: 'опыт в минуту', tone: 'xp' },
              ]}
            />
          )}

          {history.isPending ? (
            <Skeleton className="h-[190px] w-full rounded-panel" />
          ) : (
            <ActivityGraph timestamps={timestamps} />
          )}

          {stats.games > 0 && (
            <p className="text-[12px] text-ink-3">
              OpenDota разобрал {stats.parsedCount} из {stats.games}{' '}
              {plural(stats.games, 'матча', 'матчей', 'матчей')} за период. У остальных нет таймингов
              предметов и данных по линии.
            </p>
          )}

          <Section
            title="Последние матчи"
            aside={`${OVERVIEW_MATCHES} последних, остальное на вкладке «Матчи»`}
          >
            <MatchList
              matches={all.slice(0, OVERVIEW_MATCHES)}
              heroes={heroes.data}
              loading={history.isPending}
            />
          </Section>

          <Section title="Лучшие герои" aside="от 3 игр">
            <TopHeroes
              rows={playerHeroes.data ?? []}
              heroes={heroes.data}
              loading={playerHeroes.isPending}
            />
          </Section>
        </div>
      )}

      {tab === 'matches' && (
        <Section title="Все матчи" aside={`история до ${HISTORY_SIZE} последних игр`}>
          {paged.isError ? (
            <ErrorState
              message={paged.error instanceof Error ? paged.error.message : 'Неизвестная ошибка'}
              onRetry={() => void paged.refetch()}
            />
          ) : (
            <>
              <MatchList matches={pagedFlat} heroes={heroes.data} loading={paged.isPending} />
              <LoadMore
                hasMore={paged.hasNextPage}
                loading={paged.isFetchingNextPage}
                onLoad={() => void paged.fetchNextPage()}
              />
            </>
          )}
        </Section>
      )}

      {tab === 'heroes' && (
        <Section title="Герои" aside="по числу игр">
          <TopHeroes
            rows={playerHeroes.data ?? []}
            heroes={heroes.data}
            loading={playerHeroes.isPending}
            limit={40}
            minGames={1}
          />
        </Section>
      )}
    </div>
  )
}
