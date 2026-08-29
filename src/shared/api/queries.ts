import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { openDota } from './opendota'
import { stratzAvailable, stratzPlayerRoleMatches } from './stratz'
import { freshness } from '@/shared/cache/freshness'
import type {
  Hero,
  HeroBenchmarkResponse,
  HeroStat,
  Match,
  PlayerHeroRow,
  PlayerMatch,
  PlayerPeer,
  PlayerProfile,
  PlayerTotalsField,
  SearchHit,
  StratzRoleMatch,
} from './types'

const ROLE_SPLIT_TAKE = 200

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
    queryFn: () => openDota.constants('items') as Promise<Record<string, { id: number; dname?: string; img?: string; cost?: number }>>,
    ...options('constants'),
    select: (items) => {
      const byId = new Map<number, { key: string; dname: string; cost: number }>()
      for (const [key, value] of Object.entries(items)) {
        byId.set(value.id, { key, dname: value.dname ?? key, cost: value.cost ?? 0 })
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
    queryFn: () => openDota.live() as Promise<unknown[]>,
    refetchInterval: freshness.liveMatches.staleTime,
    ...options('liveMatches'),
  })
}

export function useProMatches() {
  return useQuery({
    queryKey: ['proMatches'],
    queryFn: () => openDota.proMatches() as Promise<unknown[]>,
    ...options('proScene'),
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

export function useStratzStatus() {
  return useQuery({
    queryKey: ['stratz', 'status'],
    queryFn: stratzAvailable,
    retry: false,
    refetchInterval: freshness.stratzStatus.staleTime,
    ...options('stratzStatus'),
  })
}
