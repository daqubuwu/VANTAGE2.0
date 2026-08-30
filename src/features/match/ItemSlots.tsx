import type { MatchPlayer } from '@/shared/api/types'
import { itemImage } from '@/shared/api/images'
import { itemSlotIds, neutralItemId } from './itemSlotFields'
import { simulateInventory } from './inventorySim'
import { Tooltip } from '@/shared/ui/Tooltip'
import { mmss } from '@/shared/lib/format'

interface ItemMeta {
  key: string
  dname: string
  cost: number
  components: string[]
}

interface ItemSlotsProps {
  player: MatchPlayer
  items: Map<number, ItemMeta> | undefined
  upToMinute: number | null
}

export function ItemSlots({ player, items, upToMinute }: ItemSlotsProps) {
  const cutoff = upToMinute === null ? null : upToMinute * 60
  const neutralId = neutralItemId(player)
  const neutralMeta = neutralId ? items?.get(neutralId) : undefined

  if (cutoff === null || !items) {
    const finalSlots = itemSlotIds(player)
    return (
      <div className="flex gap-1">
        {finalSlots.map((itemId, i) => {
          const meta = itemId ? items?.get(itemId) : undefined
          return <ItemCell key={i} meta={meta} />
        })}
        <NeutralCell meta={neutralMeta} />
      </div>
    )
  }

  const byKey = new Map<string, ItemMeta>()
  for (const meta of items.values()) byKey.set(meta.key, meta)

  const simulated = simulateInventory(player.purchase_log, byKey, cutoff)

  return (
    <div className="flex gap-1">
      {simulated.map((slot, i) => {
        const meta = slot ? byKey.get(slot.key) : undefined
        return <ItemCell key={i} meta={meta} since={slot?.since ?? null} />
      })}
      <NeutralCell meta={neutralMeta} />
    </div>
  )
}

function ItemCell({ meta, since }: { meta: ItemMeta | undefined; since?: number | null }) {
  return (
    <Tooltip
      variant="entity"
      content={
        meta ? (
          <div className="flex flex-col gap-1">
            <span className="text-ink">{meta.dname}</span>
            <span className="num text-ink-3">{meta.cost} золота</span>
            {since != null && <span className="text-ink-3">В инвентаре с {mmss(since)} (оценка)</span>}
          </div>
        ) : (
          'Пустой слот'
        )
      }
    >
      <span className="relative block h-7 w-9 shrink-0 overflow-hidden rounded-[4px] bg-surface-2">
        {meta && <img src={itemImage(meta.key)} alt={meta.dname} crossOrigin="anonymous" className="h-full w-full object-cover" loading="lazy" />}
      </span>
    </Tooltip>
  )
}

function NeutralCell({ meta }: { meta: ItemMeta | undefined }) {
  return (
    <Tooltip
      variant="entity"
      content={
        meta ? (
          <div className="flex flex-col gap-1">
            <span className="text-ink">{meta.dname}</span>
            <span className="text-ink-3">Нейтральный предмет</span>
          </div>
        ) : (
          'Нейтральный предмет не найден'
        )
      }
    >
      <span className="relative block h-7 w-9 shrink-0 overflow-hidden rounded-[4px] border border-warm/30 bg-surface-2">
        {meta && (
          <img src={itemImage(meta.key)} alt={meta.dname} crossOrigin="anonymous" className="h-full w-full object-cover" loading="lazy" />
        )}
      </span>
    </Tooltip>
  )
}
