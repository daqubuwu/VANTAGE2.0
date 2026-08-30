import { ROLES } from './roles'
import type { RoleKey } from './roles'

interface RolePillsProps {
  value: RoleKey | null
  onChange: (value: RoleKey | null) => void
}

export function RolePills({ value, onChange }: RolePillsProps) {
  return (
    <div role="tablist" aria-label="Роль" className="flex flex-wrap gap-1 rounded-full border border-line-2 bg-surface p-1">
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
          value === null ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
        }`}
      >
        Все роли
      </button>
      {ROLES.map((role) => {
        const active = role.key === value
        return (
          <button
            key={role.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(role.key)}
            className={`rounded-full px-3 py-1.5 text-[12px] transition-colors active:translate-y-px ${
              active ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {role.label}
          </button>
        )
      })}
    </div>
  )
}
