import { useMemo, useState } from 'react'
import type { Hero } from '@/shared/api/types'
import type { RankedMatchup } from './matchups'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { pct } from '@/shared/lib/format'
import { ROLE_ORDER, roleLabel } from '@/features/meta/heroRoles'

interface HeroMatchupsProps {
  best: RankedMatchup[]
  worst: RankedMatchup[]
  heroes: Map<number, Hero> | undefined
}

export function HeroMatchups({ best, worst, heroes }: HeroMatchupsProps) {
  const [role, setRole] = useState<string | null>(null)

  const filteredBest = useMemo(
    () => (role === null ? best : best.filter((row) => heroes?.get(row.heroId)?.roles.includes(role))),
    [best, role, heroes],
  )
  const filteredWorst = useMemo(
    () => (role === null ? worst : worst.filter((row) => heroes?.get(row.heroId)?.roles.includes(role))),
    [worst, role, heroes],
  )

  if (best.length === 0 && worst.length === 0) {
    return (
      <EmptyState
        title="Недостаточно данных по матчапам"
        hint={`Нужно минимум ${20} игр против героя, чтобы попасть в список.`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Роль противника" className="flex flex-wrap gap-1 rounded-full border border-line-2 bg-surface p-1">
        <button
          type="button"
          role="tab"
          aria-selected={role === null}
          onClick={() => setRole(null)}
          className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
            role === null ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
          }`}
        >
          Все роли
        </button>
        {ROLE_ORDER.map((key) => {
          const active = key === role
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setRole(key)}
              className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
                active ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {roleLabel(key)}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MatchupColumn title="Сильнее против" rows={filteredBest} heroes={heroes} />
        <MatchupColumn title="Слабее против" rows={filteredWorst} heroes={heroes} />
      </div>
    </div>
  )
}

interface MatchupColumnProps {
  title: string
  rows: RankedMatchup[]
  heroes: Map<number, Hero> | undefined
}

function MatchupColumn({ title, rows, heroes }: MatchupColumnProps) {
  return (
    <div className="surface-panel flex flex-col gap-3">
      <span className="border-b border-line pb-2.5 text-[12px] font-medium text-ink-2">{title}</span>
      {rows.length === 0 ? (
        <span className="text-[12px] text-ink-3">недостаточно игр под этот фильтр</span>
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {rows.map((row) => {
            const hero = heroes?.get(row.heroId)
            return (
              <div key={row.heroId} className="flex items-center gap-2.5 py-2.5">
                <HeroIcon hero={hero} size={24} />
                <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
                <span className="num ml-auto text-[13px] font-medium" style={{ color: winrateColor(row.winrate) }}>
                  {pct(row.winrate, 0)}
                </span>
                <span className="num w-[56px] shrink-0 text-right text-[11px] text-ink-3">{row.games} игр</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
