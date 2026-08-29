import type { Hero, PlayerHeroRow } from '@/shared/api/types'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { pct } from '@/shared/lib/format'

interface CompareHeroRowProps {
  hero: Hero | undefined
  a: PlayerHeroRow
  b: PlayerHeroRow
}

export function CompareHeroRow({ hero, a, b }: CompareHeroRowProps) {
  const wrA = a.games > 0 ? a.win / a.games : 0
  const wrB = b.games > 0 ? b.win / b.games : 0

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
      <span className="num text-right text-[13px] text-ink-2">
        {a.games} игр, {pct(wrA, 0)}
      </span>
      <span className="flex items-center gap-2">
        <HeroIcon hero={hero} size={26} link={false} />
        <span className="text-[12px] text-ink-3">{hero?.localized_name ?? 'герой'}</span>
      </span>
      <span className="num text-left text-[13px] text-ink-2">
        {b.games} игр, {pct(wrB, 0)}
      </span>
    </div>
  )
}
