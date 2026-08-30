import type { MatchPlayer } from '@/shared/api/types'

export const ITEM_SLOT_FIELDS = ['item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5'] as const

export function itemSlotIds(player: MatchPlayer) {
  return ITEM_SLOT_FIELDS.map((field) => player[field])
}

export function neutralItemId(player: MatchPlayer) {
  return player.item_neutral
}
