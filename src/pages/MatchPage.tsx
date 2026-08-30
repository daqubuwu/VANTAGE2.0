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
import type { AbilityConstant } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { isMatchParsed, isRadiantSlot } from '@/shared/api/types'
import type { Hero, MatchPlayer } from '@/shared/api/types'
import type { AbilityBuild } from '@/features/match/talents'
import { Section } from '@/shared/ui/Surface'
import { Skeleton, SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState, EmptyState } from '@/shared/ui/States'
import { MatchHeader } from '@/features/match/MatchHeader'
import { PicksBans } from '@/features/match/PicksBans'
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
              Матч не разобран - тайминги предметов, урон по минутам и таланты недоступны.
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

        {data.picks_bans && data.picks_bans.length > 0 && (
          <Section title="Пики и баны">
            <PicksBans match={data} heroes={heroes.data} />
          </Section>
        )}

        <Section
          title="Radiant"
          aside={minute !== null ? `${data.radiant_score} убийств · предметы на момент времени приблизительны` : `${data.radiant_score} убийств`}
        >
          <RosterTable players={data.players} heroes={heroes.data} items={items.data} side="radiant" minute={minute} />
        </Section>

        <Section
          title="Dire"
          aside={minute !== null ? `${data.dire_score} убийств · предметы на момент времени приблизительны` : `${data.dire_score} убийств`}
        >
          <RosterTable players={data.players} heroes={heroes.data} items={items.data} side="dire" minute={minute} />
        </Section>

        {data.radiant_gold_adv && <GoldTimeline radiantGoldAdv={data.radiant_gold_adv} minute={minute} />}

        <Section title="Разбор" aside="по фактам матча">
          <MatchFacts match={data} heroes={heroes.data} />
        </Section>

        {parsed && (
          <Section title="Способности и таланты">
            {heroAbilities.isPending || abilityIds.isPending || abilities.isPending || heroes.isPending ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <SkeletonRows rows={4} height={28} />
                <SkeletonRows rows={4} height={28} />
              </div>
            ) : heroAbilities.isError || abilityIds.isError || abilities.isError ? (
              <ErrorState
                message="Не удалось загрузить справочник способностей OpenDota."
                onRetry={() => {
                  void heroAbilities.refetch()
                  void abilityIds.refetch()
                  void abilities.refetch()
                }}
              />
            ) : (() => {
              const builds = data.players.map((player) => {
                const hero = heroes.data?.get(player.hero_id)
                const heroAbilityMeta = hero ? heroAbilities.data?.get(hero.name) : undefined
                const build = buildAbilityBuild(heroAbilityMeta, abilityIds.data, player.ability_upgrades_arr)
                return { player, hero, build }
              })
              const visible = builds.filter(
                ({ build }) => build.talents.some((tier) => tier.options.length > 0) || build.skills.length > 0,
              )

              if (visible.length === 0) {
                return (
                  <EmptyState
                    title="Нет данных о талантах для этого матча"
                    hint="OpenDota пока не отдал ability_upgrades для этих игроков."
                  />
                )
              }

              const radiantVisible = visible.filter(({ player }) => isRadiantSlot(player.player_slot))
              const direVisible = visible.filter(({ player }) => !isRadiantSlot(player.player_slot))

              return (
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <TalentTeamColumn tone="radiant" entries={radiantVisible} abilities={abilities.data} />
                  <TalentTeamColumn tone="dire" entries={direVisible} abilities={abilities.data} />
                </div>
              )
            })()}
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

interface TalentTeamColumnProps {
  tone: 'radiant' | 'dire'
  entries: { player: MatchPlayer; hero: Hero | undefined; build: AbilityBuild }[]
  abilities: Record<string, AbilityConstant> | undefined
}

function TalentTeamColumn({ tone, entries, abilities }: TalentTeamColumnProps) {
  return (
    <div className="flex flex-col gap-5">
      <span className="flex items-center gap-2 text-[12px] font-medium text-ink-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: tone === 'radiant' ? 'var(--color-radiant)' : 'var(--color-dire)' }}
          aria-hidden
        />
        {tone === 'radiant' ? 'Radiant' : 'Dire'}
      </span>

      {entries.length === 0 ? (
        <span className="text-[12px] text-ink-3">нет данных по этой стороне</span>
      ) : (
        entries.map(({ player, hero, build }) => (
          <div key={player.player_slot} className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <HeroIcon hero={hero} size={22} link={false} />
              <span className="text-[12px] text-ink-2">{hero?.localized_name ?? '—'}</span>
            </span>
            <TalentTree build={build} abilities={abilities} />
          </div>
        ))
      )}
    </div>
  )
}
