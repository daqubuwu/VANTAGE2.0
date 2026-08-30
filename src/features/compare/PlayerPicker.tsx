import { useState } from 'react'
import { useSearch } from '@/shared/api/queries'
import { LockSimple } from '@phosphor-icons/react'

interface PlayerPickerProps {
  label: string
  onSelect: (accountId: number) => void
}

export function PlayerPicker({ label, onSelect }: PlayerPickerProps) {
  const [query, setQuery] = useState('')
  const results = useSearch(query)
  const showResults = query.trim().length >= 2

  return (
    <div className="surface-panel flex flex-col gap-2.5 p-4">
      <span className="text-[12px] font-medium text-ink-2">{label}</span>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ник или Steam ID"
        className="h-9 w-full rounded-full border border-line-2 bg-surface px-3.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none"
      />
      {showResults && (
        <div className="flex max-h-[260px] flex-col divide-y divide-line overflow-y-auto">
          {results.isPending ? (
            <span className="py-2 text-[12px] text-ink-3">Ищем</span>
          ) : (results.data ?? []).length === 0 ? (
            <span className="py-2 text-[12px] text-ink-3">Никого не нашли</span>
          ) : (
            (results.data ?? []).slice(0, 10).map((hit) => (
              <button
                key={hit.account_id}
                type="button"
                onClick={() => onSelect(hit.account_id)}
                className="flex items-center gap-2.5 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <span className="h-7 w-7 shrink-0 overflow-hidden rounded-ctl bg-surface-2">
                  {hit.avatarfull ? (
                    <img src={hit.avatarfull} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-ink-3">
                      <LockSimple size={12} />
                    </span>
                  )}
                </span>
                <span className="truncate text-[13px] text-ink">{hit.personaname ?? `Аккаунт ${hit.account_id}`}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
