const CONSUMABLE_KEYS = new Set([
  'tango',
  'tango_single',
  'flask',
  'enchanted_mango',
  'faerie_fire',
  'tpscroll',
  'ward_observer',
  'ward_sentry',
  'ward_dispenser',
  'dust',
  'smoke_of_deceit',
  'infused_raindrop',
  'courier',
  'animal_courier',
  'clarity',
])

export interface InventorySlot {
  key: string
  since: number
}

interface ItemLookup {
  cost: number
  components: string[]
}

export function simulateInventory(
  purchaseLog: { time: number; key: string }[] | null,
  itemsByKey: Map<string, ItemLookup>,
  cutoff: number | null,
  maxSlots = 6,
): (InventorySlot | null)[] {
  const slots: (InventorySlot | null)[] = Array.from({ length: maxSlots }, () => null)
  if (!purchaseLog) return slots

  const sorted = [...purchaseLog].sort((a, b) => a.time - b.time)

  for (const entry of sorted) {
    if (cutoff !== null && entry.time > cutoff) break
    if (CONSUMABLE_KEYS.has(entry.key)) continue

    const meta = itemsByKey.get(entry.key)
    if (!meta) continue

    let placedSlot = -1

    if (meta.components.length > 0) {
      for (const component of meta.components) {
        const idx = slots.findIndex((slot) => slot?.key === component)
        if (idx !== -1) {
          slots[idx] = null
          if (placedSlot === -1) placedSlot = idx
        }
      }
    }

    if (placedSlot === -1) {
      placedSlot = slots.findIndex((slot) => slot === null)
    }

    if (placedSlot === -1) {
      let oldestIdx = 0
      let oldestTime = Infinity
      slots.forEach((slot, idx) => {
        if (slot && slot.since < oldestTime) {
          oldestTime = slot.since
          oldestIdx = idx
        }
      })
      placedSlot = oldestIdx
    }

    slots[placedSlot] = { key: entry.key, since: entry.time }
  }

  return slots
}
