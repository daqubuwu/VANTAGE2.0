import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  usePlayer,
  usePlayerMatches,
  usePlayerHistory,
  usePlayerTotals,
  useHeroes,
  usePlayerHeroes,
  useStratzStatus,
  usePlayerRoleMatches,
  HISTORY_SIZE,
} from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { PlayerHeader } from '@/features/player/PlayerHeader'
import { PeriodFilter } from '@/features/player/PeriodFilter'
import { StatStrip } from '@/features/player/StatStrip'
import { ActivityGraph } from '@/features/player/ActivityGraph'
import { WinrateTrend } from '@/features/player/WinrateTrend'
import { MatchList, LoadMore } from '@/features/player/MatchList'
import { MatchFilters } from '@/features/player/MatchFilters'
import { TopHeroes } from '@/features/player/TopHeroes'
import { HeroBenchmarks } from '@/features/player/HeroBenchmarks'
import { Tabs } from '@/features/player/Tabs'
import { usePlayerStats } from '@/features/player/usePlayerStats'
import { totalsCount, totalsMean } from '@/features/player/totals'
import { periodDays, periodLabel } from '@/features/player/period'
import type { PeriodKey } from '@/features/player/period'
import { buildMatchPositions } from '@/features/player/matchPositions'
import type { RoleKey } from '@/features/player/roles'
import { scopeMatches, buildHeroRows } from '@/features/player/heroAggregate'
import { aggregate } from '@/features/player/aggregate'
import { PlayerHeroesTable } from '@/features/player/PlayerHeroesTable'
import { RolePills } from '@/features/player/RolePills'
import { Section } from '@/shared/ui/Surface'
import { Skeleton } from '@/shared/ui/Skeleton'
import { ErrorState } from '@/shared/ui/States'
import { MathTooltip } from '@/shared/ui/Tooltip'
import { compact, dec, duration, num, pct, plural } from '@/shared/lib/format'
import { isRadiantSlot } from '@/shared/api/types'

const OVERVIEW_MATCHES = 20

type TabKey = 'overview' | 'matches' | 'heroes'

export function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const accountId = Number(id)
  const valid = Number.isFinite(accountId) && accountId > 0

  const [period, setPeriod] = useState<PeriodKey>('month')
  const [tab, setTab] = useState<TabKey>('overview')
  const [matchesTabOpened, setMatchesTabOpened] = useState(false)
  const [filters, setFilters] = useState<{ heroId: number | null; outcome: 'all' | 'win' | 'loss'; role: RoleKey | null }>({
    heroId: null,
    outcome: 'all',
    role: null,
  })
  const [heroesPeriod, setHeroesPeriod] = useState<PeriodKey>('all')
  const [heroesRole, setHeroesRole] = useState<RoleKey | null>(null)

  useEffect(() => {
    if (tab === 'matches') setMatchesTabOpened(true)
  }, [tab])

  const profile = usePlayer(valid ? accountId : undefined)
  const history = usePlayerHistory(valid ? accountId : undefined)
  const totals = usePlayerTotals(valid ? accountId : undefined, periodDays(period))
  const heroes = useHeroes()
  const playerHeroes = usePlayerHeroes(valid ? accountId : undefined)
  const paged = usePlayerMatches(matchesTabOpened && valid ? accountId : undefined)
  const stratzStatus = useStratzStatus()
  const stratzOk = stratzStatus.data === true
  const roleMatches = usePlayerRoleMatches(valid ? accountId : undefined, null, stratzOk)
  const matchPositions = useMemo(() => buildMatchPositions(roleMatches.data), [roleMatches.data])

  useDocumentTitle(
    profile.data?.profile?.personaname ?? (valid ? `Игрок ${accountId}` : 'Игрок'),
  )

  const all = useMemo(() => history.data ?? [], [history.data])
  const stats = usePlayerStats(all, period)
  const activityMatches = useMemo(
    () =>
      all.map((match) => ({
        time: match.start_time,
        win: match.radiant_win === null ? null : match.radiant_win === isRadiantSlot(match.player_slot),
      })),
    [all],
  )
  const pagedFlat = useMemo(() => paged.data?.pages.flat() ?? [], [paged.data])

  const filteredMatches = useMemo(() => {
    return pagedFlat.filter((match) => {
      if (filters.heroId !== null && match.hero_id !== filters.heroId) return false
      if (filters.outcome !== 'all') {
        const win = match.radiant_win === null ? null : match.radiant_win === isRadiantSlot(match.player_slot)
        if (filters.outcome === 'win' && win !== true) return false
        if (filters.outcome === 'loss' && win !== false) return false
      }
      if (filters.role !== null) {
        const position = matchPositions.get(match.match_id)
        if (!position || position.role !== filters.role) return false
      }
      return true
    })
  }, [pagedFlat, filters, matchPositions])

  const heroesScope = useMemo(
    () => scopeMatches(all, heroesPeriod, heroesRole, matchPositions),
    [all, heroesPeriod, heroesRole, matchPositions],
  )
  const heroRows = useMemo(() => buildHeroRows(heroesScope), [heroesScope])
  const heroesSummary = useMemo(() => aggregate(heroesScope), [heroesScope])

  const overviewHeroScope = useMemo(() => scopeMatches(all, period, null, matchPositions), [all, period, matchPositions])
  const overviewHeroRows = useMemo(() => buildHeroRows(overviewHeroScope), [overviewHeroScope])

  function openHeroInMatches(heroId: number) {
    setFilters({ heroId, outcome: 'all', role: heroesRole })
    setTab('matches')
  }

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

  const deathsPerMatch = stats.avgDeaths
  const formCaption =
    stats.games > 0
      ? `${num(stats.games)} ${plural(stats.games, 'матч', 'матча', 'матчей')} ${periodLabel(period)}`
      : `нет матчей ${periodLabel(period)}`

  const avgGpm = totalsMean(totals.data, 'gold_per_min')
  const avgXpm = totalsMean(totals.data, 'xp_per_min')
  const avgHeroDamage = totalsMean(totals.data, 'hero_damage')
  const gpmCount = totalsCount(totals.data, 'gold_per_min')
  const xpmCount = totalsCount(totals.data, 'xp_per_min')
  const heroDamageCount = totalsCount(totals.data, 'hero_damage')
  const formPending = history.isPending || totals.isPending

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

          {formPending ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[16px] font-semibold text-ink">Форма</h2>
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex flex-wrap gap-x-9 gap-y-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-2.5 w-12" />
                    <Skeleton className="h-[22px] w-16" />
                  </div>
                ))}
              </div>
            </div>
          ) : history.isError ? (
            <ErrorState
              message={history.error instanceof Error ? history.error.message : 'Неизвестная ошибка'}
              onRetry={() => void history.refetch()}
            />
          ) : (
            <Section title="Форма" aside={formCaption}>
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
                  {
                    label: 'GPM',
                    value: num(avgGpm),
                    sub: 'золото в минуту',
                    tone: 'gold',
                    explain: (
                      <MathTooltip
                        formula="сумма золота в минуту / число матчей с этим показателем"
                        inputs={[{ label: 'Матчей учтено', value: String(gpmCount) }]}
                        note={`Период: ${periodLabel(period)}. Источник: OpenDota /totals.`}
                      />
                    ),
                  },
                  {
                    label: 'XPM',
                    value: num(avgXpm),
                    sub: 'опыт в минуту',
                    tone: 'xp',
                    explain: (
                      <MathTooltip
                        formula="сумма опыта в минуту / число матчей с этим показателем"
                        inputs={[{ label: 'Матчей учтено', value: String(xpmCount) }]}
                        note={`Период: ${periodLabel(period)}. Источник: OpenDota /totals.`}
                      />
                    ),
                  },
                  {
                    label: 'Урон',
                    value: compact(avgHeroDamage),
                    sub: 'по героям за матч',
                    tone: 'dmg',
                    explain: (
                      <MathTooltip
                        formula="сумма урона по героям / число матчей с этим показателем"
                        inputs={[{ label: 'Матчей учтено', value: String(heroDamageCount) }]}
                        note={`Период: ${periodLabel(period)}. Источник: OpenDota /totals, итог по матчу, не по минутам.`}
                      />
                    ),
                  },
                  {
                    label: 'Длительность',
                    value: duration(stats.avgDuration),
                    sub: 'средний матч',
                    explain: (
                      <MathTooltip
                        formula="среднее время матча по периоду"
                        inputs={[{ label: 'Матчей учтено', value: String(stats.games) }]}
                        note={`Период: ${periodLabel(period)}.`}
                      />
                    ),
                  },
                ]}
              />
            </Section>
          )}

          <Section title="Динамика">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <WinrateTrend matches={all} loading={history.isPending} />
              {history.isPending ? (
                <Skeleton className="h-[190px] w-full rounded-panel" />
              ) : (
                <ActivityGraph matches={activityMatches} />
              )}
            </div>
          </Section>

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
              positions={matchPositions}
            />
          </Section>

          <Section title="Лучшие герои" aside={`от 3 игр · ${periodLabel(period)}`}>
            <TopHeroes
              rows={overviewHeroRows}
              heroes={heroes.data}
              loading={history.isPending}
            />
          </Section>

          <Section title="Против медианы" aside="OpenDota, от 5 игр на герое">
            <HeroBenchmarks
              playerHeroes={playerHeroes.data ?? []}
              accountId={valid ? accountId : undefined}
              heroes={heroes.data}
              loading={playerHeroes.isPending}
            />
          </Section>

        </div>
      )}

      {tab === 'matches' && (
        <Section title="Все матчи" aside={`история до ${HISTORY_SIZE} последних игр`}>
          <div className="flex flex-col gap-4">
            <MatchFilters
              heroes={heroes.data}
              state={filters}
              onChange={setFilters}
              roleFilterAvailable={stratzOk}
            />

            {paged.isError ? (
              <ErrorState
                message={paged.error instanceof Error ? paged.error.message : 'Неизвестная ошибка'}
                onRetry={() => void paged.refetch()}
              />
            ) : (
              <>
                <MatchList
                  matches={filteredMatches}
                  heroes={heroes.data}
                  loading={!matchesTabOpened || paged.isPending}
                  positions={matchPositions}
                  emptyTitle="Под фильтр ничего не попало"
                  emptyHint="Попробуйте сбросить героя, исход или роль."
                />
                {(filters.heroId !== null || filters.outcome !== 'all' || filters.role !== null) &&
                paged.hasNextPage ? (
                  <p className="text-[12px] text-ink-3">
                    Фильтр работает по уже загруженной истории - подгрузите ещё матчей ниже, если нужного не нашлось.
                  </p>
                ) : null}
                <LoadMore
                  hasMore={paged.hasNextPage}
                  loading={paged.isFetchingNextPage}
                  onLoad={() => void paged.fetchNextPage()}
                />
              </>
            )}
          </div>
        </Section>
      )}

      {tab === 'heroes' && (
        <Section title="Герои" aside="источник - твоя история матчей, до 500 последних игр">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <PeriodFilter value={heroesPeriod} onChange={setHeroesPeriod} />
              {stratzOk && <RolePills value={heroesRole} onChange={setHeroesRole} />}
            </div>

            {history.isPending ? (
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-block" />
                ))}
              </div>
            ) : history.isError ? (
              <ErrorState
                message={history.error instanceof Error ? history.error.message : 'Неизвестная ошибка'}
                onRetry={() => void history.refetch()}
              />
            ) : (
              <PlayerHeroesTable
                rows={heroRows}
                summary={heroesSummary}
                heroes={heroes.data}
                onSelectHero={openHeroInMatches}
              />
            )}

            <p className="text-[12px] text-ink-3">
              Клик по герою переключает на вкладку «Матчи» с фильтром по этому герою.
            </p>
          </div>
        </Section>
      )}
    </div>
  )
}
