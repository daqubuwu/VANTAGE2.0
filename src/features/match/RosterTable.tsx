import { Link } from 'react-router-dom'
import type { Hero, MatchPlayer } from '@/shared/api/types'
import { isRadiantSlot } from '@/shared/api/types'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { ItemSlots } from './ItemSlots'
import { valueAtMinute } from './timeline'
import { compact, dec, kda, num } from '@/shared/lib/format'

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

  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((player) => {
        const hero = heroes?.get(player.hero_id)
        const gold = minute === null ? player.gold_t?.[player.gold_t.length - 1] : valueAtMinute(player.gold_t, minute)
        const xp = minute === null ? player.xp_t?.[player.xp_t.length - 1] : valueAtMinute(player.xp_t, minute)
        const lastHits = minute === null ? player.last_hits : valueAtMinute(player.lh_t, minute)
        const gpm = minute === null || minute === 0 ? player.gold_per_min : gold !== null && gold !== undefined ? Math.round(gold / Math.max(1, minute)) : null

        return (
          <div
            key={player.player_slot}
            className="grid grid-cols-[minmax(0,1fr)_28px_92px_64px_64px_64px_auto] items-center gap-3 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <HeroIcon hero={hero} size={28} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] text-ink">{hero?.localized_name ?? '—'}</span>
                {player.account_id ? (
                  <Link to={`/player/${player.account_id}`} className="truncate text-[11px] text-ink-3 hover:text-accent">
                    {player.personaname ?? `ID ${player.account_id}`}
                  </Link>
                ) : (
                  <span className="truncate text-[11px] text-ink-3">аноним</span>
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
          </div>
        )
      })}
    </div>
  )
}
