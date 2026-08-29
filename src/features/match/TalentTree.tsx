import type { AbilityConstant } from '@/shared/api/queries'
import type { AbilityBuild } from './talents'

interface TalentTreeProps {
  build: AbilityBuild
  abilities: Record<string, AbilityConstant> | undefined
}

function label(name: string, abilities: Record<string, AbilityConstant> | undefined) {
  const dname = abilities?.[name]?.dname
  if (dname) return dname
  return name.replace('special_bonus_', '').replace(/_/g, ' ')
}

export function TalentTree({ build, abilities }: TalentTreeProps) {
  if (build.talents.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {build.talents.map((tier) => (
        <div key={tier.level} className="flex items-center gap-2">
          <span className="num w-6 shrink-0 text-[11px] text-ink-3">{tier.level}</span>
          <div className="flex flex-1 gap-2">
            {tier.options.map((option) => (
              <span
                key={option.name}
                className={`flex-1 rounded-ctl border px-2.5 py-1.5 text-[12px] ${
                  option.picked
                    ? 'border-warm/40 bg-warm/10 text-ink'
                    : 'border-line text-ink-3'
                }`}
              >
                {label(option.name, abilities)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
