import { describe, it, expect } from 'vitest'
import { aggregate, isWin, rollingWinrate } from './aggregate'
import type { PlayerMatch } from '@/shared/api/types'

function make(partial: Partial<PlayerMatch>): PlayerMatch {
  return {
    match_id: 1,
    player_slot: 0,
    radiant_win: true,
    duration: 2400,
    game_mode: 22,
    lobby_type: 7,
    hero_id: 1,
    start_time: 1_700_000_000,
    version: 21,
    kills: 5,
    deaths: 5,
    assists: 10,
    average_rank: 80,
    gold_per_min: 500,
    xp_per_min: 600,
    last_hits: 200,
    hero_damage: 20000,
    tower_damage: 3000,
    hero_healing: 0,
    party_size: null,
    ...partial,
  }
}

describe('isWin', () => {
  it('radiant слот выигрывает при победе radiant', () => {
    expect(isWin(make({ player_slot: 2, radiant_win: true }))).toBe(true)
    expect(isWin(make({ player_slot: 2, radiant_win: false }))).toBe(false)
  })

  it('dire слот выигрывает при поражении radiant', () => {
    expect(isWin(make({ player_slot: 130, radiant_win: false }))).toBe(true)
    expect(isWin(make({ player_slot: 130, radiant_win: true }))).toBe(false)
  })

  it('неизвестный исход не считается', () => {
    expect(isWin(make({ radiant_win: null }))).toBe(null)
  })
})

describe('aggregate', () => {
  it('пустой список не ломается', () => {
    const result = aggregate([])
    expect(result.games).toBe(0)
    expect(result.winrate).toBe(null)
    expect(result.avgGpm).toBe(null)
  })

  it('винрейт считается только по решённым матчам', () => {
    const result = aggregate([
      make({ player_slot: 0, radiant_win: true }),
      make({ player_slot: 0, radiant_win: false }),
      make({ radiant_win: null }),
    ])
    expect(result.games).toBe(3)
    expect(result.winrate).toBe(0.5)
  })

  it('пропуски в метриках не обнуляют среднее', () => {
    const result = aggregate([
      make({ gold_per_min: 600 }),
      make({ gold_per_min: null }),
      make({ gold_per_min: 400 }),
    ])
    expect(result.avgGpm).toBe(500)
  })

  it('kda не делит на ноль', () => {
    const result = aggregate([make({ kills: 4, deaths: 0, assists: 6 })])
    expect(result.avgKda).toBe(10)
  })

  it('доля распарсенных матчей', () => {
    const result = aggregate([make({ version: 21 }), make({ version: null })])
    expect(result.parsedShare).toBe(0.5)
  })
})

describe('rollingWinrate', () => {
  it('окно не выходит за начало выборки', () => {
    const matches = [
      make({ match_id: 1, start_time: 100, radiant_win: true, player_slot: 0 }),
      make({ match_id: 2, start_time: 200, radiant_win: false, player_slot: 0 }),
    ]
    const points = rollingWinrate(matches, 10)
    expect(points).toHaveLength(2)
    expect(points[0]?.value).toBe(1)
    expect(points[1]?.value).toBe(0.5)
    expect(points[1]?.games).toBe(2)
    expect(points[1]?.fullWindow).toBe(false)
  })

  it('матчи без исхода пропускаются', () => {
    const points = rollingWinrate([make({ radiant_win: null })], 10)
    expect(points).toHaveLength(0)
  })
})
