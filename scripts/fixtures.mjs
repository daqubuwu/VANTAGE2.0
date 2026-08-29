const HERO_NAMES = [
  [1, 'antimage', 'Anti-Mage'],
  [8, 'juggernaut', 'Juggernaut'],
  [11, 'nevermore', 'Shadow Fiend'],
  [14, 'pudge', 'Pudge'],
  [19, 'tiny', 'Tiny'],
  [26, 'lion', 'Lion'],
  [35, 'sniper', 'Sniper'],
  [41, 'faceless_void', 'Faceless Void'],
  [44, 'phantom_assassin', 'Phantom Assassin'],
  [74, 'invoker', 'Invoker'],
  [86, 'rubick', 'Rubick'],
  [114, 'monkey_king', 'Monkey King'],
]

export const heroes = HERO_NAMES.map(([id, slug, localized]) => ({
  id,
  name: `npc_dota_hero_${slug}`,
  localized_name: localized,
  primary_attr: 'agi',
  attack_type: 'Melee',
  roles: ['Carry'],
}))

export const player = {
  profile: {
    account_id: 898936527,
    personaname: 'daqubuwu',
    name: null,
    avatarfull: null,
    profileurl: null,
    last_login: null,
    is_contributor: false,
  },
  rank_tier: 74,
  leaderboard_rank: null,
}

let seed = 7
function rnd() {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
}

export function matches(count, offset) {
  return Array.from({ length: count }, (_, i) => {
    const hero = HERO_NAMES[Math.floor(rnd() * HERO_NAMES.length)]
    return {
      match_id: 8_100_000_000 + offset + i,
      player_slot: rnd() > 0.5 ? 2 : 130,
      radiant_win: rnd() > 0.5,
      duration: 1500 + Math.floor(rnd() * 2400),
      game_mode: 22,
      lobby_type: 7,
      hero_id: hero[0],
      start_time: Math.floor(Date.now() / 1000) - Math.floor((offset + i) * 9000 * (1 + rnd() * 9)),
      version: rnd() > 0.35 ? 21 : null,
      kills: Math.floor(rnd() * 18),
      deaths: Math.floor(rnd() * 12),
      assists: Math.floor(rnd() * 25),
      average_rank: 74,
      gold_per_min: 350 + Math.floor(rnd() * 400),
      xp_per_min: 400 + Math.floor(rnd() * 450),
      last_hits: 80 + Math.floor(rnd() * 400),
      hero_damage: 12000 + Math.floor(rnd() * 40000),
      tower_damage: Math.floor(rnd() * 9000),
      hero_healing: 0,
      party_size: null,
    }
  })
}

export const playerHeroes = HERO_NAMES.map(([id]) => {
  const games = 3 + Math.floor(rnd() * 60)
  return {
    hero_id: String(id),
    games,
    win: Math.floor(games * (0.35 + rnd() * 0.35)),
    with_games: 0,
    with_win: 0,
    against_games: 0,
    against_win: 0,
  }
})

export const peers = []

const STRATZ_POSITIONS = ['POSITION_1', 'POSITION_2', 'POSITION_3', 'POSITION_4', 'POSITION_5']

export function stratzRoleMatches(count = 60) {
  return Array.from({ length: count }, () => ({
    position: STRATZ_POSITIONS[Math.floor(rnd() * STRATZ_POSITIONS.length)],
    isVictory: rnd() > 0.45,
    goldPerMinute: 350 + Math.floor(rnd() * 400),
    experiencePerMinute: 400 + Math.floor(rnd() * 450),
    heroDamage: 12000 + Math.floor(rnd() * 40000),
    kills: Math.floor(rnd() * 18),
    deaths: Math.floor(rnd() * 12),
    assists: Math.floor(rnd() * 25),
  }))
}

export function totals(heroId) {
  if (heroId !== undefined) {
    return [
      { field: 'gold_per_min', n: 12, sum: 12 * (480 + (heroId % 7) * 3) },
      { field: 'xp_per_min', n: 12, sum: 12 * (540 + (heroId % 7) * 3) },
    ]
  }
  return [
    { field: 'kills', n: 40, sum: 320 },
    { field: 'deaths', n: 40, sum: 220 },
    { field: 'assists', n: 40, sum: 480 },
    { field: 'gold_per_min', n: 40, sum: 40 * 520 },
    { field: 'xp_per_min', n: 40, sum: 40 * 610 },
    { field: 'hero_damage', n: 40, sum: 40 * 24000 },
    { field: 'tower_damage', n: 40, sum: 40 * 3200 },
    { field: 'last_hits', n: 40, sum: 40 * 210 },
  ]
}

export function benchmarks(heroId) {
  const curve = (base, spread) =>
    [0.1, 0.25, 0.5, 0.75, 0.9, 0.99].map((percentile) => ({
      percentile,
      value: Math.round(base + (percentile - 0.5) * spread + (heroId % 7) * 3),
    }))

  return {
    hero_id: heroId,
    result: {
      gold_per_min: curve(480, 260),
      xp_per_min: curve(540, 300),
      kills_per_min: curve(0.12, 0.1),
      last_hits_per_min: curve(5, 3),
      hero_damage_per_min: curve(420, 260),
      hero_healing_per_min: curve(20, 30),
      tower_damage: curve(3200, 2600),
    },
  }
}
