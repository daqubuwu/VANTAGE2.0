import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Hero, MatchPlayer } from '@/shared/api/types'
import { isRadiantSlot } from '@/shared/api/types'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { ItemSlots } from './ItemSlots'
import { itemSlotIds, neutralItemId } from './itemSlotFields'
import { valueAtMinute } from './timeline'
import { compact, dec, kda, num } from '@/shared/lib/format'
import { LockSimple, ListBullets, CaretUp } from '@phosphor-icons/react'

interface ItemMeta {
  key: string
  dname: string
  cost: number
}

interface RosterTableProps {
  players: MatchPlayer[]
  heroes: Map<number, Hero> | undefined
  items: Map<number, ItemMeta> | undefined
  side: 'radiant' | 'dire'
  minute: number | null
}

export function RosterTable({ players, heroes, items, side, minute }: RosterTableProps) {
  const rows = players.filter((player) => isRadiantSlot(player.player_slot) === (side === 'radiant'))
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  function toggle(slot: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(slot)) next.delete(slot)
      else next.add(slot)
      return next
    })
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((player) => {
        const hero = heroes?.get(player.hero_id)
        const gold = minute === null ? player.gold_t?.[player.gold_t.length - 1] : valueAtMinute(player.gold_t, minute)
        const xp = minute === null ? player.xp_t?.[player.xp_t.length - 1] : valueAtMinute(player.xp_t, minute)
        const lastHits = minute === null ? player.last_hits : valueAtMinute(player.lh_t, minute)
        const gpm = minute === null || minute === 0 ? player.gold_per_min : gold !== null && gold !== undefined ? Math.round(gold / Math.max(1, minute)) : null
        const isOpen = expanded.has(player.player_slot)

        const finalItemNames = items
          ? [...itemSlotIds(player), neutralItemId(player)]
              .map((id) => (id ? items.get(id)?.dname : undefined))
              .filter((name): name is string => Boolean(name))
          : []

        return (
          <div key={player.player_slot} className="flex flex-col gap-2 py-2.5">
            <div className="grid grid-cols-[minmax(0,1fr)_28px_92px_64px_64px_64px_auto_20px] items-center gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <HeroIcon hero={hero} size={28} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? '—'}</span>
                  {player.account_id ? (
                    <Link to={`/player/${player.account_id}`} className="truncate text-[11px] text-ink-3 hover:text-accent">
                      {player.personaname ?? `ID ${player.account_id}`}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 truncate text-[11px] text-ink-3">
                      <LockSimple size={11} />
                      закрытый профиль
                    </span>
                  )}
                </span>
              </span>

              <span className="num text-right text-[12px] text-ink-3">{player.level}</span>

              <span className="text-right">
                <span className="num text-[13px] text-ink">
                  {player.kills}/{player.deaths}/{player.assists}
                </span>
                <span className="block text-[11px] text-ink-3">KDA {dec(kda(player.kills, player.deaths, player.assists), 2)}</span>
              </span>

              <span className="text-right">
                <span className="num text-[13px] text-gold">{num(gpm)}</span>
                <span className="block text-[11px] text-ink-3">GPM</span>
              </span>

              <span className="text-right">
                <span className="num text-[13px] text-ink-2">{num(lastHits)}</span>
                <span className="block text-[11px] text-ink-3">ЛХ</span>
              </span>

              <span className="text-right">
                <span className="num text-[13px] text-xp">{compact(xp)}</span>
                <span className="block text-[11px] text-ink-3">XP</span>
              </span>

              <ItemSlots player={player} items={items} upToMinute={minute} />

              {finalItemNames.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggle(player.player_slot)}
                  aria-label="Показать итоговую сборку"
                  className="flex h-7 w-5 shrink-0 items-center justify-center text-ink-3 transition-colors hover:text-accent"
                >
                  {isOpen ? <CaretUp size={13} /> : <ListBullets size={13} />}
                </button>
              )}
            </div>

            {isOpen && finalItemNames.length > 0 && (
              <div className="ml-[40px] text-[11px] text-ink-3">
                Итоговая сборка: {finalItemNames.join(' · ')}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
