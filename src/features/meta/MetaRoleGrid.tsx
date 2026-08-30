import { useMemo, useState } from 'react'
import type { Hero, HeroStat } from '@/shared/api/types'
import { buildTierRows, BRACKETS } from './tierlist'
import type { BracketKey } from './tierlist'
import { CLASSIC_ROLE_ORDER, classicRole, classicRoleLabel } from './heroRoles'
import { BracketFilter } from './BracketFilter'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { pct } from '@/shared/lib/format'

const PER_ROLE = 5
const MIN_SHARE = 0.05

interface MetaRoleGridProps {
  heroStats: HeroStat[] | undefined
  heroes: Map<number, Hero> | undefined
}

export function MetaRoleGrid({ heroStats, heroes }: MetaRoleGridProps) {
  const [bracket, setBracket] = useState<BracketKey>('pro')

  const rows = useMemo(() => buildTierRows(heroStats, bracket), [heroStats, bracket])
  const maxGames = useMemo(() => Math.max(1, ...rows.map((row) => row.games)), [rows])
  const threshold = maxGames * MIN_SHARE

  const byRole = useMemo(() => {
    const result = new Map<string, typeof rows>()
    for (const role of CLASSIC_ROLE_ORDER) {
      const list = rows
        .filter((row) => row.games >= threshold && classicRole(heroes?.get(row.heroId)?.roles) === role)
        .sort((a, b) => b.winrate - a.winrate)
        .slice(0, PER_ROLE)
      result.set(role, list)
    }
    return result
  }, [rows, heroes, threshold])

  if (rows.length === 0) {
    return <EmptyState title="Нет данных за этот бракет" hint="Попробуйте другой бракет или про-сцену." />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <BracketFilter value={bracket} onChange={setBracket} />
        <span className="text-[11px] text-ink-3">
          {BRACKETS.find((b) => b.key === bracket)?.label} · роли - приближение к классическим 5 позициям
          по тегам OpenDota, не точная статистика позиций
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CLASSIC_ROLE_ORDER.map((role) => {
          const list = byRole.get(role) ?? []
          return (
            <div key={role} className="surface-panel surface-interactive flex flex-col gap-2 p-3.5">
              <span className="text-[12px] font-semibold text-ink">{classicRoleLabel(role)}</span>
              {list.length === 0 ? (
                <span className="text-[11px] text-ink-3">мало данных в этом бракете</span>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {list.map((row) => {
                    const hero = heroes?.get(row.heroId)
                    return (
                      <div key={row.heroId} className="flex items-center gap-2">
                        <HeroIcon hero={hero} size={22} link={false} />
                        <span className="min-w-0 flex-1 truncate text-[12px] text-ink">
                          {hero?.localized_name ?? `Герой ${row.heroId}`}
                        </span>
                        <span
                          className="num shrink-0 text-[12px] font-medium"
                          style={{ color: winrateColor(row.winrate) }}
                        >
                          {pct(row.winrate, 0)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
