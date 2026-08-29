import { BRACKETS } from './tierlist'
import type { BracketKey } from './tierlist'

interface BracketFilterProps {
  value: BracketKey
  onChange: (value: BracketKey) => void
}

export function BracketFilter({ value, onChange }: BracketFilterProps) {
  return (
    <div role="tablist" aria-label="Бракет" className="flex flex-wrap gap-1 rounded-full border border-line-2 bg-surface p-1">
      {BRACKETS.map((bracket) => {
        const active = bracket.key === value
        return (
          <button
            key={bracket.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(bracket.key)}
            className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
              active ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {bracket.label}
          </button>
        )
      })}
    </div>
  )
}
