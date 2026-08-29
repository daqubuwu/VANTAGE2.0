import type { ReactNode } from 'react'
import { Warning, MagnifyingGlass, ArrowClockwise } from '@phosphor-icons/react'

interface EmptyStateProps {
  title: string
  hint?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, hint, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="text-ink-3">{icon ?? <MagnifyingGlass size={28} />}</div>
      <p className="text-[15px] font-medium text-ink-2">{title}</p>
      {hint && <p className="max-w-[380px] text-[13px] text-ink-3">{hint}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Не удалось загрузить', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-line-2 bg-surface px-6 py-10 text-center">
      <Warning size={28} className="text-loss" />
      <p className="text-[15px] font-medium text-ink">{title}</p>
      <p className="max-w-[420px] text-[13px] text-ink-3">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface-2 px-4 py-2 text-[13px] text-ink transition-colors hover:border-accent/40 hover:bg-surface-3 active:translate-y-px"
        >
          <ArrowClockwise size={15} />
          Повторить
        </button>
      )}
    </div>
  )
}
