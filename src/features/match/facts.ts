import type { Hero, Match, MatchPlayer } from '@/shared/api/types'
import { isRadiantSlot } from '@/shared/api/types'
import { kda as kdaOf } from '@/shared/lib/format'

export interface MatchFact {
  text: string
  tone: 'neutral' | 'win' | 'loss'
}

function heroName(heroes: Map<number, Hero> | undefined, player: MatchPlayer) {
  return heroes?.get(player.hero_id)?.localized_name ?? `герой ${player.hero_id}`
}

function playerTone(player: MatchPlayer, radiantWin: boolean) {
  const won = isRadiantSlot(player.player_slot) === radiantWin
  return won ? 'win' : 'loss'
}

function topBy(players: MatchPlayer[], pick: (player: MatchPlayer) => number | null) {
  let best: MatchPlayer | null = null
  let bestValue = -Infinity
  for (const player of players) {
    const value = pick(player)
    if (value === null) continue
    if (value > bestValue) {
      bestValue = value
      best = player
    }
  }
  return best ? { player: best, value: bestValue } : null
}

export function buildMatchFacts(match: Match, heroes: Map<number, Hero> | undefined): MatchFact[] {
  const facts: MatchFact[] = []
  const players = match.players

  const firstBlood = players
    .flatMap((player) => (player.kills_log ?? []).map((entry) => ({ player, time: entry.time, key: entry.key })))
    .sort((a, b) => a.time - b.time)[0]

  if (firstBlood && firstBlood.time >= 0) {
    const minute = Math.floor(firstBlood.time / 60)
    const second = firstBlood.time % 60
    facts.push({
      text: `Первая кровь на ${minute}:${String(second).padStart(2, '0')} - ${heroName(heroes, firstBlood.player)}.`,
      tone: playerTone(firstBlood.player, match.radiant_win),
    })
  }

  const bestKda = topBy(players, (player) => kdaOf(player.kills, player.deaths, player.assists))
  if (bestKda) {
    facts.push({
      text: `Лучший KDA матча - ${heroName(heroes, bestKda.player)}, ${bestKda.value.toFixed(2)} (${bestKda.player.kills}/${bestKda.player.deaths}/${bestKda.player.assists}).`,
      tone: playerTone(bestKda.player, match.radiant_win),
    })
  }

  const bestNetworth = topBy(players, (player) => player.net_worth)
  if (bestNetworth) {
    facts.push({
      text: `Больше всех нетворса собрал ${heroName(heroes, bestNetworth.player)} - ${Math.round(bestNetworth.value / 1000)}k к концу матча.`,
      tone: playerTone(bestNetworth.player, match.radiant_win),
    })
  }

  const bestHeroDamage = topBy(players, (player) => player.hero_damage)
  if (bestHeroDamage) {
    facts.push({
      text: `Больше всего урона по героям нанёс ${heroName(heroes, bestHeroDamage.player)} - ${Math.round(bestHeroDamage.value / 1000)}k.`,
      tone: playerTone(bestHeroDamage.player, match.radiant_win),
    })
  }

  const bestTowers = topBy(players, (player) => player.towers_killed)
  if (bestTowers && bestTowers.value > 0) {
    facts.push({
      text: `Больше всех вышек снёс ${heroName(heroes, bestTowers.player)} - ${bestTowers.value}.`,
      tone: playerTone(bestTowers.player, match.radiant_win),
    })
  }

  const bestRoshan = topBy(players, (player) => player.roshans_killed)
  if (bestRoshan && bestRoshan.value > 0) {
    facts.push({
      text: `На счету ${heroName(heroes, bestRoshan.player)} больше всех Рошанов - ${bestRoshan.value}.`,
      tone: playerTone(bestRoshan.player, match.radiant_win),
    })
  }

  const bestLane = topBy(players, (player) => player.lane_efficiency_pct)
  if (bestLane) {
    facts.push({
      text: `Эффективнее всех отыграл линию ${heroName(heroes, bestLane.player)} - ${bestLane.value}%.`,
      tone: playerTone(bestLane.player, match.radiant_win),
    })
  }

  if (match.radiant_gold_adv && match.radiant_gold_adv.length > 0) {
    const winnerLeadValues = match.radiant_gold_adv.map((value) => (match.radiant_win ? value : -value))
    const worstDeficit = Math.min(...winnerLeadValues)
    if (worstDeficit < -3000) {
      facts.push({
        text: `Победившая команда отыгрывалась с отставанием до ${Math.round(Math.abs(worstDeficit) / 1000)}k золота.`,
        tone: 'neutral',
      })
    }
  }

  return facts
}
