import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { EmptyState } from '@/shared/ui/States'

export function NotFoundPage() {
  useDocumentTitle('Страница не найдена')
  return (
    <EmptyState
      title="Такой страницы нет"
      hint="Проверьте адрес или вернитесь на главную."
      action={
        <Link
          to="/"
          className="mt-1 rounded-full border border-line-2 bg-surface-2 px-4 py-2 text-[13px] text-ink transition-colors hover:border-accent/40"
        >
          На главную
        </Link>
      }
    />
  )
}
