const CDN = 'https://cdn.cloudflare.steamstatic.com'

function shortName(heroName: string) {
  return heroName.replace('npc_dota_hero_', '')
}

export function heroImage(heroName: string) {
  return `${CDN}/apps/dota2/images/dota_react/heroes/${shortName(heroName)}.png`
}

export function heroIcon(heroName: string) {
  return `${CDN}/apps/dota2/images/dota_react/heroes/icons/${shortName(heroName)}.png`
}

export function heroPortrait(heroName: string) {
  return `${CDN}/apps/dota2/images/dota_react/heroes/crops/${shortName(heroName)}.png`
}

export function itemImage(itemName: string) {
  return `${CDN}/apps/dota2/images/dota_react/items/${itemName}.png`
}

export function abilityImage(abilityName: string) {
  return `${CDN}/apps/dota2/images/dota_react/abilities/${abilityName}.png`
}

const RANK_BASE = 'https://www.opendota.com/assets/images/dota2/rank_icons'

export function rankIcon(rankTier: number | null) {
  const medal = rankTier ? Math.floor(rankTier / 10) : 0
  return `${RANK_BASE}/rank_icon_${Math.max(0, Math.min(8, medal))}.png`
}

export function rankStar(rankTier: number | null) {
  if (!rankTier) return null
  const medal = Math.floor(rankTier / 10)
  const star = rankTier % 10
  if (medal >= 8 || star === 0) return null
  return `${RANK_BASE}/rank_star_${star}.png`
}

const RANK_NAMES = [
  'Без ранга',
  'Рекрут',
  'Страж',
  'Рыцарь',
  'Герой',
  'Легенда',
  'Властелин',
  'Божество',
  'Титан',
]

export function rankName(rankTier: number | null) {
  if (!rankTier) return 'Без ранга'
  const medal = Math.floor(rankTier / 10)
  const star = rankTier % 10
  const base = RANK_NAMES[medal] ?? 'Без ранга'
  return medal >= 8 || star === 0 ? base : `${base} ${star}`
}
