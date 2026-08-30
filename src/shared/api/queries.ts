import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { openDota } from './opendota'
import { stratzAvailable, stratzPlayerRoleMatches } from './stratz'
import { freshness } from '@/shared/cache/freshness'
import type {
  Hero,
  HeroBenchmarkResponse,
  HeroDurationBucket,
  HeroItemPopularity,
  HeroMatchup,
  HeroStat,
  LiveMatch,
  Match,
  PlayerHeroRow,
  PlayerMatch,
  PlayerPeer,
  PlayerProfile,
  PlayerTotalsField,
  ProMatch,
  SearchHit,
  StratzRoleMatch,
  TeamHeroPick,
  TeamMatch,
  TeamPlayer,
  TeamProfile,
} from './types'

const ROLE_SPLIT_TAKE = 100

const MATCHES_PAGE = 20

function options(kind: keyof typeof freshness) {
  const f = freshness[kind]
  return {
    staleTime: f.staleTime,
    gcTime: f.gcTime,
    meta: { persist: f.persist },
  }
}

export function useHeroes() {
  return useQuery({
    queryKey: ['heroes'],
    queryFn: () => openDota.heroes() as Promise<Hero[]>,
    ...options('constants'),
    select: (heroes) => new Map(heroes.map((hero) => [hero.id, hero])),
  })
}

export function useHeroStats() {
  return useQuery({
    queryKey: ['heroStats'],
    queryFn: () => openDota.heroStats() as Promise<HeroStat[]>,
    ...options('meta'),
  })
}

export function useItemConstants() {
  return useQuery({
    queryKey: ['constants', 'items'],
    queryFn: () =>
      openDota.constants('items') as Promise<
        Record<string, { id: number; dname?: string; img?: string; cost?: number; components?: string[] | null }>
      >,
    ...options('constants'),
    select: (items) => {
      const byId = new Map<number, { key: string; dname: string; cost: number; components: string[] }>()
      for (const [key, value] of Object.entries(items)) {
        byId.set(value.id, { key, dname: value.dname ?? key, cost: value.cost ?? 0, components: value.components ?? [] })
      }
      return byId
    },
  })
}

export function usePlayer(accountId: number | undefined) {
  return useQuery({
    queryKey: ['player', accountId],
    queryFn: () => openDota.player(accountId as number) as Promise<PlayerProfile>,
    enabled: accountId !== undefined && Number.isFinite(accountId),
    ...options('playerProfile'),
  })
}

export function usePlayerHeroes(accountId: number | undefined) {
  return useQuery({
    queryKey: ['player', accountId, 'heroes'],
    queryFn: () => openDota.playerHeroes(accountId as number) as Promise<PlayerHeroRow[]>,
    enabled: accountId !== undefined && Number.isFinite(accountId),
    ...options('playerProfile'),
  })
}

export function usePlayerPeers(accountId: number | undefined) {
  return useQuery({
    queryKey: ['player', accountId, 'peers'],
    queryFn: () => openDota.playerPeers(accountId as number) as Promise<PlayerPeer[]>,
    enabled: accountId !== undefined && Number.isFinite(accountId),
    ...options('playerProfile'),
  })
}

export function usePlayerMatches(accountId: number | undefined) {
  return useInfiniteQuery({
    queryKey: ['player', accountId, 'matches'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      openDota.playerMatches(accountId as number, MATCHES_PAGE, pageParam) as Promise<PlayerMatch[]>,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < MATCHES_PAGE ? undefined : allPages.length * MATCHES_PAGE,
    enabled: accountId !== undefined && Number.isFinite(accountId),
    ...options('playerMatches'),
  })
}

export const HISTORY_SIZE = 500

export function usePlayerHistory(accountId: number | undefined) {
  return useQuery({
    queryKey: ['player', accountId, 'history', HISTORY_SIZE],
    queryFn: () => openDota.playerHistory(accountId as number, HISTORY_SIZE) as Promise<PlayerMatch[]>,
    enabled: accountId !== undefined && Number.isFinite(accountId),
    ...options('playerMatches'),
  })
}

export function usePlayerTotals(accountId: number | undefined, days: number | null, heroId?: number) {
  return useQuery({
    queryKey: ['player', accountId, 'totals', days, heroId],
    queryFn: () =>
      openDota.playerTotals(accountId as number, {
        ...(days !== null ? { date: days } : {}),
        ...(heroId !== undefined ? { hero_id: heroId } : {}),
      }) as Promise<PlayerTotalsField[]>,
    enabled: accountId !== undefined && Number.isFinite(accountId),
    ...options('playerMatches'),
  })
}

export function useMatch(matchId: number | undefined) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => openDota.match(matchId as number) as Promise<Match>,
    enabled: matchId !== undefined && Number.isFinite(matchId),
    staleTime: freshness.matchUnparsed.staleTime,
    gcTime: freshness.matchParsed.gcTime,
    meta: { persist: true },
  })
}

export function useRequestParse(matchId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => openDota.requestParse(matchId as number),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['match', matchId] })
    },
  })
}

export function useAbilityIds() {
  return useQuery({
    queryKey: ['constants', 'ability_ids'],
    queryFn: () => openDota.constants('ability_ids') as Promise<Record<string, string>>,
    ...options('constants'),
  })
}

export interface AbilityConstant {
  dname?: string
  img?: string
  attrib?: { header?: string; value?: string | string[] }[]
}

export function useAbilityConstants() {
  return useQuery({
    queryKey: ['constants', 'abilities'],
    queryFn: () => openDota.constants('abilities') as Promise<Record<string, AbilityConstant>>,
    ...options('constants'),
  })
}

export interface HeroAbilityConstant {
  abilities: string[]
  talents: { name: string; level: number }[]
}

export function useHeroAbilityConstants() {
  return useQuery({
    queryKey: ['constants', 'hero_abilities'],
    queryFn: () =>
      openDota.constants('hero_abilities') as Promise<Record<string, HeroAbilityConstant>>,
    ...options('constants'),
    select: (byName) => new Map(Object.entries(byName)),
  })
}

export function useSearch(query: string) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: ['search', trimmed],
    queryFn: () => openDota.search(trimmed) as Promise<SearchHit[]>,
    enabled: trimmed.length >= 2,
    ...options('playerProfile'),
  })
}

export function useLiveMatches() {
  return useQuery({
    queryKey: ['live'],
    queryFn: () => openDota.live() as Promise<LiveMatch[]>,
    refetchInterval: freshness.liveMatches.staleTime,
    ...options('liveMatches'),
  })
}

export function useProMatches() {
  return useQuery({
    queryKey: ['proMatches'],
    queryFn: () => openDota.proMatches() as Promise<ProMatch[]>,
    ...options('proScene'),
  })
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const rows = (await openDota.teams()) as TeamProfile[]
      const byId = new Map(rows.map((team) => [team.team_id, team]))
      const byName = new Map<string, TeamProfile>()
      for (const team of rows) {
        if (team.name) byName.set(team.name, team)
        if (team.tag) byName.set(team.tag, team)
      }
      return { byId, byName }
    },
    ...options('proScene'),
  })
}

export function useTeam(teamId: number | undefined) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => openDota.team(teamId as number) as Promise<TeamProfile>,
    enabled: teamId !== undefined && Number.isFinite(teamId),
    ...options('meta'),
  })
}

export function useTeamMatches(teamId: number | undefined) {
  return useQuery({
    queryKey: ['team', teamId, 'matches'],
    queryFn: () => openDota.teamMatches(teamId as number) as Promise<TeamMatch[]>,
    enabled: teamId !== undefined && Number.isFinite(teamId),
    ...options('meta'),
  })
}

export function useTeamPlayers(teamId: number | undefined) {
  return useQuery({
    queryKey: ['team', teamId, 'players'],
    queryFn: () => openDota.teamPlayers(teamId as number) as Promise<TeamPlayer[]>,
    enabled: teamId !== undefined && Number.isFinite(teamId),
    ...options('meta'),
  })
}

export function useTeamHeroes(teamId: number | undefined) {
  return useQuery({
    queryKey: ['team', teamId, 'heroes'],
    queryFn: () => openDota.teamHeroes(teamId as number) as Promise<TeamHeroPick[]>,
    enabled: teamId !== undefined && Number.isFinite(teamId),
    ...options('meta'),
  })
}

export function useHeroBenchmark(heroId: number | undefined) {
  return useQuery({
    queryKey: ['heroBenchmark', heroId],
    queryFn: () => openDota.benchmarks(heroId as number) as Promise<HeroBenchmarkResponse>,
    enabled: heroId !== undefined && Number.isFinite(heroId),
    ...options('meta'),
  })
}

export function usePlayerRoleMatches(accountId: number | undefined, days: number | null, stratzOk: boolean) {
  return useQuery({
    queryKey: ['player', accountId, 'roleMatches', days],
    queryFn: () => {
      const startDateTime = days !== null ? Math.floor(Date.now() / 1000 - days * 86400) : undefined
      return stratzPlayerRoleMatches(accountId as number, ROLE_SPLIT_TAKE, startDateTime) as Promise<
        StratzRoleMatch[]
      >
    },
    enabled: stratzOk && accountId !== undefined && Number.isFinite(accountId),
    ...options('playerMatches'),
  })
}

export function useHeroMatchups(heroId: number | undefined) {
  return useQuery({
    queryKey: ['hero', heroId, 'matchups'],
    queryFn: () => openDota.heroMatchups(heroId as number) as Promise<HeroMatchup[]>,
    enabled: heroId !== undefined && Number.isFinite(heroId),
    ...options('meta'),
  })
}

export function useHeroDurations(heroId: number | undefined) {
  return useQuery({
    queryKey: ['hero', heroId, 'durations'],
    queryFn: () => openDota.heroDurations(heroId as number) as Promise<HeroDurationBucket[]>,
    enabled: heroId !== undefined && Number.isFinite(heroId),
    ...options('meta'),
  })
}

export function useHeroItemPopularity(heroId: number | undefined) {
  return useQuery({
    queryKey: ['hero', heroId, 'itemPopularity'],
    queryFn: () => openDota.heroItemPopularity(heroId as number) as Promise<HeroItemPopularity>,
    enabled: heroId !== undefined && Number.isFinite(heroId),
    ...options('meta'),
  })
}

export function useHeroMatchupsBatch(heroIds: number[]) {
  const key = [...new Set(heroIds)].sort((a, b) => a - b)
  return useQuery({
    queryKey: ['heroMatchupsBatch', key],
    queryFn: async () => {
      const entries = await Promise.all(
        key.map(async (id) => [id, (await openDota.heroMatchups(id)) as HeroMatchup[]] as const),
      )
      return new Map(entries)
    },
    enabled: key.length > 0,
    ...options('meta'),
  })
}

export function useHeroDurationsBatch(heroIds: number[]) {
  const key = [...new Set(heroIds)].sort((a, b) => a - b)
  return useQuery({
    queryKey: ['heroDurationsBatch', key],
    queryFn: async () => {
      const entries = await Promise.all(
        key.map(async (id) => [id, (await openDota.heroDurations(id)) as HeroDurationBucket[]] as const),
      )
      return new Map(entries)
    },
    enabled: key.length > 0,
    ...options('meta'),
  })
}

export function useStratzStatus() {
  return useQuery({
    queryKey: ['stratz', 'status'],
    queryFn: stratzAvailable,
    retry: false,
    refetchInterval: freshness.stratzStatus.staleTime,
    ...options('stratzStatus'),
  })
}
