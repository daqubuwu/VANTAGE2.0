export interface Hero {
  id: number
  name: string
  localized_name: string
  primary_attr: 'str' | 'agi' | 'int' | 'all'
  attack_type: 'Melee' | 'Ranged'
  roles: string[]
}

export interface HeroStat extends Hero {
  img: string
  icon: string
  base_health: number
  move_speed: number
  pro_win: number
  pro_pick: number
  pro_ban: number
  '1_pick': number
  '1_win': number
  '2_pick': number
  '2_win': number
  '3_pick': number
  '3_win': number
  '4_pick': number
  '4_win': number
  '5_pick': number
  '5_win': number
  '6_pick': number
  '6_win': number
  '7_pick': number
  '7_win': number
  '8_pick': number
  '8_win': number
}

export interface PlayerProfile {
  profile: {
    account_id: number
    personaname: string | null
    name: string | null
    avatarfull: string | null
    profileurl: string | null
    last_login: string | null
    is_contributor: boolean
  } | null
  rank_tier: number | null
  leaderboard_rank: number | null
}

export interface PlayerMatch {
  match_id: number
  player_slot: number
  radiant_win: boolean | null
  duration: number
  game_mode: number
  lobby_type: number
  hero_id: number
  start_time: number
  version: number | null
  kills: number
  deaths: number
  assists: number
  average_rank: number | null
  gold_per_min: number | null
  xp_per_min: number | null
  last_hits: number | null
  hero_damage: number | null
  tower_damage: number | null
  hero_healing: number | null
  party_size: number | null
}

export interface HeroMatchup {
  hero_id: number
  games_played: number
  wins: number
}

export interface HeroDurationBucket {
  duration_bin: number
  games_played: number
  wins: number
}

export interface HeroItemPopularity {
  start_game_items?: Record<string, number>
  early_game_items?: Record<string, number>
  mid_game_items?: Record<string, number>
  late_game_items?: Record<string, number>
}

export interface PlayerHeroRow {
  hero_id: string
  games: number
  win: number
  with_games: number
  with_win: number
  against_games: number
  against_win: number
}

export interface PlayerPeer {
  account_id: number
  personaname: string | null
  avatarfull: string | null
  games: number
  win: number
  with_games: number
  with_win: number
}

export type StratzPosition =
  | 'POSITION_1'
  | 'POSITION_2'
  | 'POSITION_3'
  | 'POSITION_4'
  | 'POSITION_5'
  | 'UNKNOWN'
  | 'FILTERED'
  | 'ALL'
  | null

export interface StratzRoleMatch {
  position: StratzPosition
  isVictory: boolean | null
  goldPerMinute: number | null
  experiencePerMinute: number | null
  heroDamage: number | null
  kills: number | null
  deaths: number | null
  assists: number | null
}

export interface PlayerTotalsField {
  field: string
  n: number
  sum: number
}

export interface Benchmark {
  raw: number | null
  pct: number | null
}

export type HeroBenchmarkMetric =
  | 'gold_per_min'
  | 'xp_per_min'
  | 'kills_per_min'
  | 'last_hits_per_min'
  | 'hero_damage_per_min'
  | 'hero_healing_per_min'
  | 'tower_damage'

export interface HeroBenchmarkPoint {
  percentile: number
  value: number
}

export interface HeroBenchmarkResponse {
  hero_id: number
  result: Record<HeroBenchmarkMetric, HeroBenchmarkPoint[]>
}

export interface MatchPlayer {
  account_id: number | null
  player_slot: number
  hero_id: number
  personaname: string | null
  kills: number
  deaths: number
  assists: number
  net_worth: number | null
  gold_per_min: number | null
  xp_per_min: number | null
  last_hits: number | null
  denies: number | null
  hero_damage: number | null
  tower_damage: number | null
  hero_healing: number | null
  level: number
  gold_t: number[] | null
  xp_t: number[] | null
  lh_t: number[] | null
  dn_t: number[] | null
  times: number[] | null
  kills_log: { time: number; key: string }[] | null
  purchase_log: { time: number; key: string }[] | null
  item_0: number
  item_1: number
  item_2: number
  item_3: number
  item_4: number
  item_5: number
  item_neutral: number | null
  ability_upgrades_arr: number[] | null
  lane_efficiency_pct: number | null
  teamfight_participation: number | null
  towers_killed: number | null
  roshans_killed: number | null
  benchmarks: Record<string, Benchmark> | null
  isRadiant?: boolean
}

export interface MatchObjective {
  time: number
  type: string
  slot?: number
  key?: string | number
  player_slot?: number
  team?: number
}

export interface Match {
  match_id: number
  radiant_win: boolean
  duration: number
  start_time: number
  game_mode: number
  lobby_type: number
  version: number | null
  radiant_score: number
  dire_score: number
  radiant_team?: { team_id: number; name: string; logo_url?: string } | null
  dire_team?: { team_id: number; name: string; logo_url?: string } | null
  league?: { leagueid: number; name: string } | null
  players: MatchPlayer[]
  objectives: MatchObjective[] | null
  radiant_gold_adv: number[] | null
  radiant_xp_adv: number[] | null
  picks_bans: { is_pick: boolean; hero_id: number; team: number; order: number }[] | null
}

export interface SearchHit {
  account_id: number
  personaname: string | null
  avatarfull: string | null
  last_match_time: string | null
  similarity: number
}

export function isMatchParsed(match: Pick<Match, 'version'>) {
  return match.version !== null
}

export function isRadiantSlot(playerSlot: number) {
  return playerSlot < 128
}
