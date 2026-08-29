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
