import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  useHeroes,
  useHeroMatchups,
  useHeroDurations,
  useHeroItemPopularity,
  useItemConstants,
} from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { Skeleton, SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState, EmptyState } from '@/shared/ui/States'
import { HeroHeader } from '@/features/hero/HeroHeader'
import { ItemPopularityPhases } from '@/features/hero/ItemPopularityPhases'
import { buildPhaseGroups } from '@/features/hero/itemPopularity'
import { HeroMatchups } from '@/features/hero/HeroMatchups'
import { rankMatchups, MIN_MATCHUP_GAMES } from '@/features/hero/matchups'
import { DurationWinrate } from '@/features/hero/DurationWinrate'
import { buildDurationRows } from '@/features/hero/durations'
import { MagnifyingGlass } from '@phosphor-icons/react'

export function HeroPage() {
  const { id } = useParams<{ id: string }>()
  const heroId = Number(id)
  const valid = Number.isFinite(heroId) && heroId > 0

  const heroes = useHeroes()
  const items = useItemConstants()
  const matchups = useHeroMatchups(valid ? heroId : undefined)
  const durations = useHeroDurations(valid ? heroId : undefined)
  const popularity = useHeroItemPopularity(valid ? heroId : undefined)

  const hero = heroes.data?.get(heroId)
  useDocumentTitle(hero?.localized_name ?? 'Герой')

  const phases = useMemo(() => buildPhaseGroups(popularity.data, items.data), [popularity.data, items.data])
  const ranked = useMemo(() => rankMatchups(matchups.data), [matchups.data])
  const durationRows = useMemo(() => buildDurationRows(durations.data), [durations.data])

  if (!valid) {
    return (
      <EmptyState icon={<MagnifyingGlass size={28} />} title="Герой не найден" hint="Проверьте ссылку." />
    )
  }

  if (heroes.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[88px] w-full rounded-panel" />
        <SkeletonRows rows={4} height={72} />
      </div>
    )
  }

  if (heroes.isError) {
    return (
      <ErrorState
        message={heroes.error instanceof Error ? heroes.error.message : 'Неизвестная ошибка'}
        onRetry={() => void heroes.refetch()}
      />
    )
  }

  if (!hero) {
    return (
      <EmptyState
        icon={<MagnifyingGlass size={28} />}
        title="Герой не найден"
        hint={`ID ${heroId} нет в справочнике OpenDota.`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <HeroHeader hero={hero} />

      <Section title="Предметы по фазам" aside="популярность, не винрейт">
        {popularity.isPending ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[180px] w-full rounded-panel" />
            ))}
          </div>
        ) : popularity.isError ? (
          <ErrorState
            message={popularity.error instanceof Error ? popularity.error.message : 'Неизвестная ошибка'}
            onRetry={() => void popularity.refetch()}
          />
        ) : (
          <ItemPopularityPhases phases={phases} />
        )}
      </Section>

      <Section title="Матчапы" aside={`минимум ${MIN_MATCHUP_GAMES} игр в выборке`}>
        {matchups.isPending ? (
          <SkeletonRows rows={5} height={40} />
        ) : matchups.isError ? (
          <ErrorState
            message={matchups.error instanceof Error ? matchups.error.message : 'Неизвестная ошибка'}
            onRetry={() => void matchups.refetch()}
          />
        ) : (
          <HeroMatchups best={ranked.best} worst={ranked.worst} heroes={heroes.data} />
        )}
      </Section>

      <Section title="Винрейт по длительности матча">
        {durations.isPending ? (
          <SkeletonRows rows={6} height={24} />
        ) : durations.isError ? (
          <ErrorState
            message={durations.error instanceof Error ? durations.error.message : 'Неизвестная ошибка'}
            onRetry={() => void durations.refetch()}
          />
        ) : (
          <DurationWinrate rows={durationRows} />
        )}
      </Section>
    </div>
  )
}
