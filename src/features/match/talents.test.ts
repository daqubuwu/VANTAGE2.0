import { describe, expect, it } from 'vitest'
import { buildAbilityBuild } from './talents'

const heroAbilities = {
  abilities: ['ability_a', 'ability_b'],
  talents: [
    { name: 'special_bonus_25_a', level: 25 },
    { name: 'special_bonus_25_b', level: 25 },
    { name: 'special_bonus_10_a', level: 10 },
    { name: 'special_bonus_10_b', level: 10 },
  ],
}

const abilityIds: Record<string, string> = {
  '1': 'ability_a',
  '2': 'ability_b',
  '3': 'special_bonus_10_a',
  '4': 'special_bonus_25_b',
}

describe('buildAbilityBuild', () => {
  it('отделяет обычные способности от талантов и помечает выбранные', () => {
    const build = buildAbilityBuild(heroAbilities, abilityIds, [1, 2, 3, 1, 2, 4])

    expect(build.skills).toHaveLength(4)
    expect(build.skills.map((s) => s.name)).toEqual(['ability_a', 'ability_b', 'ability_a', 'ability_b'])

    const tier10 = build.talents.find((t) => t.level === 10)
    expect(tier10?.options.find((o) => o.name === 'special_bonus_10_a')?.picked).toBe(true)
    expect(tier10?.options.find((o) => o.name === 'special_bonus_10_b')?.picked).toBe(false)

    const tier25 = build.talents.find((t) => t.level === 25)
    expect(tier25?.options.find((o) => o.name === 'special_bonus_25_b')?.picked).toBe(true)
  })

  it('без данных о герое возвращает пустой билд', () => {
    expect(buildAbilityBuild(undefined, abilityIds, [1, 2])).toEqual({ skills: [], talents: [] })
  })
})
