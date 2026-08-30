import type { Hero } from '@/shared/api/types'
import { heroPortrait } from '@/shared/api/images'
import { roleLabel } from '@/features/meta/heroRoles'

const ATTR_LABEL: Record<Hero['primary_attr'], string> = {
  str: 'Сила',
  agi: 'Ловкость',
  int: 'Интеллект',
  all: 'Универсал',
}

const ATTR_TONE: Record<Hero['primary_attr'], string> = {
  str: 'text-loss',
  agi: 'text-win',
  int: 'text-xp',
  all: 'text-accent',
}

export function HeroHeader({ hero }: { hero: Hero }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="block h-[72px] w-[128px] shrink-0 overflow-hidden rounded-panel bg-surface-2">
        <img
          src={heroPortrait(hero.name)}
          alt={hero.localized_name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-semibold text-ink">{hero.localized_name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
          <span className={ATTR_TONE[hero.primary_attr]}>{ATTR_LABEL[hero.primary_attr]}</span>
          <span>{hero.attack_type === 'Melee' ? 'Ближний бой' : 'Дальний бой'}</span>
          {hero.roles.length > 0 && <span>{hero.roles.map(roleLabel).join(', ')}</span>}
        </div>
      </div>
    </div>
  )
}
