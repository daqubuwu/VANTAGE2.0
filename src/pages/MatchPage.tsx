import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useMatch,
  useHeroes,
  useItemConstants,
  useAbilityIds,
  useAbilityConstants,
  useHeroAbilityConstants,
  useRequestParse,
} from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { isMatchParsed, isRadiantSlot } from '@/shared/api/types'
import { Section } from '@/shared/ui/Surface'
import { Skeleton } from '@/shared/ui/Skeleton'
import { ErrorState } from '@/shared/ui/States'
import { MatchHeader } from '@/features/match/MatchHeader'
import { RosterTable } from '@/features/match/RosterTable'
import { GoldTimeline } from '@/features/match/GoldTimeline'
import { TimeSlider } from '@/features/match/TimeSlider'
import { MatchFacts } from '@/features/match/MatchFacts'
import { TalentTree } from '@/features/match/TalentTree'
import { buildAbilityBuild } from '@/features/match/talents'
import { HeroIcon } from '@/shared/ui/HeroIcon'

export function MatchPage() {
  const { id } = useParams<{ id: string }>()
  const matchId = Number(id)
  const valid = Number.isFinite(matchId) && matchId > 0

  const match = useMatch(valid ? matchId : undefined)
  const heroes = useHeroes()
  const items = useItemConstants()
  const abilityIds = useAbilityIds()
  const abilities = useAbilityConstants()
  const heroAbilities = useHeroAbilityConstants()
  const requestParse = useRequestParse(valid ? matchId : undefined)

  const [minute, setMinute] = useState<number | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  useDocumentTitle(match.data ? `Матч ${match.data.match_id}` : 'Матч')

  const maxMinute = match.data ? Math.floor(match.data.duration / 60) : 0
  const hasTimeline = Boolean(match.data?.players.some((player) => player.gold_t && player.gold_t.length > 0))

  if (!valid) {
    return <ErrorState message="Некорректный идентификатор матча в адресе страницы." />
  }

  if (match.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full rounded-panel" />
        <Skeleton className="h-[220px] w-full rounded-panel" />
        <Skeleton className="h-[220px] w-full rounded-panel" />
      </div>
    )
  }

  if (match.isError || !match.data) {
    return (
      <ErrorState
        message={match.error instanceof Error ? match.error.message : 'Неизвестная ошибка'}
        onRetry={() => void match.refetch()}
      />
    )
  }

  const data = match.data
  const parsed = isMatchParsed(data)

  return (
    <div className={`flex flex-col gap-6 ${hasTimeline ? 'pb-20' : ''}`}>
      <div ref={exportRef} className="flex flex-col gap-6 bg-bg p-0">
        <MatchHeader match={data} exportRef={exportRef} />

        {!parsed && (
          <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4">
            <span className="text-[13px] text-ink-2">
              Матч не разобран — тайминги предметов, урон по минутам и таланты недоступны.
            </span>
            <button
              type="button"
              onClick={() => requestParse.mutate()}
              disabled={requestParse.isPending}
              className="shrink-0 rounded-full border border-line-2 bg-surface-2 px-4 py-2 text-[13px] text-ink transition-colors hover:border-accent/40 active:translate-y-px disabled:opacity-50"
            >
              {requestParse.isPending ? 'Запрашиваю…' : requestParse.isSuccess ? 'Запрошено' : 'Запросить разбор'}
            </button>
          </div>
        )}

        <Section title="Radiant" aside={`${data.radiant_score} убийств`}>
          <RosterTable players={data.players} heroes={heroes.data} items={items.data} side="radiant" minute={minute} />
        </Section>

        <Section title="Dire" aside={`${data.dire_score} убийств`}>
          <RosterTable players={data.players} heroes={heroes.data} items={items.data} side="dire" minute={minute} />
        </Section>

        {data.radiant_gold_adv && <GoldTimeline radiantGoldAdv={data.radiant_gold_adv} minute={minute} />}

        <Section title="Разбор" aside="по фактам матча">
          <MatchFacts match={data} heroes={heroes.data} />
        </Section>

        {parsed && (
          <Section title="Способности и таланты">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {data.players.map((player) => {
                const hero = heroes.data?.get(player.hero_id)
                const heroAbilityMeta = hero ? heroAbilities.data?.get(hero.name) : undefined
                const build = buildAbilityBuild(heroAbilityMeta, abilityIds.data, player.ability_upgrades_arr)
                if (build.talents.every((tier) => tier.options.length === 0)) return null

                return (
                  <div key={player.player_slot} className="flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <HeroIcon hero={hero} size={22} link={false} />
                      <span className="text-[12px] text-ink-2">{hero?.localized_name ?? '—'}</span>
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: isRadiantSlot(player.player_slot) ? 'var(--color-radiant)' : 'var(--color-dire)',
                        }}
                        aria-hidden
                      />
                    </span>
                    <TalentTree build={build} abilities={abilities.data} />
                  </div>
                )
              })}
            </div>
          </Section>
        )}
      </div>

      {hasTimeline && (
        <TimeSlider
          minute={minute ?? maxMinute}
          maxMinute={maxMinute}
          live={minute === null}
          onChange={(value) => setMinute(value >= maxMinute ? null : value)}
        />
      )}
    </div>
  )
}
