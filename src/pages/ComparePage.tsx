import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePlayer, usePlayerTotals, usePlayerHeroes, usePlayerHistory, useHeroes } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState, EmptyState } from '@/shared/ui/States'
import { PlayerPicker } from '@/features/compare/PlayerPicker'
import { CompareMetricRow } from '@/features/compare/CompareMetricRow'
import { CompareHeroRow } from '@/features/compare/CompareHeroRow'
import { CommonMatchesList } from '@/features/compare/CommonMatchesList'
import { buildMetrics, commonHeroes, commonMatches } from '@/features/compare/compare'
import { PeriodFilter } from '@/features/player/PeriodFilter'
import { periodDays } from '@/features/player/period'
import type { PeriodKey } from '@/features/player/period'
import { UserCircle, ArrowsLeftRight } from '@phosphor-icons/react'

export function ComparePage() {
  const { a, b } = useParams<{ a: string; b: string }>()
  const accountA = a ? Number(a) : undefined
  const accountB = b ? Number(b) : undefined
  const ready =
    accountA !== undefined && accountB !== undefined && Number.isFinite(accountA) && Number.isFinite(accountB)

  useDocumentTitle('Сравнение')

  if (!ready) {
    return <PickBothPlayers />
  }

  if (accountA === accountB) {
    return <EmptyState title="Это один и тот же игрок" hint="Выберите двух разных игроков." />
  }

  return <CompareContent accountA={accountA} accountB={accountB} />
}

function PickBothPlayers() {
  const navigate = useNavigate()
  const [pickedA, setPickedA] = useState<number | undefined>()
  const [pickedB, setPickedB] = useState<number | undefined>()

  useEffect(() => {
    if (pickedA !== undefined && pickedB !== undefined) {
      navigate(`/compare/${pickedA}/${pickedB}`)
    }
  }, [pickedA, pickedB, navigate])

  return (
    <Section title="Сравнение">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlayerPicker label={pickedA !== undefined ? `Игрок A: ${pickedA}` : 'Игрок A'} onSelect={setPickedA} />
        <PlayerPicker label={pickedB !== undefined ? `Игрок B: ${pickedB}` : 'Игрок B'} onSelect={setPickedB} />
      </div>
    </Section>
  )
}

interface CompareContentProps {
  accountA: number
  accountB: number
}

function CompareContent({ accountA, accountB }: CompareContentProps) {
  const [period, setPeriod] = useState<PeriodKey>('month')

  const profileA = usePlayer(accountA)
  const profileB = usePlayer(accountB)
  const totalsA = usePlayerTotals(accountA, periodDays(period))
  const totalsB = usePlayerTotals(accountB, periodDays(period))
  const heroesA = usePlayerHeroes(accountA)
  const heroesB = usePlayerHeroes(accountB)
  const historyA = usePlayerHistory(accountA)
  const historyB = usePlayerHistory(accountB)
  const heroes = useHeroes()

  useDocumentTitle(
    profileA.data?.profile?.personaname && profileB.data?.profile?.personaname
      ? `${profileA.data.profile.personaname} vs ${profileB.data.profile.personaname}`
      : 'Сравнение',
  )

  const loading = profileA.isPending || profileB.isPending
  const errored = profileA.isError || profileB.isError

  if (loading) {
    return <SkeletonRows rows={8} height={44} />
  }

  if (errored) {
    return (
      <ErrorState
        message="Не удалось загрузить одного из игроков"
        onRetry={() => {
          void profileA.refetch()
          void profileB.refetch()
        }}
      />
    )
  }

  const metrics = buildMetrics(totalsA.data, totalsB.data)
  const heroPairs = commonHeroes(heroesA.data, heroesB.data)
  const matches = commonMatches(historyA.data, historyB.data)

  return (
    <div className="flex flex-col gap-8">
      <div className="surface-panel grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <PlayerHeaderCell accountId={accountA} name={profileA.data?.profile?.personaname} avatar={profileA.data?.profile?.avatarfull} align="right" />
        <ArrowsLeftRight size={20} className="shrink-0 text-ink-3" />
        <PlayerHeaderCell accountId={accountB} name={profileB.data?.profile?.personaname} avatar={profileB.data?.profile?.avatarfull} align="left" />
      </div>

      <Section title="Метрики">
        <PeriodFilter value={period} onChange={setPeriod} />
        {totalsA.isPending || totalsB.isPending ? (
          <SkeletonRows rows={7} height={32} />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {metrics.map((metric) => (
              <CompareMetricRow key={metric.key} metric={metric} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Общие герои" aside="каждый сыграл от 2 игр, необязательно вместе">
        {heroesA.isPending || heroesB.isPending ? (
          <SkeletonRows rows={5} height={40} />
        ) : heroPairs.length === 0 ? (
          <EmptyState
            title="Общих героев не нашли"
            hint="Нужно минимум 2 игры у каждого на одном герое - при узком пуле героев такое пересечение бывает пустым. Ниже есть блок общих матчей, если оба играли в одной игре."
          />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {heroPairs.map((pair) => (
              <CompareHeroRow key={pair.heroId} hero={heroes.data?.get(pair.heroId)} a={pair.a} b={pair.b} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Общие матчи" aside="последние 500 игр каждого">
        {historyA.isPending || historyB.isPending ? <SkeletonRows rows={5} height={40} /> : <CommonMatchesList matches={matches} />}
      </Section>
    </div>
  )
}

interface PlayerHeaderCellProps {
  accountId: number
  name: string | null | undefined
  avatar: string | null | undefined
  align: 'left' | 'right'
}

function PlayerHeaderCell({ accountId, name, avatar, align }: PlayerHeaderCellProps) {
  return (
    <Link
      to={`/player/${accountId}`}
      className={`flex min-w-0 items-center gap-3 ${align === 'right' ? 'flex-row-reverse text-right' : 'text-left'}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-ctl bg-surface-2 text-ink-3">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <UserCircle size={22} />
        )}
      </span>
      <span className="truncate text-[16px] font-semibold text-ink">{name ?? `Аккаунт ${accountId}`}</span>
    </Link>
  )
}
