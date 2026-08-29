import { useMemo, useState } from 'react'
import type { Hero } from '@/shared/api/types'
import { HeroIcon } from '@/shared/ui/HeroIcon'

interface HeroPickerProps {
  heroes: Map<number, Hero> | undefined
  takenIds: Set<number>
  onPick: (heroId: number) => void
}

export function HeroPicker({ heroes, takenIds, onPick }: HeroPickerProps) {
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    if (!heroes) return []
    const needle = query.trim().toLowerCase()
    return [...heroes.values()]
      .filter((hero) => !needle || hero.localized_name.toLowerCase().includes(needle))
      .sort((a, b) => a.localized_name.localeCompare(b.localized_name))
  }, [heroes, query])

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Поиск героя"
        className="h-9 w-full rounded-full border border-line-2 bg-surface px-3.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none sm:w-[240px]"
      />
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-8">
        {list.map((hero) => {
          const taken = takenIds.has(hero.id)
          return (
            <button
              key={hero.id}
              type="button"
              disabled={taken}
              onClick={() => onPick(hero.id)}
              className={`flex flex-col items-center gap-1 rounded-ctl p-1.5 text-center transition-colors ${
                taken ? 'cursor-not-allowed opacity-30' : 'hover:bg-surface-2 active:translate-y-px'
              }`}
            >
              <HeroIcon hero={hero} size={30} link={false} />
              <span className="w-full truncate text-[10px] text-ink-3">{hero.localized_name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
