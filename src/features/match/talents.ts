import type { HeroAbilityConstant } from '@/shared/api/queries'

const TALENT_LEVELS = [10, 15, 20, 25] as const

export interface TalentTier {
  level: number
  options: { name: string; picked: boolean }[]
}

export interface SkillPick {
  level: number
  name: string
}

export interface AbilityBuild {
  skills: SkillPick[]
  talents: TalentTier[]
}

export function buildAbilityBuild(
  heroAbilities: HeroAbilityConstant | undefined,
  abilityIds: Record<string, string> | undefined,
  upgrades: number[] | null,
): AbilityBuild {
  if (!heroAbilities || !abilityIds || !upgrades) {
    return { skills: [], talents: [] }
  }

  const talentNames = new Set(heroAbilities.talents.map((talent) => talent.name))
  const pickedNames = new Set<string>()
  const skills: SkillPick[] = []

  upgrades.forEach((id, index) => {
    const name = abilityIds[String(id)]
    if (!name) return
    if (talentNames.has(name)) {
      pickedNames.add(name)
      return
    }
    skills.push({ level: index + 1, name })
  })

  const byLevel = new Map<number, string[]>()
  for (const talent of heroAbilities.talents) {
    const list = byLevel.get(talent.level) ?? []
    list.push(talent.name)
    byLevel.set(talent.level, list)
  }

  const talents: TalentTier[] = TALENT_LEVELS.map((level) => ({
    level,
    options: (byLevel.get(level) ?? []).map((name) => ({ name, picked: pickedNames.has(name) })),
  })).reverse()

  return { skills, talents }
}
