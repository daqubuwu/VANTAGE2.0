import type { MatchPlayer } from '@/shared/api/types'

export const ITEM_SLOT_FIELDS = ['item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5'] as const

export function itemSlotIds(player: MatchPlayer) {
  return ITEM_SLOT_FIELDS.map((field) => player[field])
}

export function purchaseTime(player: MatchPlayer, itemKey: string | undefined) {
  if (!itemKey) return null
  const log = player.purchase_log ?? []
  const entry = log.find((row) => row.key === itemKey || row.key === `item_${itemKey}`)
  return entry ? entry.time : null
}
