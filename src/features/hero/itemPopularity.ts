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
  share: number
}

export type PhaseKey = 'start' | 'early' | 'mid' | 'late'

export interface PhaseGroup {
  key: PhaseKey
  label: string
  timing: string
  items: PopularItem[]
  totalPurchases: number
}

const PHASES: { key: PhaseKey; field: keyof HeroItemPopularity; label: string; timing: string }[] = [
  { key: 'start', field: 'start_game_items', label: 'Старт', timing: 'до выхода линий' },
  { key: 'early', field: 'early_game_items', label: 'Ранняя игра', timing: '~0-10 мин' },
  { key: 'mid', field: 'mid_game_items', label: 'Средняя игра', timing: '~10-25 мин' },
  { key: 'late', field: 'late_game_items', label: 'Поздняя игра', timing: '~25+ мин' },
]

const TOP_N = 6

export function buildPhaseGroups(
  popularity: HeroItemPopularity | undefined,
  items: Map<number, ItemMeta> | undefined,
): PhaseGroup[] {
  if (!popularity || !items) return []

  return PHASES.map(({ key, field, label, timing }) => {
    const raw = popularity[field] ?? {}
    const all = Object.entries(raw)
      .map(([id, count]) => {
        const itemId = Number(id)
        const meta = items.get(itemId)
        return meta ? { itemId, meta, count: Number(count) } : null
      })
      .filter((row): row is { itemId: number; meta: ItemMeta; count: number } => row !== null)

    const totalPurchases = all.reduce((sum, row) => sum + row.count, 0)
    const list: PopularItem[] = all
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_N)
      .map((row) => ({ ...row, share: totalPurchases > 0 ? row.count / totalPurchases : 0 }))

    return { key, label, timing, items: list, totalPurchases }
  })
}
