import { useMemo, useState } from 'react'
import { useHeroes, useHeroStats } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState } from '@/shared/ui/States'
import { BracketFilter } from '@/features/meta/BracketFilter'
import { HeroMetaTable } from '@/features/meta/HeroMetaTable'
import { MetaRoleGrid } from '@/features/meta/MetaRoleGrid'
import { buildTierRows } from '@/features/meta/tierlist'
import type { BracketKey } from '@/features/meta/tierlist'

export function HeroesPage() {
  useDocumentTitle('Мета')

  const [bracket, setBracket] = useState<BracketKey>('pro')

  const heroes = useHeroes()
  const heroStats = useHeroStats()

  const rows = useMemo(() => buildTierRows(heroStats.data, bracket), [heroStats.data, bracket])

  return (
    <div className="flex flex-col gap-8">
      <Section title="Мета" aside="сортировка по колонке, источник - OpenDota heroStats">
        <BracketFilter value={bracket} onChange={setBracket} />

        {heroStats.isPending || heroes.isPending ? (
          <SkeletonRows rows={8} height={56} />
        ) : heroStats.isError ? (
          <ErrorState
            message={heroStats.error instanceof Error ? heroStats.error.message : 'Неизвестная ошибка'}
            onRetry={() => void heroStats.refetch()}
          />
        ) : heroes.isError ? (
          <ErrorState
            message={heroes.error instanceof Error ? heroes.error.message : 'Неизвестная ошибка'}
            onRetry={() => void heroes.refetch()}
          />
        ) : (
          <HeroMetaTable rows={rows} heroes={heroes.data} />
        )}
      </Section>

      <Section title="Мета сейчас" aside="лучшие герои по ролям, от 5% пиков самого популярного в бракете">
        {heroStats.isPending || heroes.isPending ? (
          <SkeletonRows rows={6} height={140} />
        ) : heroStats.isError || heroes.isError ? (
          <ErrorState
            message="Не удалось загрузить статистику героев."
            onRetry={() => {
              void heroStats.refetch()
              void heroes.refetch()
            }}
          />
        ) : (
          <MetaRoleGrid heroStats={heroStats.data} heroes={heroes.data} />
        )}
      </Section>
    </div>
  )
}
