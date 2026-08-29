import type { HeroItemPopularity } from '@/shared/api/types'

export interface ItemMeta {
  key: string
  dname: string
  cost: number
}

export interface PopularItem {
  itemId: number
  meta: ItemMeta
  count: number
}

export type PhaseKey = 'start' | 'early' | 'mid' | 'late'

export interface PhaseGroup {
  key: PhaseKey
  label: string
  items: PopularItem[]
}

const PHASES: { key: PhaseKey; field: keyof HeroItemPopularity; label: string }[] = [
  { key: 'start', field: 'start_game_items', label: 'Старт' },
  { key: 'early', field: 'early_game_items', label: 'Ранняя игра' },
  { key: 'mid', field: 'mid_game_items', label: 'Средняя игра' },
  { key: 'late', field: 'late_game_items', label: 'Поздняя игра' },
]

const TOP_N = 6

export function buildPhaseGroups(
  popularity: HeroItemPopularity | undefined,
  items: Map<number, ItemMeta> | undefined,
): PhaseGroup[] {
  if (!popularity || !items) return []

  return PHASES.map(({ key, field, label }) => {
    const raw = popularity[field] ?? {}
    const list = Object.entries(raw)
      .map(([id, count]) => {
        const itemId = Number(id)
        const meta = items.get(itemId)
        return meta ? { itemId, meta, count: Number(count) } : null
      })
      .filter((row): row is PopularItem => row !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_N)

    return { key, label, items: list }
  })
}
