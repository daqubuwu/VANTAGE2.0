import { useMemo, useState } from 'react'
import type { Hero } from '@/shared/api/types'
import type { TierRow } from '@/features/meta/tierlist'
import { suggestBans } from './bans'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { CLASSIC_ROLE_ORDER, classicRoleLabel } from '@/features/meta/heroRoles'
import { pct } from '@/shared/lib/format'

const PAGE_SIZE = 8

interface BanSuggestionsProps {
  tierRows: TierRow[]
  excludeIds: Set<number>
  heroes: Map<number, Hero> | undefined
  onPick: (heroId: number) => void
}

export function BanSuggestions({ tierRows, excludeIds, heroes, onPick }: BanSuggestionsProps) {
  const [role, setRole] = useState<string | null>(null)
  const [minGames, setMinGames] = useState(0)
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(
    () => suggestBans(tierRows, excludeIds, heroes, { role, minGames }, tierRows.length),
    [tierRows, excludeIds, heroes, role, minGames],
  )
  const page = filtered.slice(0, visible)

  if (tierRows.length === 0) {
    return <EmptyState title="Нет данных меты" hint="Подождите загрузку heroStats." />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Роль" className="flex flex-wrap gap-1 rounded-full border border-line-2 bg-surface p-1">
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
          {CLASSIC_ROLE_ORDER.map((key) => {
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
                {classicRoleLabel(key)}
              </button>
            )
          })}
        </div>

        <label className="flex items-center gap-1.5 text-[12px] text-ink-3">
          мин. игр
          <input
            type="number"
            min={0}
            step={50}
            value={minGames}
            onChange={(event) => setMinGames(Math.max(0, Number(event.target.value) || 0))}
            className="num h-8 w-20 rounded-ctl border border-line-2 bg-surface px-2 text-[12px] text-ink focus:border-accent/50 focus:outline-none"
          />
        </label>
      </div>

      {page.length === 0 ? (
        <EmptyState title="Никто не подошёл под фильтр" hint="Снизьте порог игр или смените роль." />
      ) : (
        <>
          <div className="flex flex-col divide-y divide-line">
            {page.map((row) => {
              const hero = heroes?.get(row.heroId)
              return (
                <button
                  key={row.heroId}
                  type="button"
                  onClick={() => onPick(row.heroId)}
                  className="flex items-center gap-2.5 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  <HeroIcon hero={hero} size={24} link={false} />
                  <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? `Герой ${row.heroId}`}</span>
                  <span className="num ml-auto text-[13px] font-medium" style={{ color: winrateColor(row.winrate) }}>
                    {pct(row.winrate, 0)}
                  </span>
                  <span className="num w-[56px] shrink-0 text-right text-[11px] text-ink-3">{row.games} игр</span>
                </button>
              )
            })}
          </div>

          {visible < filtered.length && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="self-start rounded-full border border-line-2 bg-surface px-3.5 py-1.5 text-[12px] text-ink-2 transition-colors hover:border-accent/40 hover:text-ink active:translate-y-px"
            >
              Показать ещё ({filtered.length - visible})
            </button>
          )}
        </>
      )}
    </div>
  )
}
