interface TabsProps<T extends string> {
  tabs: { key: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
}

export function Tabs<T extends string>({ tabs, value, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-line">
      {tabs.map((tab) => {
        const active = tab.key === value
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`relative -mb-px flex items-center gap-2 border-b-2 pb-2.5 text-[14px] transition-colors ${
              active
                ? 'border-accent text-ink'
                : 'border-transparent text-ink-2 hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="num rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] text-ink-3">
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
