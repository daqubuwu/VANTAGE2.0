import type { Hero, PlayerHeroRow } from '@/shared/api/types'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { winrateColor } from '@/features/player/chartColor'
import { pct } from '@/shared/lib/format'

interface CompareHeroRowProps {
  hero: Hero | undefined
  a: PlayerHeroRow
  b: PlayerHeroRow
}

export function CompareHeroRow({ hero, a, b }: CompareHeroRowProps) {
  const wrA = a.games > 0 ? a.win / a.games : 0
  const wrB = b.games > 0 ? b.win / b.games : 0
  const totalGames = a.games + b.games
  const shareA = totalGames > 0 ? a.games / totalGames : 0.5

  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="num text-right text-[13px] font-medium" style={{ color: winrateColor(wrA) }}>
          {a.games} игр · {pct(wrA, 0)}
        </span>
        <span className="flex items-center gap-2">
          <HeroIcon hero={hero} size={26} link={false} />
          <span className="text-[12px] text-ink-3">{hero?.localized_name ?? 'герой'}</span>
        </span>
        <span className="num text-left text-[13px] font-medium" style={{ color: winrateColor(wrB) }}>
          {pct(wrB, 0)} · {b.games} игр
        </span>
      </div>
      <div className="flex h-[3px] overflow-hidden rounded-full bg-line">
        <div className="h-full bg-accent" style={{ width: `${shareA * 100}%` }} />
        <div className="h-full bg-ink-3" style={{ width: `${(1 - shareA) * 100}%` }} />
      </div>
    </div>
  )
}
