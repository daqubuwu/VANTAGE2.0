import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSearch, useHeroes } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState, ErrorState } from '@/shared/ui/States'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { Tooltip } from '@/shared/ui/Tooltip'
import { ago } from '@/shared/lib/format'
import { LockSimple } from '@phosphor-icons/react'

export function SearchPage() {
  const { q } = useParams<{ q: string }>()
  const query = decodeURIComponent(q ?? '')
  useDocumentTitle(query ? `Поиск: ${query}` : 'Поиск')

  const players = useSearch(query)
  const heroes = useHeroes()

  const matchedHeroes = useMemo(() => {
    if (!heroes.data || query.trim().length < 2) return []
    const needle = query.trim().toLowerCase()
    return [...heroes.data.values()]
      .filter(
        (hero) =>
          hero.localized_name.toLowerCase().includes(needle) ||
          hero.name.replace('npc_dota_hero_', '').includes(needle),
      )
      .slice(0, 8)
  }, [heroes.data, query])

  if (query.trim().length < 2) {
    return <EmptyState title="Введите запрос" hint="Ник игрока, Steam ID или название героя." />
  }

  return (
    <div className="flex flex-col gap-7">
      {matchedHeroes.length > 0 && (
        <Section title="Герои">
          <div className="grid gap-1 md:grid-cols-2">
            {matchedHeroes.map((hero) => (
              <Link
                key={hero.id}
                to={`/heroes/${hero.id}`}
                className="flex items-center gap-3 rounded-block px-3 py-2 transition-colors hover:bg-surface-2"
              >
                <HeroIcon hero={hero} size={28} link={false} />
                <span className="text-[14px] text-ink">{hero.localized_name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Игроки" aside={query}>
        {players.isPending ? (
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-[54px] w-full rounded-block" />
            ))}
          </div>
        ) : players.isError ? (
          <ErrorState
            message={players.error instanceof Error ? players.error.message : 'Неизвестная ошибка'}
            onRetry={() => void players.refetch()}
          />
        ) : (players.data ?? []).length === 0 ? (
          <EmptyState title="Никого не нашли" hint="Попробуйте другой ник или введите Steam ID цифрами." />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {(players.data ?? []).slice(0, 40).map((hit) => {
              const closed = !hit.avatarfull
              return (
                <Link
                  key={hit.account_id}
                  to={`/player/${hit.account_id}`}
                  className="flex items-center gap-3 rounded-block px-3 py-2.5 transition-colors hover:bg-surface-2"
                >
                  <span className="h-9 w-9 shrink-0 overflow-hidden rounded-ctl bg-surface-2">
                    {hit.avatarfull ? (
                      <img src={hit.avatarfull} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-ink-3">
                        <LockSimple size={15} />
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14px] text-ink">
                      {hit.personaname ?? `Аккаунт ${hit.account_id}`}
                    </span>
                    <span className="num text-[11px] text-ink-3">{hit.account_id}</span>
                  </span>
                  {closed && (
                    <Tooltip content="Профиль Steam закрыт" variant="hint">
                      <span className="text-ink-3">
                        <LockSimple size={14} />
                      </span>
                    </Tooltip>
                  )}
                  {hit.last_match_time && (
                    <span className="hidden text-[12px] text-ink-3 md:block">
                      {ago(Math.floor(new Date(hit.last_match_time).getTime() / 1000))}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
