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

const ITEM_NAMES = ['blink', 'black_king_bar', 'power_treads', 'magic_wand', 'aghanims_scepter', 'butterfly']

export const items = Object.fromEntries(
  ITEM_NAMES.map((key, i) => [
    key,
    { id: i + 1, dname: key.replace(/_/g, ' '), img: `/${key}.png`, cost: 1000 + i * 500 },
  ]),
)

export const abilityIds = {
  1: 'antimage_mana_break',
  2: 'antimage_blink',
  3: 'special_bonus_unique_antimage_2',
  4: 'special_bonus_unique_antimage_5',
  5: 'special_bonus_unique_antimage_6',
  6: 'special_bonus_unique_antimage_7',
}

export const abilities = {
  antimage_mana_break: { dname: 'Mana Break', img: '/mana_break.png' },
  antimage_blink: { dname: 'Blink', img: '/blink_ability.png' },
  special_bonus_unique_antimage_1: { dname: '+15 урона по героям' },
  special_bonus_unique_antimage_2: { dname: '+8% уклонения' },
  special_bonus_unique_antimage_3: { dname: '+250 запаса маны' },
  special_bonus_unique_antimage_4: { dname: '+20% магического сопротивления' },
  special_bonus_unique_antimage_5: { dname: '-3с перезарядки Blink' },
  special_bonus_unique_antimage_6: { dname: '+20 к скорости атаки' },
  special_bonus_unique_antimage_7: { dname: '+2 маны в секунду' },
  special_bonus_unique_antimage_8: { dname: '+1 к дальности Blink' },
}

export const heroStats = HERO_NAMES.map(([id, slug, localized]) => {
  const stat = {
    id,
    name: `npc_dota_hero_${slug}`,
    localized_name: localized,
    primary_attr: 'agi',
    attack_type: 'Melee',
    roles: ['Carry'],
    img: `/${slug}.png`,
    icon: `/${slug}_icon.png`,
    base_health: 200,
    move_speed: 300 + Math.floor(rnd() * 30),
    pro_pick: 20 + Math.floor(rnd() * 200),
    pro_win: 0,
    pro_ban: Math.floor(rnd() * 100),
  }
  stat.pro_win = Math.floor(stat.pro_pick * (0.35 + rnd() * 0.3))
  for (let bracket = 1; bracket <= 8; bracket += 1) {
    const pick = 200 + Math.floor(rnd() * 4000)
    stat[`${bracket}_pick`] = pick
    stat[`${bracket}_win`] = Math.floor(pick * (0.4 + rnd() * 0.2))
  }
  return stat
})

export function heroMatchups(heroId) {
  return HERO_NAMES.filter(([id]) => id !== heroId).map(([id]) => {
    const games = 15 + Math.floor(rnd() * 400)
    return {
      hero_id: id,
      games_played: games,
      wins: Math.floor(games * (0.3 + rnd() * 0.4)),
    }
  })
}

export function heroDurations(heroId) {
  void heroId
  const bins = [900, 1500, 2100, 2700, 3300]
  return bins.map((bin) => {
    const games = 40 + Math.floor(rnd() * 300)
    return { duration_bin: bin, games_played: games, wins: Math.floor(games * (0.35 + rnd() * 0.3)) }
  })
}

export function heroItemPopularity(heroId) {
  void heroId
  const phase = () =>
    Object.fromEntries(ITEM_NAMES.map((_, i) => [String(i + 1), 5 + Math.floor(rnd() * 400)]))
  return {
    start_game_items: phase(),
    early_game_items: phase(),
    mid_game_items: phase(),
    late_game_items: phase(),
  }
}

export const heroAbilities = Object.fromEntries(
  HERO_NAMES.map(([, slug]) => [
    `npc_dota_hero_${slug}`,
    {
      abilities: ['antimage_mana_break', 'antimage_blink'],
      talents: [
        { name: 'special_bonus_unique_antimage_8', level: 25 },
        { name: 'special_bonus_unique_antimage_7', level: 25 },
        { name: 'special_bonus_unique_antimage_6', level: 20 },
        { name: 'special_bonus_unique_antimage_5', level: 20 },
        { name: 'special_bonus_unique_antimage_4', level: 15 },
        { name: 'special_bonus_unique_antimage_3', level: 15 },
        { name: 'special_bonus_unique_antimage_2', level: 10 },
        { name: 'special_bonus_unique_antimage_1', level: 10 },
      ],
    },
  ]),
)

function series(length, base, growth) {
  return Array.from({ length }, (_, i) => Math.round(base + growth * i + rnd() * 40))
}

export function match(matchId) {
  const duration = 2200
  const minutes = Math.floor(duration / 60) + 1

  const players = Array.from({ length: 10 }, (_, i) => {
    const hero = HERO_NAMES[i % HERO_NAMES.length]
    const radiant = i < 5
    const kills = Math.floor(rnd() * 12)
    const deaths = Math.floor(rnd() * 8)
    const assists = Math.floor(rnd() * 15)
    return {
      account_id: 898936527 + i,
      player_slot: radiant ? i : 128 + i,
      hero_id: hero[0],
      personaname: `player_${i}`,
      kills,
      deaths,
      assists,
      net_worth: 12000 + Math.floor(rnd() * 15000),
      gold_per_min: 350 + Math.floor(rnd() * 400),
      xp_per_min: 400 + Math.floor(rnd() * 450),
      last_hits: 80 + Math.floor(rnd() * 300),
      denies: Math.floor(rnd() * 15),
      hero_damage: 10000 + Math.floor(rnd() * 30000),
      tower_damage: Math.floor(rnd() * 6000),
      hero_healing: 0,
      level: 12 + Math.floor(rnd() * 13),
      gold_t: series(minutes, 500, 55),
      xp_t: series(minutes, 300, 70),
      lh_t: series(minutes, 0, 4),
      dn_t: series(minutes, 0, 0.6),
      times: Array.from({ length: minutes }, (_, m) => m * 60),
      kills_log: Array.from({ length: kills }, (_, k) => ({
        time: 60 + Math.floor(rnd() * (duration - 60)),
        key: `npc_dota_hero_${HERO_NAMES[(i + k + 1) % HERO_NAMES.length][1]}`,
      })),
      purchase_log: ITEM_NAMES.slice(0, 4).map((key, k) => ({ time: 120 + k * 300 + Math.floor(rnd() * 60), key })),
      item_0: 1,
      item_1: 2,
      item_2: 3,
      item_3: 0,
      item_4: 0,
      item_5: 0,
      item_neutral: null,
      ability_upgrades_arr: [1, 2, 1, 2, 1, 2, 1, 3, 2, 2, 2, 1, 1, 1, 4, 2, 1, 5, 2, 1, 1, 2, 2, 2, 6],
      lane_efficiency_pct: 60 + Math.floor(rnd() * 40),
      teamfight_participation: rnd(),
      towers_killed: Math.floor(rnd() * 3),
      roshans_killed: rnd() > 0.8 ? 1 : 0,
      benchmarks: null,
      isRadiant: radiant,
    }
  })

  const radiantGoldAdv = Array.from({ length: minutes }, (_, m) => {
    const base = m < 15 ? -m * 300 : (m - 15) * 900 - 15 * 300
    return Math.round(base + (rnd() - 0.5) * 1000)
  })

  return {
    match_id: matchId,
    radiant_win: true,
    duration,
    start_time: Math.floor(Date.now() / 1000) - 3600,
    game_mode: 22,
    lobby_type: 7,
    version: 21,
    radiant_score: players.slice(0, 5).reduce((s, p) => s + p.kills, 0),
    dire_score: players.slice(5).reduce((s, p) => s + p.kills, 0),
    players,
    objectives: [],
    radiant_gold_adv: radiantGoldAdv,
    radiant_xp_adv: radiantGoldAdv.map((v) => Math.round(v * 0.8)),
    picks_bans: null,
  }
}

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
