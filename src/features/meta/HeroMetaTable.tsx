import { useMemo, useState } from 'react'
import type { Hero } from '@/shared/api/types'
import type { TierRow } from './tierlist'
import { classicRole, classicRoleLabel } from './heroRoles'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { winrateColor } from '@/features/player/chartColor'
import { num, pct } from '@/shared/lib/format'
import { CaretUp, CaretDown } from '@phosphor-icons/react'

type SortKey = 'name' | 'games' | 'share' | 'winrate'

interface HeroMetaTableProps {
  rows: TierRow[]
  heroes: Map<number, Hero> | undefined
}

const HEADERS: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
  { key: 'name', label: 'Герой', align: 'left' },
  { key: 'games', label: 'Игры', align: 'right' },
  { key: 'share', label: 'Доля пиков', align: 'right' },
  { key: 'winrate', label: 'Винрейт', align: 'right' },
]

export function HeroMetaTable({ rows, heroes }: HeroMetaTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('winrate')
  const [desc, setDesc] = useState(true)

  const totalGames = useMemo(() => rows.reduce((sum, row) => sum + row.games, 0), [rows])

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      let diff = 0
      if (sortKey === 'name') {
        const nameA = heroes?.get(a.heroId)?.localized_name ?? ''
        const nameB = heroes?.get(b.heroId)?.localized_name ?? ''
        diff = nameA.localeCompare(nameB)
      } else if (sortKey === 'games') {
        diff = a.games - b.games
      } else if (sortKey === 'share') {
        diff = a.games - b.games
      } else {
        diff = a.winrate - b.winrate
      }
      return desc ? -diff : diff
    })
    return copy
  }, [rows, sortKey, desc, heroes])

  if (rows.length === 0) {
    return <EmptyState title="Нет данных за этот бракет" hint="Попробуйте другой бракет или про-сцену." />
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDesc((v) => !v)
    } else {
      setSortKey(key)
      setDesc(true)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-line text-left text-[11px] text-ink-3">
            {HEADERS.map((header) => (
              <th key={header.key} className={`pb-2 font-normal ${header.align === 'right' ? 'text-right' : 'text-left'}`}>
                <button
                  type="button"
                  onClick={() => toggleSort(header.key)}
                  className={`inline-flex items-center gap-1 transition-colors hover:text-ink ${
                    header.align === 'right' ? 'flex-row-reverse' : ''
                  } ${sortKey === header.key ? 'text-ink' : ''}`}
                >
                  {header.label}
                  {sortKey === header.key &&
                    (desc ? <CaretDown size={11} /> : <CaretUp size={11} />)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sorted.map((row) => {
            const hero = heroes?.get(row.heroId)
            const share = totalGames > 0 ? row.games / totalGames : 0
            return (
              <tr key={row.heroId} className="transition-colors hover:bg-surface-2">
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <HeroIcon hero={hero} size={26} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] text-ink">
                        {hero?.localized_name ?? `Герой ${row.heroId}`}
                      </span>
                      {hero && (
                        <span className="truncate text-[11px] text-ink-3">
                          {classicRoleLabel(classicRole(hero.roles))}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="num py-2.5 text-right text-[13px] text-ink">{num(row.games)}</td>
                <td className="num py-2.5 text-right text-[13px] text-ink-2">{pct(share, 1)}</td>
                <td
                  className="num py-2.5 text-right text-[13px] font-semibold"
                  style={{ color: winrateColor(row.winrate) }}
                >
                  {pct(row.winrate, 1)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
