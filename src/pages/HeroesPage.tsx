import { useMemo, useState } from 'react'
import { useHeroes, useHeroStats } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState } from '@/shared/ui/States'
import { BracketFilter } from '@/features/meta/BracketFilter'
import { HeroGrid } from '@/features/meta/HeroGrid'
import { buildTierRows } from '@/features/meta/tierlist'
import type { BracketKey } from '@/features/meta/tierlist'

export function HeroesPage() {
  useDocumentTitle('Мета')

  const [bracket, setBracket] = useState<BracketKey>('pro')

  const heroes = useHeroes()
  const heroStats = useHeroStats()

  const rows = useMemo(() => buildTierRows(heroStats.data, bracket), [heroStats.data, bracket])

  return (
    <Section title="Мета" aside="сортировка по винрейту, источник - OpenDota heroStats">
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
        <HeroGrid rows={rows} heroes={heroes.data} />
      )}
    </Section>
  )
}
