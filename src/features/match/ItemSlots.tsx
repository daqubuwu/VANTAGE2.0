import type { MatchPlayer } from '@/shared/api/types'
import { itemImage } from '@/shared/api/images'
import { itemSlotIds, neutralItemId, purchaseTime } from './itemSlotFields'
import { Tooltip } from '@/shared/ui/Tooltip'
import { mmss } from '@/shared/lib/format'

interface ItemMeta {
  key: string
  dname: string
  cost: number
}

interface ItemSlotsProps {
  player: MatchPlayer
  items: Map<number, ItemMeta> | undefined
  upToMinute: number | null
}

export function ItemSlots({ player, items, upToMinute }: ItemSlotsProps) {
  const slots = itemSlotIds(player)
  const cutoff = upToMinute === null ? null : upToMinute * 60
  const neutralId = neutralItemId(player)
  const neutralMeta = neutralId ? items?.get(neutralId) : undefined

  return (
    <div className="flex gap-1">
      {slots.map((itemId, i) => {
        const meta = itemId ? items?.get(itemId) : undefined
        const bought = meta ? purchaseTime(player, meta.key) : null
        const hidden = cutoff !== null && bought !== null && bought > cutoff

        return (
          <Tooltip
            key={i}
            variant="entity"
            content={
              meta ? (
                <div className="flex flex-col gap-1">
                  <span className="text-ink">{meta.dname}</span>
                  <span className="num text-ink-3">{meta.cost} золота</span>
                  {bought !== null && <span className="text-ink-3">Куплен на {mmss(bought)}</span>}
                </div>
              ) : (
                'Пустой слот'
              )
            }
          >
            <span className="relative block h-7 w-9 shrink-0 overflow-hidden rounded-[4px] bg-surface-2">
              {meta && !hidden && (
                <img src={itemImage(meta.key)} alt={meta.dname} className="h-full w-full object-cover" loading="lazy" />
              )}
            </span>
          </Tooltip>
        )
      })}
      <Tooltip
        variant="entity"
        content={
          neutralMeta ? (
            <div className="flex flex-col gap-1">
              <span className="text-ink">{neutralMeta.dname}</span>
              <span className="text-ink-3">Нейтральный предмет</span>
            </div>
          ) : (
            'Нейтральный предмет не найден'
          )
        }
      >
        <span className="relative block h-7 w-9 shrink-0 overflow-hidden rounded-[4px] border border-warm/30 bg-surface-2">
          {neutralMeta && (
            <img
              src={itemImage(neutralMeta.key)}
              alt={neutralMeta.dname}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </span>
      </Tooltip>
    </div>
  )
}
