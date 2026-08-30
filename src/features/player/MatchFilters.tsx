import { useEffect, useMemo, useRef, useState } from 'react'
import type { Hero } from '@/shared/api/types'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { ROLES } from './roles'
import type { RoleKey } from './roles'
import { CaretDown, X } from '@phosphor-icons/react'

export type OutcomeKey = 'all' | 'win' | 'loss'

const OUTCOMES: { key: OutcomeKey; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'win', label: 'Победы' },
  { key: 'loss', label: 'Поражения' },
]

export interface MatchFiltersState {
  heroId: number | null
  outcome: OutcomeKey
  role: RoleKey | null
}

interface MatchFiltersProps {
  heroes: Map<number, Hero> | undefined
  state: MatchFiltersState
  onChange: (state: MatchFiltersState) => void
  roleFilterAvailable: boolean
}

export function MatchFilters({ heroes, state, onChange, roleFilterAvailable }: MatchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <HeroFilterField
        heroes={heroes}
        value={state.heroId}
        onChange={(heroId) => onChange({ ...state, heroId })}
      />

      <div role="tablist" aria-label="Исход" className="flex gap-1 rounded-full border border-line-2 bg-surface p-1">
        {OUTCOMES.map((outcome) => {
          const active = outcome.key === state.outcome
          return (
            <button
              key={outcome.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange({ ...state, outcome: outcome.key })}
              className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
                active ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {outcome.label}
            </button>
          )
        })}
      </div>

      {roleFilterAvailable && (
        <div role="tablist" aria-label="Роль" className="flex flex-wrap gap-1 rounded-full border border-line-2 bg-surface p-1">
          <button
            type="button"
            role="tab"
            aria-selected={state.role === null}
            onClick={() => onChange({ ...state, role: null })}
            className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
              state.role === null ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            Все роли
          </button>
          {ROLES.map((role) => {
            const active = role.key === state.role
            return (
              <button
                key={role.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange({ ...state, role: role.key })}
                className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
                  active ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`}
              >
                {role.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface HeroFilterFieldProps {
  heroes: Map<number, Hero> | undefined
  value: number | null
  onChange: (heroId: number | null) => void
}

function HeroFilterField({ heroes, value, onChange }: HeroFilterFieldProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const list = useMemo(() => {
    if (!heroes) return []
    const needle = query.trim().toLowerCase()
    return [...heroes.values()]
      .filter((hero) => !needle || hero.localized_name.toLowerCase().includes(needle))
      .sort((a, b) => a.localized_name.localeCompare(b.localized_name))
  }, [heroes, query])

  const selected = value !== null ? heroes?.get(value) : undefined

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-full border border-line-2 bg-surface px-3 text-[13px] text-ink-2 transition-colors hover:border-accent/40 hover:text-ink"
      >
        {selected ? (
          <>
            <HeroIcon hero={selected} size={18} link={false} />
            <span className="text-ink">{selected.localized_name}</span>
          </>
        ) : (
          <span>Все герои</span>
        )}
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Сбросить фильтр героя"
            onClick={(event) => {
              event.stopPropagation()
              onChange(null)
            }}
            className="ml-1 text-ink-3 hover:text-ink"
          >
            <X size={13} />
          </span>
        ) : (
          <CaretDown size={12} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-[260px] rounded-panel border border-line-2 bg-surface p-2.5 shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск героя"
            className="mb-2 h-8 w-full rounded-full border border-line-2 bg-bg px-3 text-[12px] text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none"
          />
          <div className="grid max-h-[240px] grid-cols-5 gap-1 overflow-y-auto">
            {list.map((hero) => (
              <button
                key={hero.id}
                type="button"
                title={hero.localized_name}
                onClick={() => {
                  onChange(hero.id)
                  setOpen(false)
                  setQuery('')
                }}
                className={`flex items-center justify-center rounded-ctl p-1 transition-colors hover:bg-surface-2 ${
                  hero.id === value ? 'bg-accent/15' : ''
                }`}
              >
                <HeroIcon hero={hero} size={26} link={false} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
